-- AutoMarket MultiTenant - Base de Datos Optimizada
-- Versión: 2.0 - Optimizada y Normalizada
-- Fecha: 12 de octubre de 2025

-- Extensiones necesarias
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS btree_gin;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- =======================
-- TABLA PRINCIPAL: TENANTS
-- =======================
CREATE TABLE IF NOT EXISTS tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name VARCHAR(255) NOT NULL,
  company_type VARCHAR(50) NOT NULL CHECK (company_type IN ('dealership', 'individual_seller', 'corporate')),
  tax_id VARCHAR(50) UNIQUE,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(100),
  country VARCHAR(3) DEFAULT 'MEX',
  postal_code VARCHAR(10),
  website VARCHAR(255),
  logo_url TEXT,
  subscription_plan VARCHAR(50) DEFAULT 'basic' CHECK (subscription_plan IN ('basic', 'premium', 'enterprise')),
  subscription_expires_at TIMESTAMPTZ,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'cancelled')),
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =======================
-- TABLA: BRANCHES/SUCURSALES
-- =======================
CREATE TABLE IF NOT EXISTS branches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  code VARCHAR(20) NOT NULL, -- Código único por tenant
  address TEXT NOT NULL,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(100) NOT NULL,
  postal_code VARCHAR(10),
  phone VARCHAR(20),
  email VARCHAR(255),
  manager_id UUID, -- Se agregará FK después
  business_hours JSONB DEFAULT '{}',
  coordinates POINT, -- Para geolocalización
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'maintenance')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(tenant_id, code)
);

-- =======================
-- TABLA: USER_PROFILES (Usuarios del sistema)
-- =======================
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  user_type VARCHAR(20) NOT NULL CHECK (user_type IN ('buyer', 'seller', 'dealer')),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'pending_verification')),
  email_verified_at TIMESTAMPTZ,
  phone_verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  -- Nuevos campos para empleados
  branch_id UUID REFERENCES branches(id) ON DELETE SET NULL,
  role VARCHAR(50) CHECK (role IN (
    'super_admin', 'corporate_admin', 'branch_manager', 'sales_manager', 
    'salesperson', 'dealer', 'independent_seller', 'customer', 
    'premium_customer', 'support_agent', 'viewer'
  )),
  full_name VARCHAR(255),
  avatar_url TEXT,
  hire_date DATE,
  termination_date DATE,
  termination_reason TEXT,
  salary NUMERIC(12,2),
  commission_rate NUMERIC(5,2), -- Porcentaje de comisión
  employee_id VARCHAR(50), -- ID interno de empleado
  UNIQUE(tenant_id, email),
  UNIQUE(tenant_id, employee_id)
);

-- Ahora podemos agregar la FK de manager_id
ALTER TABLE branches ADD CONSTRAINT fk_branches_manager 
  FOREIGN KEY (manager_id) REFERENCES user_profiles(id) ON DELETE SET NULL;

-- =======================
-- TABLA: VEHICLE_BRANDS (Catálogo de marcas)
-- =======================
CREATE TABLE IF NOT EXISTS vehicle_brands (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  country VARCHAR(3),
  logo_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =======================
-- TABLA: VEHICLE_MODELS (Catálogo de modelos)
-- =======================
CREATE TABLE IF NOT EXISTS vehicle_models (
  id SERIAL PRIMARY KEY,
  brand_id INTEGER NOT NULL REFERENCES vehicle_brands(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  body_type VARCHAR(50) CHECK (body_type IN ('sedan', 'suv', 'hatchback', 'pickup', 'convertible', 'coupe', 'wagon', 'minivan')),
  fuel_type VARCHAR(50) CHECK (fuel_type IN ('gasoline', 'diesel', 'hybrid', 'electric', 'other')),
  transmission_type VARCHAR(50) CHECK (transmission_type IN ('manual', 'automatic', 'cvt')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(brand_id, name)
);

-- =======================
-- TABLA: VEHICLES (Vehículos en venta)
-- =======================
CREATE TABLE IF NOT EXISTS vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  seller_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  brand_id INTEGER REFERENCES vehicle_brands(id),
  model_id INTEGER REFERENCES vehicle_models(id),
  brand VARCHAR(100) NOT NULL, -- Mantenemos para compatibilidad
  model VARCHAR(100) NOT NULL,
  year INTEGER NOT NULL CHECK (year >= 1900 AND year <= EXTRACT(YEAR FROM CURRENT_DATE) + 1),
  price NUMERIC(12,2) NOT NULL CHECK (price >= 0),
  original_price NUMERIC(12,2), -- Precio original para descuentos
  mileage INTEGER CHECK (mileage >= 0),
  condition_type VARCHAR(50) NOT NULL DEFAULT 'used' CHECK (condition_type IN ('new', 'used', 'certified_pre_owned')),
  body_type VARCHAR(50) CHECK (body_type IN ('sedan', 'suv', 'hatchback', 'pickup', 'convertible', 'coupe', 'wagon', 'minivan')),
  fuel_type VARCHAR(50) CHECK (fuel_type IN ('gasoline', 'diesel', 'hybrid', 'electric', 'other')),
  transmission VARCHAR(50) CHECK (transmission IN ('manual', 'automatic', 'cvt')),
  exterior_color VARCHAR(50),
  interior_color VARCHAR(50),
  vin VARCHAR(17) UNIQUE,
  engine VARCHAR(100),
  cylinders SMALLINT,
  displacement NUMERIC(4,1), -- Cilindrada en litros
  horsepower INTEGER,
  torque INTEGER,
  doors SMALLINT CHECK (doors >= 2 AND doors <= 5),
  seats SMALLINT CHECK (seats >= 2 AND seats <= 9),
  description TEXT,
  features TEXT[], -- Array de características
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'sold', 'reserved', 'draft', 'suspended')),
  views_count INTEGER DEFAULT 0,
  favorites_count INTEGER DEFAULT 0,
  inquiries_count INTEGER DEFAULT 0,
  -- Información de ubicación
  location_city VARCHAR(100),
  location_state VARCHAR(100),
  location_coordinates POINT,
  -- Fechas importantes
  manufactured_date DATE,
  imported_date DATE,
  last_service_date DATE,
  next_service_due_date DATE,
  insurance_expires_at DATE,
  registration_expires_at DATE,
  -- Información de negocio
  branch_id UUID REFERENCES branches(id) ON DELETE SET NULL,
  assigned_to UUID REFERENCES user_profiles(id) ON DELETE SET NULL, -- Vendedor asignado
  commission_rate NUMERIC(5,2), -- Comisión específica para este vehículo
  is_negotiable BOOLEAN DEFAULT true,
  min_acceptable_price NUMERIC(12,2),
  -- SEO y marketing
  seo_title VARCHAR(255),
  seo_description TEXT,
  keywords TEXT[],
  -- Metadatos
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  published_at TIMESTAMPTZ,
  sold_at TIMESTAMPTZ,
  reserved_at TIMESTAMPTZ
);

-- =======================
-- TABLA: VEHICLE_IMAGES (Imágenes de vehículos)
-- =======================
CREATE TABLE IF NOT EXISTS vehicle_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  alt_text VARCHAR(255),
  is_primary BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  image_type VARCHAR(50) DEFAULT 'exterior' CHECK (image_type IN ('exterior', 'interior', 'engine', 'details', 'document')),
  file_size INTEGER, -- Tamaño en bytes
  width INTEGER,
  height INTEGER,
  format VARCHAR(10), -- jpg, png, webp
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =======================
-- TABLA: LEADS (Clientes potenciales)
-- =======================
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  vehicle_id UUID REFERENCES vehicles(id) ON DELETE SET NULL,
  branch_id UUID REFERENCES branches(id) ON DELETE SET NULL,
  assigned_to UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  -- Información del lead
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  preferred_contact VARCHAR(20) DEFAULT 'email' CHECK (preferred_contact IN ('email', 'phone', 'whatsapp', 'sms')),
  -- Información de interés
  inquiry_type VARCHAR(50) DEFAULT 'purchase' CHECK (inquiry_type IN ('purchase', 'finance', 'trade_in', 'test_drive', 'info')),
  budget_min NUMERIC(12,2),
  budget_max NUMERIC(12,2),
  financing_needed BOOLEAN DEFAULT false,
  trade_in_vehicle TEXT,
  message TEXT,
  -- Estado del lead
  status VARCHAR(20) DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'interested', 'negotiating', 'closed_won', 'closed_lost')),
  priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  source VARCHAR(50) DEFAULT 'website' CHECK (source IN ('website', 'facebook', 'google', 'referral', 'walk_in', 'phone', 'other')),
  -- Información de seguimiento
  first_contact_at TIMESTAMPTZ,
  last_contact_at TIMESTAMPTZ,
  next_followup_at TIMESTAMPTZ,
  estimated_close_date DATE,
  probability NUMERIC(3,0) CHECK (probability >= 0 AND probability <= 100), -- 0-100%
  -- Metadatos
  utm_source VARCHAR(100),
  utm_medium VARCHAR(100),
  utm_campaign VARCHAR(100),
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =======================
-- TABLA: SALES (Ventas realizadas)
-- =======================
CREATE TABLE IF NOT EXISTS sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
  branch_id UUID REFERENCES branches(id) ON DELETE SET NULL,
  salesperson_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  manager_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  -- Información del comprador
  buyer_full_name VARCHAR(255) NOT NULL,
  buyer_email VARCHAR(255) NOT NULL,
  buyer_phone VARCHAR(20),
  buyer_address TEXT,
  buyer_city VARCHAR(100),
  buyer_state VARCHAR(100),
  buyer_postal_code VARCHAR(10),
  -- Información financiera
  sale_price NUMERIC(12,2) NOT NULL CHECK (sale_price > 0),
  list_price NUMERIC(12,2) NOT NULL,
  discount_amount NUMERIC(12,2) DEFAULT 0,
  tax_amount NUMERIC(12,2) DEFAULT 0,
  total_amount NUMERIC(12,2) NOT NULL,
  -- Financiamiento
  financing_type VARCHAR(50) CHECK (financing_type IN ('cash', 'loan', 'lease', 'trade_in')),
  down_payment NUMERIC(12,2) DEFAULT 0,
  loan_amount NUMERIC(12,2) DEFAULT 0,
  loan_term_months INTEGER,
  interest_rate NUMERIC(5,2),
  monthly_payment NUMERIC(12,2),
  -- Trade-in
  trade_in_vehicle_info TEXT,
  trade_in_value NUMERIC(12,2) DEFAULT 0,
  -- Comisiones
  commission_rate NUMERIC(5,2),
  commission_amount NUMERIC(12,2),
  commission_paid BOOLEAN DEFAULT false,
  commission_paid_at TIMESTAMPTZ,
  -- Estado de la venta
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'completed', 'cancelled', 'refunded')),
  payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'partial', 'paid', 'overdue', 'refunded')),
  delivery_status VARCHAR(20) DEFAULT 'pending' CHECK (delivery_status IN ('pending', 'scheduled', 'delivered', 'cancelled')),
  -- Fechas importantes
  contract_date DATE NOT NULL,
  delivery_date DATE,
  warranty_start_date DATE,
  warranty_end_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =======================
-- TABLA: LEAD_ACTIVITIES (Historial de actividades de leads)
-- =======================
CREATE TABLE IF NOT EXISTS lead_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  activity_type VARCHAR(50) NOT NULL CHECK (activity_type IN ('call', 'email', 'meeting', 'note', 'status_change', 'assignment')),
  subject VARCHAR(255),
  description TEXT,
  outcome VARCHAR(100),
  next_action VARCHAR(255),
  scheduled_at TIMESTAMPTZ,
  duration_minutes INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =======================
-- TABLA: AUDIT_LOGS (Ya implementada, mejorada)
-- =======================
-- La tabla ya existe, solo agregamos algunos índices adicionales

-- =======================
-- ÍNDICES PARA RENDIMIENTO
-- =======================

-- Tenants
CREATE INDEX IF NOT EXISTS idx_tenants_company_type ON tenants(company_type);
CREATE INDEX IF NOT EXISTS idx_tenants_status ON tenants(status);

-- Branches
CREATE INDEX IF NOT EXISTS idx_branches_tenant_id ON branches(tenant_id);
CREATE INDEX IF NOT EXISTS idx_branches_manager_id ON branches(manager_id);
CREATE INDEX IF NOT EXISTS idx_branches_coordinates ON branches USING GIST(coordinates);

-- User Profiles
CREATE INDEX IF NOT EXISTS idx_user_profiles_tenant_email ON user_profiles(tenant_id, email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_user_profiles_status ON user_profiles(status);
CREATE INDEX IF NOT EXISTS idx_user_profiles_branch_id ON user_profiles(branch_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_hire_date ON user_profiles(hire_date);

-- Vehicles
CREATE INDEX IF NOT EXISTS idx_vehicles_tenant_status ON vehicles(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_vehicles_seller_id ON vehicles(seller_id);
CREATE INDEX IF NOT EXISTS idx_vehicles_brand_model ON vehicles(brand, model);
CREATE INDEX IF NOT EXISTS idx_vehicles_year ON vehicles(year);
CREATE INDEX IF NOT EXISTS idx_vehicles_price ON vehicles(price);
CREATE INDEX IF NOT EXISTS idx_vehicles_condition_type ON vehicles(condition_type);
CREATE INDEX IF NOT EXISTS idx_vehicles_location ON vehicles(location_city, location_state);
CREATE INDEX IF NOT EXISTS idx_vehicles_coordinates ON vehicles USING GIST(location_coordinates);
CREATE INDEX IF NOT EXISTS idx_vehicles_features ON vehicles USING GIN(features);
CREATE INDEX IF NOT EXISTS idx_vehicles_keywords ON vehicles USING GIN(keywords);
CREATE INDEX IF NOT EXISTS idx_vehicles_created_at ON vehicles(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_vehicles_published_at ON vehicles(published_at DESC);

-- Vehicle Images
CREATE INDEX IF NOT EXISTS idx_vehicle_images_vehicle_id ON vehicle_images(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_images_primary ON vehicle_images(vehicle_id, is_primary);

-- Leads
CREATE INDEX IF NOT EXISTS idx_leads_tenant_status ON leads(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_leads_assigned_to ON leads(assigned_to);
CREATE INDEX IF NOT EXISTS idx_leads_vehicle_id ON leads(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_phone ON leads(phone);
CREATE INDEX IF NOT EXISTS idx_leads_priority ON leads(priority);
CREATE INDEX IF NOT EXISTS idx_leads_source ON leads(source);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_next_followup ON leads(next_followup_at);

-- Sales
CREATE INDEX IF NOT EXISTS idx_sales_tenant_id ON sales(tenant_id);
CREATE INDEX IF NOT EXISTS idx_sales_vehicle_id ON sales(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_sales_salesperson_id ON sales(salesperson_id);
CREATE INDEX IF NOT EXISTS idx_sales_contract_date ON sales(contract_date DESC);
CREATE INDEX IF NOT EXISTS idx_sales_status ON sales(status);
CREATE INDEX IF NOT EXISTS idx_sales_commission_paid ON sales(commission_paid);

-- Lead Activities
CREATE INDEX IF NOT EXISTS idx_lead_activities_lead_id ON lead_activities(lead_id);
CREATE INDEX IF NOT EXISTS idx_lead_activities_user_id ON lead_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_lead_activities_created_at ON lead_activities(created_at DESC);

-- Audit Logs (índices adicionales)
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_event_type ON audit_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource_type_id ON audit_logs(resource_type, resource_id);

-- =======================
-- TRIGGERS PARA UPDATED_AT
-- =======================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar trigger a todas las tablas con updated_at
CREATE TRIGGER update_tenants_updated_at BEFORE UPDATE ON tenants FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_branches_updated_at BEFORE UPDATE ON branches FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_vehicles_updated_at BEFORE UPDATE ON vehicles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON leads FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sales_updated_at BEFORE UPDATE ON sales FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =======================
-- FUNCIONES DE UTILIDAD
-- =======================

-- Función para calcular distancia entre coordenadas
CREATE OR REPLACE FUNCTION calculate_distance(lat1 FLOAT, lon1 FLOAT, lat2 FLOAT, lon2 FLOAT)
RETURNS FLOAT AS $$
BEGIN
    RETURN 2 * 6371 * ASIN(SQRT(
        POWER(SIN(RADIANS(lat2 - lat1) / 2), 2) +
        COS(RADIANS(lat1)) * COS(RADIANS(lat2)) *
        POWER(SIN(RADIANS(lon2 - lon1) / 2), 2)
    ));
END;
$$ LANGUAGE plpgsql;

-- Función para generar código de empleado
CREATE OR REPLACE FUNCTION generate_employee_id(tenant_id UUID)
RETURNS VARCHAR AS $$
DECLARE
    tenant_code VARCHAR(3);
    next_number INTEGER;
    employee_id VARCHAR(50);
BEGIN
    -- Obtener código del tenant (primeras 3 letras del nombre)
    SELECT UPPER(LEFT(company_name, 3)) INTO tenant_code
    FROM tenants WHERE id = tenant_id;
    
    -- Obtener siguiente número
    SELECT COALESCE(MAX(CAST(SUBSTRING(employee_id FROM 4) AS INTEGER)), 0) + 1
    INTO next_number
    FROM user_profiles 
    WHERE user_profiles.tenant_id = generate_employee_id.tenant_id 
    AND employee_id IS NOT NULL;
    
    -- Generar ID
    employee_id := tenant_code || LPAD(next_number::TEXT, 4, '0');
    
    RETURN employee_id;
END;
$$ LANGUAGE plpgsql;

-- =======================
-- DATOS DE EJEMPLO MEJORADOS
-- =======================

-- Insertar marcas de vehículos
INSERT INTO vehicle_brands (name, country, is_active) VALUES
  ('Toyota', 'JPN', true),
  ('Honda', 'JPN', true),
  ('Volkswagen', 'DEU', true),
  ('Ford', 'USA', true),
  ('Chevrolet', 'USA', true),
  ('Nissan', 'JPN', true),
  ('Hyundai', 'KOR', true),
  ('Kia', 'KOR', true),
  ('BMW', 'DEU', true),
  ('Mercedes-Benz', 'DEU', true)
ON CONFLICT (name) DO NOTHING;

-- Insertar modelos populares
INSERT INTO vehicle_models (brand_id, name, body_type, fuel_type, transmission_type) VALUES
  (1, 'Corolla', 'sedan', 'gasoline', 'automatic'),
  (1, 'RAV4', 'suv', 'gasoline', 'automatic'),
  (1, 'Camry', 'sedan', 'hybrid', 'cvt'),
  (2, 'Civic', 'sedan', 'gasoline', 'cvt'),
  (2, 'CR-V', 'suv', 'gasoline', 'automatic'),
  (3, 'Jetta', 'sedan', 'gasoline', 'automatic'),
  (4, 'Focus', 'hatchback', 'gasoline', 'manual'),
  (6, 'Sentra', 'sedan', 'gasoline', 'manual')
ON CONFLICT (brand_id, name) DO NOTHING;

-- Datos mejorados de tenants
INSERT INTO tenants (id, company_name, company_type, tax_id, email, phone, address, city, state, subscription_plan) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Toyota Centro', 'dealership', 'TC123456789', 'admin@toyota-centro.com', '+52-55-1234-5678', 'Av. Insurgentes Sur 1234', 'Ciudad de México', 'CDMX', 'premium'),
  ('22222222-2222-2222-2222-222222222222', 'Carlos Pérez Motors', 'dealership', 'CPM987654321', 'info@perez-motors.com', '+52-33-9876-5432', 'Blvd. López Mateos 5678', 'Guadalajara', 'Jalisco', 'basic'),
  ('33333333-3333-3333-3333-333333333333', 'María González Autos', 'individual_seller', 'MGA456789123', 'maria.gonzalez@gmail.com', '+52-81-5555-1234', 'Calle Morelos 321', 'Monterrey', 'Nuevo León', 'basic')
ON CONFLICT (id) DO UPDATE SET
  company_name = EXCLUDED.company_name,
  company_type = EXCLUDED.company_type,
  tax_id = EXCLUDED.tax_id,
  email = EXCLUDED.email,
  phone = EXCLUDED.phone,
  address = EXCLUDED.address,
  city = EXCLUDED.city,
  state = EXCLUDED.state,
  subscription_plan = EXCLUDED.subscription_plan;

-- Crear sucursales
INSERT INTO branches (id, tenant_id, name, code, address, city, state, phone, email) VALUES
  ('b1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'Toyota Centro Principal', 'TC01', 'Av. Insurgentes Sur 1234', 'Ciudad de México', 'CDMX', '+52-55-1234-5678', 'principal@toyota-centro.com'),
  ('b1111111-1111-1111-1111-111111111112', '11111111-1111-1111-1111-111111111111', 'Toyota Centro Satélite', 'TC02', 'Blvd. Manuel Ávila Camacho 2000', 'Naucalpan', 'Estado de México', '+52-55-5555-1111', 'satelite@toyota-centro.com'),
  ('b2222222-2222-2222-2222-222222222221', '22222222-2222-2222-2222-222222222222', 'Carlos Pérez Motors Centro', 'CPM01', 'Blvd. López Mateos 5678', 'Guadalajara', 'Jalisco', '+52-33-9876-5432', 'centro@perez-motors.com')
ON CONFLICT (tenant_id, code) DO NOTHING;

-- Crear perfiles de usuario mejorados
INSERT INTO user_profiles (id, tenant_id, email, user_type, role, full_name, branch_id, hire_date, salary, commission_rate, employee_id) VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'admin@toyota-centro.com', 'dealer', 'corporate_admin', 'Roberto García Méndez', 'b1111111-1111-1111-1111-111111111111', '2020-01-15', 45000.00, 0.00, 'TOY0001'),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', '11111111-1111-1111-1111-111111111111', 'vendedor@toyota-centro.com', 'seller', 'salesperson', 'Ana López Rodríguez', 'b1111111-1111-1111-1111-111111111111', '2021-03-20', 25000.00, 8.50, 'TOY0002'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '22222222-2222-2222-2222-222222222222', 'carlos@perez-motors.com', 'dealer', 'corporate_admin', 'Carlos Pérez Hernández', 'b2222222-2222-2222-2222-222222222221', '2019-06-10', 40000.00, 0.00, 'CAR0001'),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', '22222222-2222-2222-2222-222222222222', 'vendedor2@perez-motors.com', 'seller', 'salesperson', 'Luis Mendoza Silva', 'b2222222-2222-2222-2222-222222222221', '2022-01-15', 22000.00, 7.00, 'CAR0002'),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '33333333-3333-3333-3333-333333333333', 'maria.gonzalez@gmail.com', 'seller', 'independent_seller', 'María González Torres', NULL, '2023-05-01', NULL, 0.00, NULL),
  ('ffffffff-ffff-ffff-ffff-ffffffffffff', '11111111-1111-1111-1111-111111111111', 'comprador1@email.com', 'buyer', 'customer', 'Juan Rodríguez Pérez', NULL, NULL, NULL, NULL, NULL),
  ('44444444-4444-4444-4444-444444444444', '22222222-2222-2222-2222-222222222222', 'comprador2@email.com', 'buyer', 'premium_customer', 'Patricia Silva González', NULL, NULL, NULL, NULL, NULL)
ON CONFLICT (tenant_id, email) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  branch_id = EXCLUDED.branch_id,
  hire_date = EXCLUDED.hire_date,
  salary = EXCLUDED.salary,
  commission_rate = EXCLUDED.commission_rate,
  employee_id = EXCLUDED.employee_id;

-- Actualizar managers de sucursales
UPDATE branches SET manager_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa' WHERE code = 'TC01';
UPDATE branches SET manager_id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb' WHERE code = 'CPM01';

-- Insertar vehículos de ejemplo mejorados
INSERT INTO vehicles (
  tenant_id, seller_id, brand_id, model_id, brand, model, year, price, original_price, 
  mileage, condition_type, body_type, fuel_type, transmission, exterior_color, 
  interior_color, vin, description, features, location_city, location_state, 
  branch_id, assigned_to, is_negotiable, status
) VALUES
  ('11111111-1111-1111-1111-111111111111', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 1, 1, 'Toyota', 'Corolla', 2023, 379900.00, 389900.00, 0, 'new', 'sedan', 'gasoline', 'automatic', 'Blanco Perla', 'Negro', '1HGBH41JXMN109186', 'Toyota Corolla 2023 totalmente nuevo con garantía de agencia. Excelente rendimiento de combustible y tecnología de última generación.', ARRAY['Sistema de navegación', 'Cámara de reversa', 'Sensores de estacionamiento', 'Bluetooth', 'Control crucero', 'Asientos de piel'], 'Ciudad de México', 'CDMX', 'b1111111-1111-1111-1111-111111111111', 'cccccccc-cccc-cccc-cccc-cccccccccccc', true, 'active'),
  ('11111111-1111-1111-1111-111111111111', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 1, 2, 'Toyota', 'RAV4', 2022, 519900.00, 529900.00, 15000, 'used', 'suv', 'gasoline', 'automatic', 'Rojo Metálico', 'Gris', '2T3F1RFV8NC123456', 'RAV4 2022 seminueva en excelentes condiciones. Un solo dueño, servicios en agencia.', ARRAY['Tracción AWD', 'Sunroof panorámico', 'Sistema de sonido premium', 'Asientos calefaccionados', 'Control de estabilidad'], 'Ciudad de México', 'CDMX', 'b1111111-1111-1111-1111-111111111111', 'cccccccc-cccc-cccc-cccc-cccccccccccc', true, 'active'),
  ('22222222-2222-2222-2222-222222222222', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 2, 4, 'Honda', 'Civic', 2020, 325000.00, 340000.00, 35000, 'used', 'sedan', 'gasoline', 'cvt', 'Negro', 'Gris', '19XFC2F50KE123456', 'Honda Civic 2020 en excelentes condiciones. Único dueño, perfectamente mantenido.', ARRAY['Transmisión CVT', 'Android Auto', 'Apple CarPlay', 'Sistema de frenado automático', 'Luces LED'], 'Guadalajara', 'Jalisco', 'b2222222-2222-2222-2222-222222222221', 'dddddddd-dddd-dddd-dddd-dddddddddddd', true, 'active'),
  ('33333333-3333-3333-3333-333333333333', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 6, 8, 'Nissan', 'Sentra', 2018, 195000.00, 200000.00, 68000, 'used', 'sedan', 'gasoline', 'manual', 'Gris Plata', 'Negro', '3N1AB7AP8JL123456', 'Nissan Sentra 2018 en muy buenas condiciones. Único dueño con mantenimientos al día.', ARRAY['Aire acondicionado', 'Dirección hidráulica', 'Radio AM/FM/CD', 'Seguros eléctricos'], 'Monterrey', 'Nuevo León', NULL, 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', true, 'active')
ON CONFLICT (id) DO NOTHING;

-- Insertar algunas imágenes de ejemplo
INSERT INTO vehicle_images (vehicle_id, tenant_id, image_url, alt_text, is_primary, sort_order, image_type) 
SELECT v.id, v.tenant_id, 'https://example.com/images/' || v.id || '_1.jpg', v.brand || ' ' || v.model || ' exterior', true, 1, 'exterior'
FROM vehicles v
WHERE NOT EXISTS (SELECT 1 FROM vehicle_images vi WHERE vi.vehicle_id = v.id);

-- Insertar algunos leads de ejemplo
INSERT INTO leads (
  tenant_id, vehicle_id, branch_id, assigned_to, full_name, email, phone, 
  inquiry_type, budget_min, budget_max, financing_needed, message, status, 
  priority, source
) VALUES
  ('11111111-1111-1111-1111-111111111111', (SELECT id FROM vehicles WHERE brand = 'Toyota' AND model = 'Corolla' LIMIT 1), 'b1111111-1111-1111-1111-111111111111', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'Pedro Martínez López', 'pedro.martinez@email.com', '+52-55-1111-2222', 'purchase', 350000.00, 400000.00, true, 'Me interesa el Corolla 2023, ¿podrían contactarme?', 'new', 'high', 'website'),
  ('22222222-2222-2222-2222-222222222222', (SELECT id FROM vehicles WHERE brand = 'Honda' AND model = 'Civic' LIMIT 1), 'b2222222-2222-2222-2222-222222222221', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'Laura Sánchez García', 'laura.sanchez@email.com', '+52-33-2222-3333', 'test_drive', 300000.00, 350000.00, false, 'Quisiera agendar una prueba de manejo del Civic', 'contacted', 'medium', 'facebook')
ON CONFLICT DO NOTHING;

-- =======================
-- COMENTARIOS Y DOCUMENTACIÓN
-- =======================

COMMENT ON TABLE tenants IS 'Tabla principal de tenants/empresas del sistema multitenant';
COMMENT ON TABLE branches IS 'Sucursales o ubicaciones físicas de cada tenant';
COMMENT ON TABLE user_profiles IS 'Perfiles de usuarios incluyendo empleados y clientes';
COMMENT ON TABLE vehicles IS 'Inventario de vehículos en venta';
COMMENT ON TABLE vehicle_images IS 'Imágenes asociadas a cada vehículo';
COMMENT ON TABLE leads IS 'Clientes potenciales y sus consultas';
COMMENT ON TABLE sales IS 'Registro de ventas completadas';
COMMENT ON TABLE lead_activities IS 'Historial de actividades y seguimiento de leads';
COMMENT ON TABLE audit_logs IS 'Registro de auditoría para acciones críticas del sistema';

COMMENT ON COLUMN vehicles.features IS 'Array de características del vehículo (JSON array)';
COMMENT ON COLUMN vehicles.keywords IS 'Palabras clave para SEO y búsqueda (JSON array)';
COMMENT ON COLUMN vehicles.location_coordinates IS 'Coordenadas geográficas para búsquedas por ubicación';
COMMENT ON COLUMN leads.utm_source IS 'Parámetro UTM para tracking de campañas de marketing';
COMMENT ON COLUMN user_profiles.commission_rate IS 'Porcentaje de comisión del empleado (0-100)';

-- Mostrar resumen de la estructura
SELECT 
  schemaname,
  tablename,
  n_tup_ins as "Rows Inserted",
  n_tup_upd as "Rows Updated", 
  n_tup_del as "Rows Deleted"
FROM pg_stat_user_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;