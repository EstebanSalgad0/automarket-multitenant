-- 🧪 TESTING RLS POLICIES - AutoMarket Multitenant
-- Este script verifica que las Row Level Security policies funcionen correctamente
-- Ejecutar en Supabase SQL Editor paso a paso

-- ============================================================================
-- 📋 VERIFICACIÓN PREVIA: Usuarios de prueba disponibles
-- ============================================================================

-- Ver usuarios existentes y sus roles
SELECT 
    u.id,
    u.email,
    u.tenant_id,
    u.branch_id,
    u.role,
    up.first_name,
    up.last_name,
    t.name as tenant_name,
    b.name as branch_name
FROM users u
LEFT JOIN user_profiles up ON u.id = up.user_id
LEFT JOIN tenants t ON u.tenant_id = t.id
LEFT JOIN branches b ON u.branch_id = b.id
ORDER BY u.tenant_id, u.role;

-- ============================================================================
-- 🚗 TEST 1: Verificar acceso a vehículos por tipo de usuario
-- ============================================================================

-- TEST 1A: Usuario COMPRADOR (sin tenant_id) debe ver TODOS los vehículos disponibles
-- Simular login como comprador1@email.com
SET LOCAL "request.jwt.claims" = '{"sub": "comprador-user-id", "email": "comprador1@email.com"}';

-- Esta query debe retornar TODOS los vehículos con status='available' (aproximadamente 19)
SELECT 
    v.id,
    v.make,
    v.model,
    v.year,
    v.price,
    v.status,
    t.name as tenant_name
FROM vehicles v
LEFT JOIN tenants t ON v.tenant_id = t.id
WHERE v.status = 'available'
ORDER BY t.name, v.make;

-- Reset del contexto
RESET ALL;

-- TEST 1B: Usuario ADMIN TOYOTA debe ver solo vehículos de su tenant
-- Simular login como admin.toyota@toyotacentro.cl
SET LOCAL "request.jwt.claims" = '{"sub": "admin-toyota-user-id", "email": "admin.toyota@toyotacentro.cl"}';

-- Esta query debe retornar solo vehículos de Toyota Centro (aproximadamente 5)
SELECT 
    v.id,
    v.make,
    v.model,
    v.year,
    v.price,
    v.status,
    t.name as tenant_name
FROM vehicles v
LEFT JOIN tenants t ON v.tenant_id = t.id
ORDER BY v.make;

RESET ALL;

-- TEST 1C: Usuario VENDEDOR debe ver solo vehículos de su tenant
-- Simular login como vendedor1.lascondes@toyotacentro.cl
SET LOCAL "request.jwt.claims" = '{"sub": "vendedor1-lascondes-user-id", "email": "vendedor1.lascondes@toyotacentro.cl"}';

-- Esta query debe retornar solo vehículos de Toyota Centro
SELECT 
    v.id,
    v.make,
    v.model,
    v.year,
    v.price,
    v.status,
    t.name as tenant_name
FROM vehicles v
LEFT JOIN tenants t ON v.tenant_id = t.id
ORDER BY v.make;

RESET ALL;

-- ============================================================================
-- 👥 TEST 2: Verificar acceso a usuarios por tenant
-- ============================================================================

-- TEST 2A: Admin corporativo debe ver usuarios de su tenant
SET LOCAL "request.jwt.claims" = '{"sub": "admin-toyota-user-id", "email": "admin.toyota@toyotacentro.cl"}';

SELECT 
    u.id,
    u.email,
    u.role,
    up.first_name,
    up.last_name,
    b.name as branch_name
FROM users u
LEFT JOIN user_profiles up ON u.id = up.user_id
LEFT JOIN branches b ON u.branch_id = b.id
ORDER BY u.role, up.first_name;

RESET ALL;

-- ============================================================================
-- 🏢 TEST 3: Verificar acceso a sucursales por tenant
-- ============================================================================

-- TEST 3A: Admin debe ver sucursales de su tenant
SET LOCAL "request.jwt.claims" = '{"sub": "admin-toyota-user-id", "email": "admin.toyota@toyotacentro.cl"}';

SELECT 
    b.id,
    b.name,
    b.address,
    b.phone,
    t.name as tenant_name
FROM branches b
LEFT JOIN tenants t ON b.tenant_id = t.id
ORDER BY b.name;

RESET ALL;

-- ============================================================================
-- 📊 TEST 4: Verificar acceso a leads por tenant
-- ============================================================================

-- TEST 4A: Vendedor debe ver leads de su tenant/sucursal
SET LOCAL "request.jwt.claims" = '{"sub": "vendedor1-lascondes-user-id", "email": "vendedor1.lascondes@toyotacentro.cl"}';

SELECT 
    l.id,
    l.customer_name,
    l.customer_email,
    l.status,
    v.make,
    v.model,
    b.name as branch_name
FROM leads l
LEFT JOIN vehicles v ON l.vehicle_id = v.id
LEFT JOIN branches b ON l.branch_id = b.id
ORDER BY l.created_at DESC;

RESET ALL;

-- ============================================================================
-- 🔒 TEST 5: Verificar prevención de acceso no autorizado
-- ============================================================================

-- TEST 5A: Comprador NO debe poder insertar vehículos
SET LOCAL "request.jwt.claims" = '{"sub": "comprador-user-id", "email": "comprador1@email.com"}';

-- Esta query debe FALLAR con error de permisos
-- INSERT INTO vehicles (tenant_id, seller_id, make, model, year, price)
-- VALUES ('tenant-id', 'comprador-user-id', 'Test', 'Car', 2024, 10000);

-- TEST 5B: Usuario de un tenant NO debe ver vehículos de otro tenant (a menos que sea comprador)
-- Ya verificado en tests anteriores

RESET ALL;

-- ============================================================================
-- 📈 RESULTADOS ESPERADOS
-- ============================================================================

/*
RESULTADOS ESPERADOS:

✅ COMPRADORES:
- Pueden ver TODOS los vehículos con status='available'
- NO pueden ver usuarios, sucursales, leads de ningún tenant
- NO pueden insertar/modificar vehículos

✅ VENDEDORES:
- Pueden ver solo vehículos de su tenant
- Pueden ver usuarios de su tenant
- Pueden ver sucursales de su tenant
- Pueden ver leads asignados a ellos o de su sucursal
- Pueden insertar/modificar vehículos de su tenant

✅ ADMINS CORPORATIVOS:
- Pueden ver todos los datos de su tenant
- Pueden gestionar usuarios, sucursales, vehículos de su tenant
- NO pueden ver datos de otros tenants

✅ GERENTES DE SUCURSAL:
- Pueden ver datos específicos de su sucursal
- Pueden gestionar vendedores de su sucursal
- Pueden ver vehículos y leads de su sucursal

❌ FALLOS COMUNES A INVESTIGAR:
- Si compradores no ven vehículos → Verificar policy "buyers_can_view_available_vehicles"
- Si vendedores ven vehículos de otros tenants → Verificar policy "tenant_isolation_vehicles"
- Si hay errores de permisos → Verificar que las funciones helper estén creadas
*/

-- ============================================================================
-- 🚨 TROUBLESHOOTING COMMANDS
-- ============================================================================

-- Ver policies activas
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Ver si RLS está habilitado en las tablas
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND rowsecurity = true;

-- Ver funciones helper creadas
SELECT routine_name, routine_type 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name LIKE '%tenant%' OR routine_name LIKE '%user%';