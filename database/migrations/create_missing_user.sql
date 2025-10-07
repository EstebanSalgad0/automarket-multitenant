-- ============================================
-- SCRIPT PARA CREAR TU USUARIO EN LA TABLA USERS
-- Ejecuta este script en el SQL Editor de Supabase
-- ============================================

-- Paso 1: Primero, vamos a ver tu ID de usuario
-- Copia el resultado de esta consulta
SELECT id, email FROM auth.users WHERE email = 'salgadoesteban95@gmail.com';

-- Paso 2: Inserta tu usuario en la tabla users
-- REEMPLAZA 'TU_ID_AQUI' con el ID que obtuviste en el paso 1
-- REEMPLAZA 'TU_TENANT_ID' con el ID del tenant (normalmente el de Chile)

-- Primero obtén el tenant_id de Chile:
SELECT id, name FROM tenants WHERE slug = 'chile';

-- Ahora inserta tu usuario (ajusta los valores según necesites):
INSERT INTO users (
    id,
    tenant_id,
    email,
    phone,
    user_type,
    role,
    full_name,
    status
) VALUES (
    'TU_ID_AQUI',  -- Reemplaza con tu ID de auth.users
    (SELECT id FROM tenants WHERE slug = 'chile' LIMIT 1),  -- Tenant de Chile
    'salgadoesteban95@gmail.com',
    '940753167',
    'dealer',  -- o 'buyer', 'seller' según prefieras
    'corporate_admin',  -- Opciones: 'corporate_admin', 'branch_manager', 'sales_person', 'buyer'
    'Esteban Salgado',
    'active'
);

-- ============================================
-- SCRIPT ALTERNATIVO AUTOMÁTICO
-- Este script crea automáticamente el registro para TODOS los usuarios
-- que existen en auth.users pero no en users
-- ============================================

INSERT INTO users (id, tenant_id, email, user_type, role, full_name, status)
SELECT 
    au.id,
    (SELECT id FROM tenants WHERE slug = 'chile' LIMIT 1) as tenant_id,
    au.email,
    'buyer' as user_type,
    'corporate_admin' as role,  -- Cambia esto por el rol que quieras
    COALESCE(au.raw_user_meta_data->>'first_name', 'Usuario') || ' ' || 
    COALESCE(au.raw_user_meta_data->>'last_name', 'Nuevo') as full_name,
    'active' as status
FROM auth.users au
WHERE NOT EXISTS (
    SELECT 1 FROM users u WHERE u.id = au.id
);

-- ============================================
-- VERIFICAR QUE SE CREÓ CORRECTAMENTE
-- ============================================
SELECT 
    u.id,
    u.email,
    u.role,
    u.full_name,
    t.name as tenant_name
FROM users u
JOIN tenants t ON u.tenant_id = t.id
WHERE u.email = 'salgadoesteban95@gmail.com';
