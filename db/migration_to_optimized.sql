-- =============================================
-- SCRIPT DE MIGRACIÓN: Schema Simple -> Schema Optimizado
-- =============================================
-- Este script migra la base de datos desde el esquema simple 
-- al nuevo esquema optimizado con normalización completa
-- 
-- IMPORTANTE: Hacer backup de la base de datos antes de ejecutar
-- =============================================

BEGIN;

-- 1. CREAR NUEVAS TABLAS (si no existen)
-- =============================================

-- Tabla de inquilinos/tenants (mejorada)
CREATE TABLE IF NOT EXISTS tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    subdomain VARCHAR(100) UNIQUE NOT NULL,
    domain VARCHAR(255),
    logo_url TEXT,
    business_type VARCHAR(50) DEFAULT 'dealership',
    contact_email VARCHAR(255),
    contact_phone VARCHAR(20),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    postal_code VARCHAR(20),
    country VARCHAR(100) DEFAULT 'México',
    timezone VARCHAR(50) DEFAULT 'America/Mexico_City',
    currency VARCHAR(3) DEFAULT 'MXN',
    language VARCHAR(5) DEFAULT 'es-MX',
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'trial', 'cancelled')),
    subscription_plan VARCHAR(50) DEFAULT 'basic',
    subscription_status VARCHAR(20) DEFAULT 'active',
    trial_ends_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de sucursales
CREATE TABLE IF NOT EXISTS branches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) NOT NULL,
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    postal_code VARCHAR(20),
    phone VARCHAR(20),
    email VARCHAR(255),
    manager_id UUID,
    business_hours JSONB,
    coordinates POINT,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'maintenance')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(tenant_id, code)
);

-- 2. MIGRAR DATOS EXISTENTES
-- =============================================

-- Migrar tenants existentes (solo si la tabla tenants anterior existe y es diferente)
DO $$
BEGIN
    -- Verificar si existe la tabla tenants con estructura antigua
    IF EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'tenants' 
        AND table_schema = 'public'
    ) THEN
        -- Verificar si faltan columnas en la tabla existente
        IF NOT EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_name = 'tenants' 
            AND column_name = 'business_type'
            AND table_schema = 'public'
        ) THEN
            -- Agregar columnas faltantes a la tabla existente
            ALTER TABLE tenants 
            ADD COLUMN IF NOT EXISTS business_type VARCHAR(50) DEFAULT 'dealership',
            ADD COLUMN IF NOT EXISTS contact_email VARCHAR(255),
            ADD COLUMN IF NOT EXISTS contact_phone VARCHAR(20),
            ADD COLUMN IF NOT EXISTS address TEXT,
            ADD COLUMN IF NOT EXISTS city VARCHAR(100),
            ADD COLUMN IF NOT EXISTS state VARCHAR(100),
            ADD COLUMN IF NOT EXISTS postal_code VARCHAR(20),
            ADD COLUMN IF NOT EXISTS country VARCHAR(100) DEFAULT 'México',
            ADD COLUMN IF NOT EXISTS timezone VARCHAR(50) DEFAULT 'America/Mexico_City',
            ADD COLUMN IF NOT EXISTS currency VARCHAR(3) DEFAULT 'MXN',
            ADD COLUMN IF NOT EXISTS language VARCHAR(5) DEFAULT 'es-MX',
            ADD COLUMN IF NOT EXISTS subscription_plan VARCHAR(50) DEFAULT 'basic',
            ADD COLUMN IF NOT EXISTS subscription_status VARCHAR(20) DEFAULT 'active',
            ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMP WITH TIME ZONE;
        END IF;
    END IF;
END $$;

-- 3. CREAR/MIGRAR TABLA user_profiles
-- =============================================

-- Crear nueva tabla user_profiles con estructura completa
CREATE TABLE IF NOT EXISTS user_profiles_new (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    user_type VARCHAR(20) NOT NULL CHECK (user_type IN ('buyer', 'seller', 'dealer')),
    status VARCHAR(30) DEFAULT 'pending_verification' CHECK (status IN ('active', 'suspended', 'pending_verification')),
    email_verified_at TIMESTAMP WITH TIME ZONE,
    phone_verified_at TIMESTAMP WITH TIME ZONE,
    branch_id UUID REFERENCES branches(id),
    role VARCHAR(50),
    full_name VARCHAR(255),
    avatar_url TEXT,
    hire_date DATE,
    termination_date DATE,
    termination_reason TEXT,
    salary DECIMAL(12,2),
    commission_rate DECIMAL(5,2) DEFAULT 5.00,
    employee_id VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(tenant_id, email),
    UNIQUE(tenant_id, employee_id)
);

-- Migrar datos de user_profiles si existe la tabla anterior
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user_profiles') THEN
        -- Migrar datos existentes
        INSERT INTO user_profiles_new (
            id, tenant_id, email, phone, user_type, status, full_name, created_at, updated_at
        )
        SELECT 
            COALESCE(id, gen_random_uuid()),
            tenant_id,
            email,
            phone,
            COALESCE(user_type, 'buyer'),
            COALESCE(status, 'active'),
            full_name,
            COALESCE(created_at, NOW()),
            COALESCE(updated_at, NOW())
        FROM user_profiles
        ON CONFLICT (tenant_id, email) DO NOTHING;
        
        -- Renombrar tablas
        DROP TABLE user_profiles;
        ALTER TABLE user_profiles_new RENAME TO user_profiles;
    ELSE
        -- Si no existe la tabla anterior, simplemente renombrar la nueva
        ALTER TABLE user_profiles_new RENAME TO user_profiles;
    END IF;
END $$;

-- 4. AGREGAR RESTRICCIÓN DE FOREIGN KEY PARA MANAGER
-- =============================================
ALTER TABLE branches 
ADD CONSTRAINT branches_manager_id_fkey 
FOREIGN KEY (manager_id) REFERENCES user_profiles(id);

-- 5. MIGRAR/CREAR TABLA vehicles
-- =============================================

-- Crear nueva tabla vehicles con estructura optimizada
CREATE TABLE IF NOT EXISTS vehicles_new (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    branch_id UUID REFERENCES branches(id),
    vin VARCHAR(17) UNIQUE,
    brand VARCHAR(100) NOT NULL,
    model VARCHAR(100) NOT NULL,
    year INTEGER NOT NULL CHECK (year >= 1900 AND year <= EXTRACT(YEAR FROM NOW()) + 2),
    color VARCHAR(50),
    mileage INTEGER DEFAULT 0,
    fuel_type VARCHAR(20) DEFAULT 'gasoline' CHECK (fuel_type IN ('gasoline', 'diesel', 'electric', 'hybrid', 'gas')),
    transmission VARCHAR(20) CHECK (transmission IN ('manual', 'automatic', 'cvt')),
    engine_size VARCHAR(20),
    doors SMALLINT CHECK (doors >= 2 AND doors <= 6),
    seats SMALLINT CHECK (seats >= 2 AND seats <= 12),
    body_type VARCHAR(30) CHECK (body_type IN ('sedan', 'hatchback', 'suv', 'pickup', 'coupe', 'convertible', 'wagon', 'van', 'motorcycle')),
    condition VARCHAR(20) DEFAULT 'used' CHECK (condition IN ('new', 'used', 'certified')),
    price DECIMAL(12,2) NOT NULL CHECK (price >= 0),
    original_price DECIMAL(12,2),
    cost DECIMAL(12,2),
    description TEXT,
    features TEXT[],
    status VARCHAR(20) DEFAULT 'available' CHECK (status IN ('available', 'sold', 'reserved', 'maintenance', 'hidden')),
    is_featured BOOLEAN DEFAULT FALSE,
    location VARCHAR(255),
    purchase_date DATE,
    sold_at TIMESTAMP WITH TIME ZONE,
    last_service_date DATE,
    next_service_date DATE,
    insurance_expiry DATE,
    registration_expiry DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Migrar datos de vehicles si existe
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'vehicles') THEN
        INSERT INTO vehicles_new (
            id, tenant_id, brand, model, year, color, mileage, price, description, status, created_at, updated_at
        )
        SELECT 
            COALESCE(id, gen_random_uuid()),
            tenant_id,
            brand,
            model,
            year,
            color,
            COALESCE(mileage, 0),
            price,
            description,
            COALESCE(status, 'available'),
            COALESCE(created_at, NOW()),
            COALESCE(updated_at, NOW())
        FROM vehicles
        ON CONFLICT (vin) DO NOTHING;
        
        DROP TABLE vehicles;
        ALTER TABLE vehicles_new RENAME TO vehicles;
    ELSE
        ALTER TABLE vehicles_new RENAME TO vehicles;
    END IF;
END $$;

-- 6. CREAR NUEVAS TABLAS PRINCIPALES
-- =============================================

-- Tabla de imágenes de vehículos
CREATE TABLE IF NOT EXISTS vehicle_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    alt_text VARCHAR(255),
    is_primary BOOLEAN DEFAULT FALSE,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de leads
CREATE TABLE IF NOT EXISTS leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    vehicle_id UUID REFERENCES vehicles(id),
    branch_id UUID REFERENCES branches(id),
    assigned_to UUID REFERENCES user_profiles(id),
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    preferred_contact VARCHAR(20) DEFAULT 'email' CHECK (preferred_contact IN ('email', 'phone', 'whatsapp', 'sms')),
    inquiry_type VARCHAR(20) DEFAULT 'purchase' CHECK (inquiry_type IN ('purchase', 'finance', 'trade_in', 'test_drive', 'info')),
    budget_min DECIMAL(12,2),
    budget_max DECIMAL(12,2),
    financing_needed BOOLEAN DEFAULT FALSE,
    trade_in_vehicle TEXT,
    message TEXT,
    status VARCHAR(20) DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'interested', 'negotiating', 'closed_won', 'closed_lost')),
    priority VARCHAR(10) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    source VARCHAR(20) DEFAULT 'website' CHECK (source IN ('website', 'facebook', 'google', 'referral', 'walk_in', 'phone', 'other')),
    first_contact_at TIMESTAMP WITH TIME ZONE,
    last_contact_at TIMESTAMP WITH TIME ZONE,
    next_followup_at TIMESTAMP WITH TIME ZONE,
    estimated_close_date DATE,
    probability INTEGER CHECK (probability >= 0 AND probability <= 100),
    utm_source VARCHAR(100),
    utm_medium VARCHAR(100),
    utm_campaign VARCHAR(100),
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de actividades de leads
CREATE TABLE IF NOT EXISTS lead_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES user_profiles(id),
    activity_type VARCHAR(20) NOT NULL CHECK (activity_type IN ('call', 'email', 'meeting', 'note', 'status_change', 'assignment')),
    subject VARCHAR(255),
    description TEXT,
    outcome VARCHAR(255),
    next_action VARCHAR(255),
    scheduled_at TIMESTAMP WITH TIME ZONE,
    duration_minutes INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de ventas
CREATE TABLE IF NOT EXISTS sales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    vehicle_id UUID NOT NULL REFERENCES vehicles(id),
    lead_id UUID REFERENCES leads(id),
    branch_id UUID REFERENCES branches(id),
    salesperson_id UUID NOT NULL REFERENCES user_profiles(id),
    manager_id UUID REFERENCES user_profiles(id),
    buyer_full_name VARCHAR(255) NOT NULL,
    buyer_email VARCHAR(255) NOT NULL,
    buyer_phone VARCHAR(20),
    buyer_address TEXT,
    buyer_city VARCHAR(100),
    buyer_state VARCHAR(100),
    buyer_postal_code VARCHAR(20),
    sale_price DECIMAL(12,2) NOT NULL CHECK (sale_price >= 0),
    list_price DECIMAL(12,2) NOT NULL CHECK (list_price >= 0),
    discount_amount DECIMAL(12,2) DEFAULT 0 CHECK (discount_amount >= 0),
    tax_amount DECIMAL(12,2) DEFAULT 0 CHECK (tax_amount >= 0),
    total_amount DECIMAL(12,2) NOT NULL CHECK (total_amount >= 0),
    financing_type VARCHAR(20) CHECK (financing_type IN ('cash', 'loan', 'lease', 'trade_in')),
    down_payment DECIMAL(12,2) DEFAULT 0 CHECK (down_payment >= 0),
    loan_amount DECIMAL(12,2) DEFAULT 0 CHECK (loan_amount >= 0),
    loan_term_months INTEGER CHECK (loan_term_months > 0),
    interest_rate DECIMAL(5,2) CHECK (interest_rate >= 0),
    monthly_payment DECIMAL(10,2) CHECK (monthly_payment >= 0),
    trade_in_vehicle_info TEXT,
    trade_in_value DECIMAL(12,2) DEFAULT 0 CHECK (trade_in_value >= 0),
    commission_rate DECIMAL(5,2) DEFAULT 5.00 CHECK (commission_rate >= 0),
    commission_amount DECIMAL(10,2) DEFAULT 0 CHECK (commission_amount >= 0),
    commission_paid BOOLEAN DEFAULT FALSE,
    commission_paid_at TIMESTAMP WITH TIME ZONE,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'completed', 'cancelled', 'refunded')),
    payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'partial', 'paid', 'overdue', 'refunded')),
    delivery_status VARCHAR(20) DEFAULT 'pending' CHECK (delivery_status IN ('pending', 'scheduled', 'delivered', 'cancelled')),
    contract_date DATE NOT NULL DEFAULT CURRENT_DATE,
    delivery_date DATE,
    warranty_start_date DATE,
    warranty_end_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. CREAR ÍNDICES PARA OPTIMIZACIÓN
-- =============================================

-- Índices para tenants
CREATE INDEX IF NOT EXISTS idx_tenants_subdomain ON tenants(subdomain);
CREATE INDEX IF NOT EXISTS idx_tenants_status ON tenants(status);

-- Índices para user_profiles
CREATE INDEX IF NOT EXISTS idx_user_profiles_tenant_id ON user_profiles(tenant_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_type ON user_profiles(user_type);
CREATE INDEX IF NOT EXISTS idx_user_profiles_status ON user_profiles(status);
CREATE INDEX IF NOT EXISTS idx_user_profiles_branch_id ON user_profiles(branch_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_employee_id ON user_profiles(employee_id);

-- Índices para branches
CREATE INDEX IF NOT EXISTS idx_branches_tenant_id ON branches(tenant_id);
CREATE INDEX IF NOT EXISTS idx_branches_manager_id ON branches(manager_id);
CREATE INDEX IF NOT EXISTS idx_branches_status ON branches(status);

-- Índices para vehicles
CREATE INDEX IF NOT EXISTS idx_vehicles_tenant_id ON vehicles(tenant_id);
CREATE INDEX IF NOT EXISTS idx_vehicles_branch_id ON vehicles(branch_id);
CREATE INDEX IF NOT EXISTS idx_vehicles_brand_model ON vehicles(brand, model);
CREATE INDEX IF NOT EXISTS idx_vehicles_year ON vehicles(year);
CREATE INDEX IF NOT EXISTS idx_vehicles_price ON vehicles(price);
CREATE INDEX IF NOT EXISTS idx_vehicles_status ON vehicles(status);
CREATE INDEX IF NOT EXISTS idx_vehicles_is_featured ON vehicles(is_featured);
CREATE INDEX IF NOT EXISTS idx_vehicles_created_at ON vehicles(created_at);

-- Índices para vehicle_images
CREATE INDEX IF NOT EXISTS idx_vehicle_images_vehicle_id ON vehicle_images(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_images_is_primary ON vehicle_images(is_primary);

-- Índices para leads
CREATE INDEX IF NOT EXISTS idx_leads_tenant_id ON leads(tenant_id);
CREATE INDEX IF NOT EXISTS idx_leads_vehicle_id ON leads(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_leads_branch_id ON leads(branch_id);
CREATE INDEX IF NOT EXISTS idx_leads_assigned_to ON leads(assigned_to);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_priority ON leads(priority);
CREATE INDEX IF NOT EXISTS idx_leads_source ON leads(source);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at);
CREATE INDEX IF NOT EXISTS idx_leads_next_followup_at ON leads(next_followup_at);

-- Índices para lead_activities
CREATE INDEX IF NOT EXISTS idx_lead_activities_lead_id ON lead_activities(lead_id);
CREATE INDEX IF NOT EXISTS idx_lead_activities_user_id ON lead_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_lead_activities_activity_type ON lead_activities(activity_type);
CREATE INDEX IF NOT EXISTS idx_lead_activities_created_at ON lead_activities(created_at);

-- Índices para sales
CREATE INDEX IF NOT EXISTS idx_sales_tenant_id ON sales(tenant_id);
CREATE INDEX IF NOT EXISTS idx_sales_vehicle_id ON sales(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_sales_salesperson_id ON sales(salesperson_id);
CREATE INDEX IF NOT EXISTS idx_sales_branch_id ON sales(branch_id);
CREATE INDEX IF NOT EXISTS idx_sales_status ON sales(status);
CREATE INDEX IF NOT EXISTS idx_sales_contract_date ON sales(contract_date);
CREATE INDEX IF NOT EXISTS idx_sales_created_at ON sales(created_at);

-- 8. CREAR TRIGGERS PARA ACTUALIZACIÓN AUTOMÁTICA
-- =============================================

-- Función para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para updated_at
CREATE TRIGGER update_tenants_updated_at BEFORE UPDATE ON tenants FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_branches_updated_at BEFORE UPDATE ON branches FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_vehicles_updated_at BEFORE UPDATE ON vehicles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON leads FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sales_updated_at BEFORE UPDATE ON sales FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 9. CREAR FUNCIONES AUXILIARES
-- =============================================

-- Función para generar employee_id
CREATE OR REPLACE FUNCTION generate_employee_id(tenant_id UUID)
RETURNS VARCHAR(50) AS $$
DECLARE
    tenant_code VARCHAR(10);
    next_number INTEGER;
    new_employee_id VARCHAR(50);
BEGIN
    -- Obtener código del tenant (primeras 3 letras del subdomain)
    SELECT UPPER(LEFT(subdomain, 3)) INTO tenant_code 
    FROM tenants WHERE id = tenant_id;
    
    -- Si no se encuentra el tenant, usar 'EMP'
    IF tenant_code IS NULL THEN
        tenant_code := 'EMP';
    END IF;
    
    -- Obtener el siguiente número
    SELECT COALESCE(MAX(CAST(SUBSTRING(employee_id FROM '[0-9]+$') AS INTEGER)), 0) + 1
    INTO next_number
    FROM user_profiles 
    WHERE user_profiles.tenant_id = generate_employee_id.tenant_id 
    AND employee_id ~ ('^' || tenant_code || '[0-9]+$');
    
    -- Generar el nuevo employee_id
    new_employee_id := tenant_code || LPAD(next_number::TEXT, 4, '0');
    
    RETURN new_employee_id;
END;
$$ LANGUAGE plpgsql;

-- 10. INSERTAR DATOS DE MUESTRA SI NO EXISTEN
-- =============================================

-- Insertar tenant de muestra si no existe ninguno
INSERT INTO tenants (name, subdomain, contact_email, business_type)
SELECT 'AutoMarket Demo', 'demo', 'admin@automarket-demo.com', 'dealership'
WHERE NOT EXISTS (SELECT 1 FROM tenants LIMIT 1);

-- Obtener el ID del tenant de muestra
DO $$
DECLARE
    demo_tenant_id UUID;
    demo_branch_id UUID;
BEGIN
    SELECT id INTO demo_tenant_id FROM tenants WHERE subdomain = 'demo';
    
    -- Insertar sucursal de muestra
    INSERT INTO branches (tenant_id, name, code, address, city, state, phone, email)
    VALUES (
        demo_tenant_id, 
        'Sucursal Principal', 
        'MAIN', 
        'Av. Principal 123', 
        'Ciudad de México', 
        'CDMX',
        '55-1234-5678',
        'principal@automarket-demo.com'
    )
    ON CONFLICT (tenant_id, code) DO NOTHING;
    
    SELECT id INTO demo_branch_id FROM branches WHERE tenant_id = demo_tenant_id AND code = 'MAIN';
    
    -- Insertar usuarios de muestra
    INSERT INTO user_profiles (tenant_id, email, user_type, status, full_name, role, branch_id)
    VALUES 
        (demo_tenant_id, 'admin@demo.com', 'dealer', 'active', 'Administrador Demo', 'admin', demo_branch_id),
        (demo_tenant_id, 'vendedor@demo.com', 'seller', 'active', 'Vendedor Demo', 'salesperson', demo_branch_id),
        (demo_tenant_id, 'gerente@demo.com', 'dealer', 'active', 'Gerente Demo', 'manager', demo_branch_id)
    ON CONFLICT (tenant_id, email) DO NOTHING;
    
    -- Insertar vehículos de muestra
    INSERT INTO vehicles (tenant_id, branch_id, brand, model, year, color, price, status, description)
    VALUES 
        (demo_tenant_id, demo_branch_id, 'Toyota', 'Corolla', 2023, 'Blanco', 350000.00, 'available', 'Sedán compacto en excelente estado'),
        (demo_tenant_id, demo_branch_id, 'Nissan', 'Sentra', 2022, 'Negro', 320000.00, 'available', 'Sedán familiar cómodo y eficiente'),
        (demo_tenant_id, demo_branch_id, 'Honda', 'Civic', 2023, 'Rojo', 380000.00, 'available', 'Deportivo compacto con gran rendimiento')
    ON CONFLICT DO NOTHING;
END $$;

-- 11. COMMIT DE LA MIGRACIÓN
-- =============================================

COMMIT;

-- Mostrar resumen de la migración
SELECT 
    'Migración completada exitosamente' AS status,
    (SELECT COUNT(*) FROM tenants) AS total_tenants,
    (SELECT COUNT(*) FROM user_profiles) AS total_users,
    (SELECT COUNT(*) FROM branches) AS total_branches,
    (SELECT COUNT(*) FROM vehicles) AS total_vehicles,
    (SELECT COUNT(*) FROM leads) AS total_leads,
    (SELECT COUNT(*) FROM sales) AS total_sales;