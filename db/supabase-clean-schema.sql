-- =====================================================
-- AutoMarket MultiTenant - Schema Limpio y Optimizado
-- Versión: 3.0 - Producción Ready
-- Fecha: 21 de octubre de 2025
-- =====================================================

-- Limpiar todo (CUIDADO: Solo en desarrollo)
DROP TABLE IF EXISTS vehicles CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE; 
DROP TABLE IF EXISTS vehicle_models CASCADE;
DROP TABLE IF EXISTS vehicle_brands CASCADE;
DROP TABLE IF EXISTS tenants CASCADE;

-- Extensiones necesarias
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- =====================================================
-- TABLA: TENANTS (Organizaciones/Concesionarios)
-- =====================================================
CREATE TABLE tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name VARCHAR(255) NOT NULL,
  company_type VARCHAR(50) NOT NULL CHECK (company_type IN ('dealership', 'individual_seller', 'corporate')),
  tax_id VARCHAR(50) UNIQUE,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(100), 
  country VARCHAR(3) DEFAULT 'CHL',
  postal_code VARCHAR(10),
  website VARCHAR(255),
  logo_url TEXT,
  subscription_plan VARCHAR(50) DEFAULT 'basic' CHECK (subscription_plan IN ('basic', 'premium', 'enterprise')),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'cancelled')),
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =====================================================
-- TABLA: USER_PROFILES (Perfiles de usuario)
-- =====================================================
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY, -- Este será el mismo que auth.users.id
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  user_type VARCHAR(20) NOT NULL CHECK (user_type IN ('buyer', 'seller', 'dealer', 'admin')),
  role VARCHAR(50) DEFAULT 'customer' CHECK (role IN (
    'super_admin', 'corporate_admin', 'branch_manager', 'sales_manager',
    'salesperson', 'dealer', 'independent_seller', 'customer', 'viewer'
  )),
  full_name VARCHAR(255),
  avatar_url TEXT,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'pending_verification')),
  email_verified_at TIMESTAMPTZ,
  phone_verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  -- Campos específicos de empleados
  employee_id VARCHAR(50),
  hire_date DATE,
  salary NUMERIC(12,2),
  commission_rate NUMERIC(5,2),
  UNIQUE(tenant_id, email),
  UNIQUE(tenant_id, employee_id)
);

-- =====================================================
-- TABLA: VEHICLE_BRANDS (Marcas de vehículos)
-- =====================================================
CREATE TABLE vehicle_brands (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  country VARCHAR(3),
  logo_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =====================================================
-- TABLA: VEHICLE_MODELS (Modelos de vehículos)
-- =====================================================
CREATE TABLE vehicle_models (
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

-- =====================================================
-- TABLA: VEHICLES (Vehículos en venta)
-- =====================================================
CREATE TABLE vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  seller_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  brand_id INTEGER REFERENCES vehicle_brands(id),
  model_id INTEGER REFERENCES vehicle_models(id),
  brand VARCHAR(100) NOT NULL, -- Mantenemos para compatibilidad
  model VARCHAR(100) NOT NULL,
  year INTEGER NOT NULL CHECK (year >= 1900 AND year <= EXTRACT(YEAR FROM CURRENT_DATE) + 1),
  price NUMERIC(12,2) NOT NULL CHECK (price >= 0),
  original_price NUMERIC(12,2),
  mileage INTEGER CHECK (mileage >= 0),
  condition_type VARCHAR(50) NOT NULL DEFAULT 'used' CHECK (condition_type IN ('new', 'used', 'certified_pre_owned')),
  body_type VARCHAR(50),
  fuel_type VARCHAR(50),
  transmission VARCHAR(50),
  exterior_color VARCHAR(50),
  interior_color VARCHAR(50),
  vin VARCHAR(17) UNIQUE,
  engine VARCHAR(100),
  doors SMALLINT CHECK (doors >= 2 AND doors <= 5),
  seats SMALLINT CHECK (seats >= 2 AND seats <= 9),
  description TEXT,
  features TEXT[],
  images JSONB DEFAULT '[]',
  location VARCHAR(255),
  status VARCHAR(20) DEFAULT 'available' CHECK (status IN ('available', 'sold', 'reserved', 'pending')),
  views_count INTEGER DEFAULT 0,
  favorites_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =====================================================
-- ÍNDICES PARA OPTIMIZACIÓN
-- =====================================================

-- Índices para búsquedas frecuentes
CREATE INDEX idx_vehicles_tenant_id ON vehicles(tenant_id);
CREATE INDEX idx_vehicles_seller_id ON vehicles(seller_id);
CREATE INDEX idx_vehicles_brand_model ON vehicles(brand, model);
CREATE INDEX idx_vehicles_price ON vehicles(price);
CREATE INDEX idx_vehicles_year ON vehicles(year);
CREATE INDEX idx_vehicles_status ON vehicles(status);
CREATE INDEX idx_vehicles_created_at ON vehicles(created_at DESC);

CREATE INDEX idx_user_profiles_tenant_id ON user_profiles(tenant_id);
CREATE INDEX idx_user_profiles_email ON user_profiles(email);
CREATE INDEX idx_user_profiles_role ON user_profiles(role);

-- =====================================================
-- TRIGGERS PARA UPDATED_AT AUTOMÁTICO
-- =====================================================

-- Función para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers
CREATE TRIGGER update_tenants_updated_at BEFORE UPDATE ON tenants FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_vehicles_updated_at BEFORE UPDATE ON vehicles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- POLÍTICAS RLS (Row Level Security)
-- =====================================================

-- Habilitar RLS en todas las tablas
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;

-- Las marcas y modelos son públicos (sin RLS)
-- vehicle_brands y vehicle_models son de solo lectura para todos

-- =====================================================
-- POLÍTICAS PARA TENANTS
-- =====================================================

-- Los usuarios solo pueden ver su propio tenant
CREATE POLICY "Users can read their own tenant" ON tenants
  FOR SELECT USING (
    id IN (
      SELECT tenant_id FROM user_profiles WHERE id = auth.uid()
    )
  );

-- Solo super_admins pueden crear/actualizar tenants
CREATE POLICY "Super admins can manage tenants" ON tenants
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() 
      AND role = 'super_admin'
    )
  );

-- =====================================================
-- POLÍTICAS PARA USER_PROFILES
-- =====================================================

-- Los usuarios pueden ver otros perfiles en su mismo tenant
CREATE POLICY "Users can read profiles in their tenant" ON user_profiles
  FOR SELECT USING (
    tenant_id IN (
      SELECT tenant_id FROM user_profiles WHERE id = auth.uid()
    )
  );

-- Los usuarios pueden actualizar su propio perfil
CREATE POLICY "Users can update their own profile" ON user_profiles
  FOR UPDATE USING (id = auth.uid());

-- Solo admins pueden crear/eliminar perfiles en su tenant
CREATE POLICY "Admins can manage profiles in their tenant" ON user_profiles
  FOR ALL USING (
    tenant_id IN (
      SELECT tenant_id FROM user_profiles 
      WHERE id = auth.uid() 
      AND role IN ('super_admin', 'corporate_admin', 'branch_manager')
    )
  );

-- =====================================================
-- POLÍTICAS PARA VEHICLES
-- =====================================================

-- Los usuarios pueden ver vehículos en su tenant
CREATE POLICY "Users can read vehicles in their tenant" ON vehicles
  FOR SELECT USING (
    tenant_id IN (
      SELECT tenant_id FROM user_profiles WHERE id = auth.uid()
    )
  );

-- Los vendedores pueden insertar vehículos en su tenant
CREATE POLICY "Sellers can insert vehicles in their tenant" ON vehicles
  FOR INSERT WITH CHECK (
    tenant_id IN (
      SELECT tenant_id FROM user_profiles 
      WHERE id = auth.uid() 
      AND user_type IN ('seller', 'dealer')
    )
    AND seller_id = auth.uid()
  );

-- Los vendedores pueden actualizar sus propios vehículos
CREATE POLICY "Sellers can update their own vehicles" ON vehicles
  FOR UPDATE USING (
    seller_id = auth.uid()
    OR 
    tenant_id IN (
      SELECT tenant_id FROM user_profiles 
      WHERE id = auth.uid() 
      AND role IN ('corporate_admin', 'branch_manager', 'sales_manager')
    )
  );

-- Los vendedores pueden eliminar sus propios vehículos
CREATE POLICY "Sellers can delete their own vehicles" ON vehicles
  FOR DELETE USING (
    seller_id = auth.uid()
    OR 
    tenant_id IN (
      SELECT tenant_id FROM user_profiles 
      WHERE id = auth.uid() 
      AND role IN ('corporate_admin', 'branch_manager')
    )
  );

-- =====================================================
-- FUNCIÓN PARA CREAR PERFIL AUTOMÁTICAMENTE
-- =====================================================

-- Función que se ejecuta cuando se registra un nuevo usuario
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- No crear perfil automáticamente, se hará manualmente
  -- para tener control sobre el tenant_id
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger cuando se crea un nuevo usuario en auth.users
-- Eliminar trigger existente si existe
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- VERIFICACIÓN FINAL
-- =====================================================

-- Verificar que las tablas se crearon correctamente
SELECT 
  schemaname, 
  tablename, 
  tableowner
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('tenants', 'user_profiles', 'vehicle_brands', 'vehicle_models', 'vehicles')
ORDER BY tablename;