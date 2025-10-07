-- Script para debuggear RLS policies y permisos de usuario
-- Ejecutar en Supabase SQL Editor

-- 1. Verificar configuración del usuario actual
SELECT 
  au.id,
  au.email,
  u.tenant_id,
  u.role,
  u.user_type,
  u.branch_id,
  t.name as tenant_name,
  t.slug as tenant_slug
FROM auth.users au
LEFT JOIN public.users u ON au.id = u.id
LEFT JOIN public.tenants t ON u.tenant_id = t.id
WHERE au.email = 'admin.toyota@toyotacentro.cl';

-- 2. Ver cuántos vehículos existen para Toyota Centro
SELECT COUNT(*) as total_vehicles
FROM vehicles v
JOIN tenants t ON v.tenant_id = t.id
WHERE t.slug = 'toyota-centro';

-- 3. Ver los vehículos con detalles
SELECT 
  v.id,
  v.make,
  v.model,
  v.year,
  v.price,
  v.status,
  t.name as tenant_name,
  t.slug as tenant_slug,
  b.city as branch_city
FROM vehicles v
JOIN tenants t ON v.tenant_id = t.id
JOIN branches b ON v.branch_id = b.id
WHERE t.slug = 'toyota-centro'
ORDER BY v.created_at DESC;

-- 4. Verificar RLS policies en la tabla vehicles
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'vehicles';

-- 5. Verificar si RLS está habilitado en la tabla
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE tablename = 'vehicles';
