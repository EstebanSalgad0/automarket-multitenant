-- ============================================
-- MIGRACIÓN SIMPLIFICADA SIN POLÍTICAS RLS PROBLEMÁTICAS
-- Ejecutar DESPUÉS del script de limpieza
-- ============================================

-- Habilitar extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- PASO 1: AGREGAR COLUMNAS A USERS PRIMERO
-- ============================================

-- Agregar campos a la tabla users
ALTER TABLE users ADD COLUMN branch_id UUID;
ALTER TABLE users ADD COLUMN role TEXT CHECK (role IN ('corporate_admin', 'branch_manager', 'sales_person', 'buyer'));
ALTER TABLE users ADD COLUMN full_name VARCHAR(200);
ALTER TABLE users ADD COLUMN avatar_url VARCHAR(500);

-- Agregar campos a la tabla vehicles
ALTER TABLE vehicles ADD COLUMN assigned_to UUID;
ALTER TABLE vehicles ADD COLUMN favorite_count INTEGER DEFAULT 0;

-- ============================================
-- PASO 2: CREAR NUEVAS TABLAS
-- ============================================

-- Tabla BRANCHES (Sedes/Sucursales)
CREATE TABLE branches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(50) NOT NULL,
    address TEXT,
    city VARCHAR(50),
    region VARCHAR(50),
    phone VARCHAR(20),
    email VARCHAR(100),
    manager_id UUID REFERENCES users(id),
    status TEXT CHECK (status IN ('active', 'inactive', 'maintenance')) DEFAULT 'active',
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(tenant_id, slug)
);

-- Tabla LEADS (Sistema de Consultas)
CREATE TABLE leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    branch_id UUID NOT NULL REFERENCES branches(id),
    vehicle_id UUID NOT NULL REFERENCES vehicles(id),
    assigned_to UUID REFERENCES users(id),
    customer_name VARCHAR(100) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(20),
    message TEXT NOT NULL,
    status TEXT CHECK (status IN ('new', 'contacted', 'qualified', 'lost', 'sold')) DEFAULT 'new',
    priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'urgent')) DEFAULT 'medium',
    source VARCHAR(50),
    scheduled_date TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla FAVORITES (Favoritos de usuarios)
CREATE TABLE favorites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, vehicle_id)
);

-- Tabla MESSAGES (Sistema de Mensajería)
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES users(id),
    message TEXT NOT NULL,
    message_type TEXT CHECK (message_type IN ('text', 'image', 'document')) DEFAULT 'text',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- PASO 3: AGREGAR FOREIGN KEYS
-- ============================================

-- Agregar foreign keys para users
ALTER TABLE users ADD CONSTRAINT users_branch_id_fkey 
FOREIGN KEY (branch_id) REFERENCES branches(id);

-- Agregar columna branch_id a vehicles y su constraint
ALTER TABLE vehicles ADD COLUMN branch_id UUID;
ALTER TABLE vehicles ADD CONSTRAINT vehicles_branch_id_fkey 
FOREIGN KEY (branch_id) REFERENCES branches(id);

ALTER TABLE vehicles ADD CONSTRAINT vehicles_assigned_to_fkey 
FOREIGN KEY (assigned_to) REFERENCES users(id);

-- ============================================
-- PASO 4: CREAR ÍNDICES (IF NOT EXISTS)
-- ============================================

CREATE INDEX IF NOT EXISTS idx_users_tenant_id ON users(tenant_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_branch_id ON users(branch_id);

CREATE INDEX IF NOT EXISTS idx_vehicles_branch_id ON vehicles(branch_id);
CREATE INDEX IF NOT EXISTS idx_vehicles_assigned_to ON vehicles(assigned_to);

CREATE INDEX IF NOT EXISTS idx_branches_tenant_id ON branches(tenant_id);
CREATE INDEX IF NOT EXISTS idx_branches_manager_id ON branches(manager_id);
CREATE INDEX IF NOT EXISTS idx_branches_status ON branches(status);

CREATE INDEX IF NOT EXISTS idx_leads_tenant_id ON leads(tenant_id);
CREATE INDEX IF NOT EXISTS idx_leads_branch_id ON leads(branch_id);
CREATE INDEX IF NOT EXISTS idx_leads_assigned_to ON leads(assigned_to);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);

CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_vehicle_id ON favorites(vehicle_id);

CREATE INDEX IF NOT EXISTS idx_messages_lead_id ON messages(lead_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);

-- ============================================
-- PASO 5: HABILITAR RLS BÁSICO (SIN POLÍTICAS PROBLEMÁTICAS)
-- ============================================

-- Habilitar RLS en las nuevas tablas
ALTER TABLE branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Políticas básicas que NO usan la columna role
CREATE POLICY "branches_tenant_isolation" ON branches FOR ALL USING (tenant_id = get_current_tenant_id());
CREATE POLICY "leads_tenant_isolation" ON leads FOR ALL USING (tenant_id = get_current_tenant_id());
CREATE POLICY "favorites_own_records" ON favorites FOR ALL USING (user_id = auth.uid());
CREATE POLICY "messages_via_leads" ON messages FOR ALL USING (
    EXISTS (SELECT 1 FROM leads WHERE id = lead_id AND tenant_id = get_current_tenant_id())
);

-- ============================================
-- PASO 6: DATOS DE EJEMPLO
-- ============================================

-- Insertar sucursales de ejemplo
INSERT INTO branches (id, tenant_id, name, slug, city, region, status) VALUES
('b1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'AutoMarket Las Condes', 'las-condes', 'Santiago', 'Metropolitana', 'active'),
('b2222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'AutoMarket Providencia', 'providencia', 'Santiago', 'Metropolitana', 'active'),
('b3333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 'AutoMarket Valparaíso', 'valparaiso', 'Valparaíso', 'Valparaíso', 'active');

-- Actualizar algunos usuarios con roles
UPDATE users SET role = 'corporate_admin', full_name = 'Administrador Corporativo' 
WHERE email LIKE '%admin%' AND tenant_id = '11111111-1111-1111-1111-111111111111';

-- ============================================
-- VERIFICACIÓN FINAL
-- ============================================

-- Verificar que la columna role ahora existe
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'users' AND column_name IN ('role', 'branch_id', 'full_name', 'avatar_url');

-- Mostrar resumen de tablas creadas
SELECT 
    tablename as table_name,
    (SELECT count(*) FROM information_schema.columns WHERE table_name = t.tablename) as column_count
FROM pg_tables t
WHERE schemaname = 'public' 
AND tablename IN ('branches', 'leads', 'favorites', 'messages')
ORDER BY tablename;

-- ✅ MIGRACIÓN COMPLETADA SIN ERRORES
SELECT 'Migración completada exitosamente' as status;