-- =====================================================
-- AutoMarket MultiTenant - Asignación de Usuarios SIMPLIFICADA
-- =====================================================

-- Función para vincular usuarios con tenants específicos
CREATE OR REPLACE FUNCTION assign_user_to_tenant(
  user_email text,
  tenant_name text,
  user_role text DEFAULT 'seller'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  auth_user_id uuid;
  tenant_uuid uuid;
BEGIN
  -- Buscar el usuario en auth.users
  SELECT id INTO auth_user_id 
  FROM auth.users 
  WHERE email = user_email;
  
  IF auth_user_id IS NULL THEN
    RAISE EXCEPTION 'Usuario con email % no encontrado en auth.users', user_email;
  END IF;
  
  -- Buscar el tenant
  SELECT id INTO tenant_uuid 
  FROM tenants 
  WHERE company_name = tenant_name;
  
  IF tenant_uuid IS NULL THEN
    RAISE EXCEPTION 'Tenant % no encontrado', tenant_name;
  END IF;
  
  -- Crear o actualizar el perfil del usuario
  INSERT INTO user_profiles (
    id, tenant_id, email, user_type, role, full_name
  ) VALUES (
    auth_user_id,
    tenant_uuid,
    user_email,
    CASE 
      WHEN user_role = 'admin' THEN 'admin'
      ELSE 'seller'
    END,
    CASE 
      WHEN user_role = 'admin' THEN 'corporate_admin'
      ELSE 'salesperson'
    END,
    split_part(user_email, '@', 1)
  ) ON CONFLICT (id) DO UPDATE SET
    tenant_id = tenant_uuid,
    role = CASE 
      WHEN user_role = 'admin' THEN 'corporate_admin'
      ELSE 'salesperson'
    END,
    updated_at = now();
  
  RAISE NOTICE 'Usuario % asignado al tenant % con rol %', user_email, tenant_name, user_role;
END;
$$;

-- =====================================================
-- EJECUTAR ASIGNACIONES DE USUARIOS
-- =====================================================
SELECT assign_user_to_tenant('admin@toyotacentro.cl', 'Toyota Centro Chile', 'admin');
SELECT assign_user_to_tenant('vendedor@toyotacentro.cl', 'Toyota Centro Chile', 'seller');
SELECT assign_user_to_tenant('admin@premiummotors.cl', 'Premium Motors', 'admin');
SELECT assign_user_to_tenant('vendedor@autoindependientes.cl', 'AutoVendedores Independientes', 'seller');

-- =====================================================
-- VERIFICAR CONFIGURACIÓN DE USUARIOS
-- =====================================================
SELECT 
  au.email as user_email,
  up.role as user_role,
  t.company_name as tenant_name,
  (up.id IS NOT NULL) as profile_exists
FROM auth.users au
LEFT JOIN user_profiles up ON au.id = up.id
LEFT JOIN tenants t ON up.tenant_id = t.id
ORDER BY au.email;