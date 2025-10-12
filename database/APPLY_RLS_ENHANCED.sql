-- ==================================================================
-- SCRIPT DE APLICACIÓN SEGURA DE RLS POLICIES ENHANCED
-- ==================================================================
-- Este script aplica las nuevas políticas RLS de forma segura
-- Ejecutar en el SQL Editor de Supabase paso a paso

-- PASO 1: Verificar estado actual
SELECT 
    schemaname,
    tablename,
    rowsecurity,
    (SELECT count(*) FROM pg_policies WHERE schemaname = 'public' AND tablename = t.tablename) as policy_count
FROM pg_tables t 
WHERE schemaname = 'public' 
AND tablename IN ('users', 'vehicles', 'vehicle_images', 'user_profiles', 'dealer_profiles', 'branches', 'leads', 'messages', 'favorites')
ORDER BY tablename;

-- PASO 2: Aplicar las nuevas políticas
-- (Ejecutar el contenido completo de RLS_POLICIES_ENHANCED.sql)

-- PASO 3: Verificar que las políticas se aplicaron correctamente
SELECT 
    schemaname,
    tablename,
    policyname,
    cmd,
    permissive,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public'
AND tablename IN ('vehicles', 'vehicle_images', 'user_profiles', 'dealer_profiles')
ORDER BY tablename, policyname;

-- PASO 4: Test básico de conectividad
-- Ejecutar como usuario autenticado para verificar que las funciones funcionan
SELECT 
    'Testing functions...' as status,
    get_current_user_tenant_id() as tenant_id,
    is_current_user_buyer() as is_buyer,
    user_has_tenant() as has_tenant;

-- PASO 5: Test de acceso a vehículos (ejecutar con diferentes usuarios)
SELECT 
    count(*) as total_vehicles_visible,
    count(CASE WHEN status = 'active' THEN 1 END) as active_vehicles,
    count(CASE WHEN status = 'available' THEN 1 END) as available_vehicles
FROM vehicles;

-- PASO 6: Verificar que no hay errores en las políticas
SELECT 
    tablename,
    policyname,
    'OK' as status
FROM pg_policies 
WHERE schemaname = 'public'
AND policyname LIKE 'Enhanced_%'
ORDER BY tablename;

-- ROLLBACK SCRIPT (en caso de problemas)
/*
-- Ejecutar solo si hay problemas y necesitas volver al estado anterior

-- Eliminar todas las políticas enhanced
DROP POLICY IF EXISTS "Enhanced_vehicles_select_policy" ON vehicles;
DROP POLICY IF EXISTS "Enhanced_vehicles_insert_policy" ON vehicles;
DROP POLICY IF EXISTS "Enhanced_vehicles_update_policy" ON vehicles;
DROP POLICY IF EXISTS "Enhanced_vehicles_delete_policy" ON vehicles;
DROP POLICY IF EXISTS "Enhanced_vehicle_images_select_policy" ON vehicle_images;
DROP POLICY IF EXISTS "Enhanced_vehicle_images_insert_policy" ON vehicle_images;
DROP POLICY IF EXISTS "Enhanced_user_profiles_select_policy" ON user_profiles;
DROP POLICY IF EXISTS "Enhanced_user_profiles_modify_policy" ON user_profiles;
DROP POLICY IF EXISTS "Enhanced_dealer_profiles_select_policy" ON dealer_profiles;
DROP POLICY IF EXISTS "Enhanced_dealer_profiles_modify_policy" ON dealer_profiles;
DROP POLICY IF EXISTS "Enhanced_users_select_policy" ON users;
DROP POLICY IF EXISTS "Enhanced_users_update_policy" ON users;
DROP POLICY IF EXISTS "Enhanced_favorites_policy" ON favorites;
DROP POLICY IF EXISTS "Enhanced_leads_select_policy" ON leads;
DROP POLICY IF EXISTS "Enhanced_leads_insert_policy" ON leads;
DROP POLICY IF EXISTS "Enhanced_leads_update_policy" ON leads;
DROP POLICY IF EXISTS "Enhanced_branches_select_policy" ON branches;
DROP POLICY IF EXISTS "Enhanced_branches_modify_policy" ON branches;
DROP POLICY IF EXISTS "Enhanced_messages_select_policy" ON messages;
DROP POLICY IF EXISTS "Enhanced_messages_insert_policy" ON messages;

-- Restaurar políticas originales (copiar del schema.sql original)
*/