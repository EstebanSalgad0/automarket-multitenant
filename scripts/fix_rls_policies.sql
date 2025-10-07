-- Script para corregir las RLS policies
-- El problema es que las policies buscan tenant_id en users, pero está en user_profiles

-- 1. Eliminar las policies existentes incorrectas
DROP POLICY IF EXISTS "Users can view their tenant data" ON users;
DROP POLICY IF EXISTS "View vehicles from user's tenant" ON vehicles;
DROP POLICY IF EXISTS "Users can insert vehicles to their tenant" ON vehicles;
DROP POLICY IF EXISTS "View images from accessible vehicles" ON vehicle_images;

-- 2. Crear policies corregidas

-- Policy para ver vehículos del mismo tenant
CREATE POLICY "View vehicles from user's tenant" ON vehicles 
FOR SELECT 
USING (
  tenant_id = (
    SELECT u.tenant_id 
    FROM users u 
    WHERE u.id = auth.uid()
  )
);

-- Policy para insertar vehículos en el tenant del usuario
CREATE POLICY "Users can insert vehicles to their tenant" ON vehicles 
FOR INSERT 
WITH CHECK (
  tenant_id = (
    SELECT u.tenant_id 
    FROM users u 
    WHERE u.id = auth.uid()
  ) 
  AND seller_id = auth.uid()
);

-- Policy para ver imágenes de vehículos accesibles
CREATE POLICY "View images from accessible vehicles" ON vehicle_images 
FOR SELECT 
USING (
  vehicle_id IN (
    SELECT v.id 
    FROM vehicles v
    INNER JOIN users u ON u.id = auth.uid()
    WHERE v.tenant_id = u.tenant_id
  )
);

-- 3. Verificar que las policies se crearon correctamente
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE tablename IN ('vehicles', 'vehicle_images')
ORDER BY tablename, policyname;
