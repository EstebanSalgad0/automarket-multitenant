-- =====================================================
-- AutoMarket MultiTenant - Limpieza Completa de Supabase
-- Ejecutar ANTES del schema principal si hay conflictos
-- =====================================================

-- =====================================================
-- LIMPIAR TRIGGERS EXISTENTES
-- =====================================================
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- =====================================================
-- LIMPIAR POLÍTICAS RLS EXISTENTES
-- =====================================================
DROP POLICY IF EXISTS "Users can read their own tenant" ON tenants;
DROP POLICY IF EXISTS "Super admins can manage tenants" ON tenants;
DROP POLICY IF EXISTS "Users can read profiles in their tenant" ON user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Admins can manage profiles in their tenant" ON user_profiles;
DROP POLICY IF EXISTS "Users can read vehicles in their tenant" ON vehicles;
DROP POLICY IF EXISTS "Sellers can insert vehicles in their tenant" ON vehicles;
DROP POLICY IF EXISTS "Sellers can update their own vehicles" ON vehicles;
DROP POLICY IF EXISTS "Sellers can delete their own vehicles" ON vehicles;

-- =====================================================
-- LIMPIAR FUNCIONES EXISTENTES
-- =====================================================
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS update_updated_at_column();

-- =====================================================
-- LIMPIAR TABLAS EXISTENTES
-- =====================================================
DROP TABLE IF EXISTS vehicles CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE; 
DROP TABLE IF EXISTS vehicle_models CASCADE;
DROP TABLE IF EXISTS vehicle_brands CASCADE;
DROP TABLE IF EXISTS tenants CASCADE;

-- =====================================================
-- MENSAJE DE CONFIRMACIÓN
-- =====================================================
SELECT 'Limpieza completa realizada - Ahora ejecutar el schema principal' as status;