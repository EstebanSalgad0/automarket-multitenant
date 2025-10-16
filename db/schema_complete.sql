-- =====================================
-- AUTOMARKET MULTITENANT DATABASE SCHEMA
-- Versión: 2.0 - Optimizada y Completa
-- =====================================

-- Extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================
-- FUNCTIONS Y TRIGGERS
-- =====================================

-- Función para actualizar timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- =====================================
-- TABLA: TENANTS (ORGANIZACIONES)
-- =====================================
CREATE TABLE IF NOT EXISTS tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('automotora', 'particular')),
    description TEXT,
    
    -- Información de contacto
    address TEXT,
    phone VARCHAR(20),
    email VARCHAR(255),
    website VARCHAR(255),
    
    -- Configuración
    settings JSONB DEFAULT '{}',
    features JSONB DEFAULT '{}',
    
    -- Referencias
    owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    
    -- Estados y metadatos
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended', 'deleted')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Índices para tenants
CREATE INDEX IF NOT EXISTS idx_tenants_owner_id ON tenants(owner_id);
CREATE INDEX IF NOT EXISTS idx_tenants_status ON tenants(status);
CREATE INDEX IF NOT EXISTS idx_tenants_type ON tenants(type);

-- Trigger para updated_at
CREATE TRIGGER update_tenants_updated_at 
    BEFORE UPDATE ON tenants 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================
-- TABLA: USER_PROFILES (PERFILES DE USUARIO)
-- =====================================
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Información personal
    email VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    avatar_url TEXT,
    
    -- Rol y permisos
    role VARCHAR(50) NOT NULL CHECK (role IN ('comprador', 'vendedor_particular', 'vendedor_automotora', 'automotora_admin')),
    permissions JSONB DEFAULT '[]',
    
    -- Asociación con tenant
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    
    -- Configuración personal
    preferences JSONB DEFAULT '{}',
    notification_settings JSONB DEFAULT '{}',
    
    -- Estado y metadatos
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending', 'suspended')),
    email_verified BOOLEAN DEFAULT FALSE,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices para user_profiles
CREATE INDEX IF NOT EXISTS idx_user_profiles_tenant_id ON user_profiles(tenant_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_status ON user_profiles(status);

-- Trigger para updated_at
CREATE TRIGGER update_user_profiles_updated_at 
    BEFORE UPDATE ON user_profiles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================
-- TABLA: VEHICLES (VEHÍCULOS)
-- =====================================
CREATE TABLE IF NOT EXISTS vehicles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Información básica
    brand VARCHAR(100) NOT NULL,
    model VARCHAR(100) NOT NULL,
    year INTEGER NOT NULL CHECK (year >= 1900 AND year <= EXTRACT(YEAR FROM CURRENT_DATE) + 2),
    price DECIMAL(12,2) NOT NULL CHECK (price >= 0),
    
    -- Detalles técnicos
    mileage INTEGER DEFAULT 0 CHECK (mileage >= 0),
    fuel_type VARCHAR(20) CHECK (fuel_type IN ('gasoline', 'diesel', 'electric', 'hybrid', 'lpg', 'cng')),
    transmission VARCHAR(20) CHECK (transmission IN ('manual', 'automatic', 'cvt', 'semi_automatic')),
    engine_size DECIMAL(3,1),
    horsepower INTEGER,
    
    -- Información adicional
    color VARCHAR(50),
    body_type VARCHAR(30) CHECK (body_type IN ('sedan', 'hatchback', 'suv', 'truck', 'coupe', 'convertible', 'wagon', 'van', 'pickup')),
    doors INTEGER CHECK (doors IN (2, 3, 4, 5)),
    seats INTEGER CHECK (seats >= 1 AND seats <= 9),
    
    -- Descripción y características
    description TEXT,
    condition VARCHAR(20) DEFAULT 'used' CHECK (condition IN ('new', 'used', 'certified')),
    
    -- Referencias
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    
    -- Estado y metadatos
    status VARCHAR(20) DEFAULT 'available' CHECK (status IN ('available', 'sold', 'reserved', 'maintenance', 'deleted')),
    featured BOOLEAN DEFAULT FALSE,
    views_count INTEGER DEFAULT 0,
    sold_at TIMESTAMP WITH TIME ZONE,
    sold_price DECIMAL(12,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Índices para vehicles
CREATE INDEX IF NOT EXISTS idx_vehicles_tenant_id ON vehicles(tenant_id);
CREATE INDEX IF NOT EXISTS idx_vehicles_status ON vehicles(status);
CREATE INDEX IF NOT EXISTS idx_vehicles_brand ON vehicles(brand);
CREATE INDEX IF NOT EXISTS idx_vehicles_model ON vehicles(model);
CREATE INDEX IF NOT EXISTS idx_vehicles_year ON vehicles(year);
CREATE INDEX IF NOT EXISTS idx_vehicles_price ON vehicles(price);
CREATE INDEX IF NOT EXISTS idx_vehicles_featured ON vehicles(featured);
CREATE INDEX IF NOT EXISTS idx_vehicles_created_at ON vehicles(created_at);

-- Trigger para updated_at
CREATE TRIGGER update_vehicles_updated_at 
    BEFORE UPDATE ON vehicles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================
-- TABLA: VEHICLE_IMAGES (IMÁGENES DE VEHÍCULOS)
-- =====================================
CREATE TABLE IF NOT EXISTS vehicle_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    
    -- Información de la imagen
    image_url TEXT NOT NULL,
    image_path TEXT,
    alt_text VARCHAR(255),
    caption TEXT,
    
    -- Metadatos
    file_size INTEGER,
    mime_type VARCHAR(50),
    width INTEGER,
    height INTEGER,
    
    -- Estado
    is_primary BOOLEAN DEFAULT FALSE,
    sort_order INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices para vehicle_images
CREATE INDEX IF NOT EXISTS idx_vehicle_images_vehicle_id ON vehicle_images(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_images_is_primary ON vehicle_images(is_primary);
CREATE INDEX IF NOT EXISTS idx_vehicle_images_sort_order ON vehicle_images(sort_order);

-- Trigger para updated_at
CREATE TRIGGER update_vehicle_images_updated_at 
    BEFORE UPDATE ON vehicle_images 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================
-- TABLA: VEHICLE_FEATURES (CARACTERÍSTICAS ESPECÍFICAS)
-- =====================================
CREATE TABLE IF NOT EXISTS vehicle_features (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    
    -- Característica
    feature_name VARCHAR(100) NOT NULL,
    feature_value TEXT,
    feature_type VARCHAR(20) DEFAULT 'text' CHECK (feature_type IN ('text', 'boolean', 'number', 'json')),
    
    -- Metadatos
    category VARCHAR(50),
    sort_order INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices para vehicle_features
CREATE INDEX IF NOT EXISTS idx_vehicle_features_vehicle_id ON vehicle_features(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_features_category ON vehicle_features(category);

-- Trigger para updated_at
CREATE TRIGGER update_vehicle_features_updated_at 
    BEFORE UPDATE ON vehicle_features 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================
-- TABLA: INQUIRIES (CONSULTAS DE COMPRADORES)
-- =====================================
CREATE TABLE IF NOT EXISTS inquiries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Referencias
    vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    buyer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    
    -- Información del comprador
    buyer_name VARCHAR(255) NOT NULL,
    buyer_email VARCHAR(255) NOT NULL,
    buyer_phone VARCHAR(20),
    
    -- Consulta
    message TEXT NOT NULL,
    inquiry_type VARCHAR(30) DEFAULT 'general' CHECK (inquiry_type IN ('general', 'price', 'test_drive', 'financing', 'trade_in')),
    
    -- Estado
    status VARCHAR(20) DEFAULT 'new' CHECK (status IN ('new', 'responded', 'in_progress', 'closed')),
    priority VARCHAR(10) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    
    -- Respuesta
    response TEXT,
    responded_at TIMESTAMP WITH TIME ZONE,
    responded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices para inquiries
CREATE INDEX IF NOT EXISTS idx_inquiries_vehicle_id ON inquiries(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_inquiries_tenant_id ON inquiries(tenant_id);
CREATE INDEX IF NOT EXISTS idx_inquiries_buyer_id ON inquiries(buyer_id);
CREATE INDEX IF NOT EXISTS idx_inquiries_status ON inquiries(status);
CREATE INDEX IF NOT EXISTS idx_inquiries_created_at ON inquiries(created_at);

-- Trigger para updated_at
CREATE TRIGGER update_inquiries_updated_at 
    BEFORE UPDATE ON inquiries 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================
-- TABLA: FAVORITES (VEHÍCULOS FAVORITOS)
-- =====================================
CREATE TABLE IF NOT EXISTS favorites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraint único
    UNIQUE(user_id, vehicle_id)
);

-- Índices para favorites
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_vehicle_id ON favorites(vehicle_id);

-- =====================================
-- TABLA: ACTIVITY_LOGS (LOGS DE ACTIVIDAD)
-- =====================================
CREATE TABLE IF NOT EXISTS activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Referencias
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    
    -- Actividad
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID,
    
    -- Detalles
    description TEXT,
    metadata JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    
    -- Timestamp
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices para activity_logs
CREATE INDEX IF NOT EXISTS idx_activity_logs_tenant_id ON activity_logs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_activity_logs_action ON activity_logs(action);

-- =====================================
-- TABLA: SETTINGS (CONFIGURACIONES GLOBALES)
-- =====================================
CREATE TABLE IF NOT EXISTS settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    
    -- Configuración
    key VARCHAR(100) NOT NULL,
    value JSONB,
    type VARCHAR(20) DEFAULT 'string' CHECK (type IN ('string', 'number', 'boolean', 'json', 'array')),
    
    -- Metadatos
    description TEXT,
    is_public BOOLEAN DEFAULT FALSE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraint único por tenant y key
    UNIQUE(tenant_id, key)
);

-- Índices para settings
CREATE INDEX IF NOT EXISTS idx_settings_tenant_id ON settings(tenant_id);
CREATE INDEX IF NOT EXISTS idx_settings_key ON settings(key);

-- Trigger para updated_at
CREATE TRIGGER update_settings_updated_at 
    BEFORE UPDATE ON settings 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================

-- Habilitar RLS en todas las tablas
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicle_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicle_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- =====================================
-- POLÍTICAS RLS PARA TENANTS
-- =====================================

-- Los usuarios pueden ver tenants según su rol
CREATE POLICY "Users can view tenants based on role" ON tenants
    FOR SELECT USING (
        CASE 
            WHEN auth.jwt() ->> 'role' = 'comprador' THEN status = 'active'
            WHEN auth.jwt() ->> 'role' IN ('automotora_admin', 'vendedor_automotora', 'vendedor_particular') 
                THEN id::text = auth.jwt() ->> 'tenant_id'
            ELSE FALSE
        END
    );

-- Solo los owners pueden modificar su tenant
CREATE POLICY "Owners can update their tenant" ON tenants
    FOR UPDATE USING (owner_id = auth.uid());

-- Solo admins pueden crear tenants
CREATE POLICY "Admins can create tenants" ON tenants
    FOR INSERT WITH CHECK (auth.jwt() ->> 'role' = 'automotora_admin');

-- =====================================
-- POLÍTICAS RLS PARA USER_PROFILES
-- =====================================

-- Los usuarios pueden ver su propio perfil y admins pueden ver perfiles de su tenant
CREATE POLICY "Users can view profiles" ON user_profiles
    FOR SELECT USING (
        id = auth.uid() OR 
        (auth.jwt() ->> 'role' = 'automotora_admin' AND tenant_id::text = auth.jwt() ->> 'tenant_id')
    );

-- Los usuarios pueden actualizar su propio perfil
CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE USING (id = auth.uid());

-- =====================================
-- POLÍTICAS RLS PARA VEHICLES
-- =====================================

-- Los compradores pueden ver todos los vehículos disponibles
-- Los vendedores solo pueden ver vehículos de su tenant
CREATE POLICY "Users can view vehicles based on role" ON vehicles
    FOR SELECT USING (
        CASE 
            WHEN auth.jwt() ->> 'role' = 'comprador' THEN status = 'available'
            WHEN auth.jwt() ->> 'role' IN ('automotora_admin', 'vendedor_automotora', 'vendedor_particular') 
                THEN tenant_id::text = auth.jwt() ->> 'tenant_id'
            ELSE FALSE
        END
    );

-- Solo vendedores y admins pueden modificar vehículos de su tenant
CREATE POLICY "Sellers can modify vehicles" ON vehicles
    FOR ALL USING (
        tenant_id::text = auth.jwt() ->> 'tenant_id' AND
        auth.jwt() ->> 'role' IN ('automotora_admin', 'vendedor_automotora', 'vendedor_particular')
    );

-- =====================================
-- VISTAS ÚTILES
-- =====================================

-- Vista de vehículos con información completa
CREATE OR REPLACE VIEW vehicles_complete AS
SELECT 
    v.*,
    t.name as tenant_name,
    t.type as tenant_type,
    up.first_name || ' ' || up.last_name as created_by_name,
    COALESCE(img.image_url, '') as primary_image,
    COALESCE(img_count.total_images, 0) as total_images
FROM vehicles v
LEFT JOIN tenants t ON v.tenant_id = t.id
LEFT JOIN user_profiles up ON v.created_by = up.id
LEFT JOIN vehicle_images img ON v.id = img.vehicle_id AND img.is_primary = true
LEFT JOIN (
    SELECT vehicle_id, COUNT(*) as total_images
    FROM vehicle_images
    GROUP BY vehicle_id
) img_count ON v.id = img_count.vehicle_id
WHERE v.status != 'deleted';

-- =====================================
-- DATOS DE EJEMPLO (SEEDS)
-- =====================================

-- Insertar tenant de ejemplo
INSERT INTO tenants (id, name, slug, type, description, status) VALUES
    ('550e8400-e29b-41d4-a716-446655440000', 'AutoMarket Demo', 'automarket-demo', 'automotora', 'Tenant de demostración', 'active')
ON CONFLICT (id) DO NOTHING;

-- Insertar configuraciones por defecto
INSERT INTO settings (tenant_id, key, value, type, description, is_public) VALUES
    ('550e8400-e29b-41d4-a716-446655440000', 'max_images_per_vehicle', '10', 'number', 'Máximo número de imágenes por vehículo', false),
    ('550e8400-e29b-41d4-a716-446655440000', 'default_currency', '"USD"', 'string', 'Moneda por defecto', true),
    ('550e8400-e29b-41d4-a716-446655440000', 'enable_inquiries', 'true', 'boolean', 'Habilitar consultas de compradores', true)
ON CONFLICT (tenant_id, key) DO NOTHING;

-- =====================================
-- GRANTS Y PERMISOS
-- =====================================

-- Otorgar permisos al rol authenticated de Supabase
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Otorgar permisos al rol anon de Supabase (solo lectura limitada)
GRANT USAGE ON SCHEMA public TO anon;
GRANT SELECT ON tenants TO anon;
GRANT SELECT ON vehicles_complete TO anon;

COMMIT;