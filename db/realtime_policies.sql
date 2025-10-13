-- =============================================
-- POLÍTICAS DE TIEMPO REAL PARA SUPABASE
-- =============================================
-- Estas políticas deben aplicarse en la sección "Realtime" > "Políticas" 
-- de tu proyecto Supabase para habilitar las suscripciones en tiempo real
-- =============================================

-- 1. POLÍTICA PARA TABLA: tenants
-- Permite que los usuarios puedan suscribirse a cambios en tenants
-- Solo pueden ver el tenant al que pertenecen
CREATE POLICY "realtime_tenants_policy" ON "public"."tenants"
AS PERMISSIVE FOR SELECT
TO authenticated
USING (true);

-- 2. POLÍTICA PARA TABLA: user_profiles  
-- Permite suscripciones a perfiles de usuarios del mismo tenant
CREATE POLICY "realtime_user_profiles_policy" ON "public"."user_profiles"
AS PERMISSIVE FOR SELECT
TO authenticated
USING (
  tenant_id IN (
    SELECT tenant_id 
    FROM user_profiles 
    WHERE id = auth.uid()
  )
);

-- 3. POLÍTICA PARA TABLA: branches
-- Permite suscripciones a sucursales del mismo tenant
CREATE POLICY "realtime_branches_policy" ON "public"."branches"
AS PERMISSIVE FOR SELECT
TO authenticated
USING (
  tenant_id IN (
    SELECT tenant_id 
    FROM user_profiles 
    WHERE id = auth.uid()
  )
);

-- 4. POLÍTICA PARA TABLA: vehicles
-- Permite suscripciones a vehículos del mismo tenant
CREATE POLICY "realtime_vehicles_policy" ON "public"."vehicles"
AS PERMISSIVE FOR SELECT
TO authenticated
USING (
  tenant_id IN (
    SELECT tenant_id 
    FROM user_profiles 
    WHERE id = auth.uid()
  )
);

-- 5. POLÍTICA PARA TABLA: leads
-- Permite suscripciones a leads del mismo tenant
-- Los vendedores solo ven sus leads asignados
CREATE POLICY "realtime_leads_policy" ON "public"."leads"
AS PERMISSIVE FOR SELECT
TO authenticated
USING (
  tenant_id IN (
    SELECT tenant_id 
    FROM user_profiles 
    WHERE id = auth.uid()
  )
  AND (
    -- Administradores y gerentes ven todos los leads del tenant
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() 
      AND user_type IN ('dealer') 
      AND role IN ('admin', 'manager')
    )
    -- Vendedores solo ven sus leads asignados
    OR assigned_to = auth.uid()
    -- O leads sin asignar
    OR assigned_to IS NULL
  )
);

-- 6. POLÍTICA PARA TABLA: lead_activities
-- Permite suscripciones a actividades de leads relacionados
CREATE POLICY "realtime_lead_activities_policy" ON "public"."lead_activities"
AS PERMISSIVE FOR SELECT
TO authenticated
USING (
  lead_id IN (
    SELECT id FROM leads
    WHERE tenant_id IN (
      SELECT tenant_id 
      FROM user_profiles 
      WHERE id = auth.uid()
    )
    AND (
      -- Mismas condiciones que leads
      EXISTS (
        SELECT 1 FROM user_profiles 
        WHERE id = auth.uid() 
        AND user_type IN ('dealer') 
        AND role IN ('admin', 'manager')
      )
      OR assigned_to = auth.uid()
      OR assigned_to IS NULL
    )
  )
);

-- 7. POLÍTICA PARA TABLA: sales
-- Permite suscripciones a ventas del mismo tenant
CREATE POLICY "realtime_sales_policy" ON "public"."sales"
AS PERMISSIVE FOR SELECT
TO authenticated
USING (
  tenant_id IN (
    SELECT tenant_id 
    FROM user_profiles 
    WHERE id = auth.uid()
  )
  AND (
    -- Administradores y gerentes ven todas las ventas
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() 
      AND user_type IN ('dealer') 
      AND role IN ('admin', 'manager')
    )
    -- Vendedores solo ven sus ventas
    OR salesperson_id = auth.uid()
  )
);

-- 8. POLÍTICA PARA TABLA: vehicle_images
-- Permite suscripciones a imágenes de vehículos del mismo tenant
CREATE POLICY "realtime_vehicle_images_policy" ON "public"."vehicle_images"
AS PERMISSIVE FOR SELECT
TO authenticated
USING (
  vehicle_id IN (
    SELECT id FROM vehicles
    WHERE tenant_id IN (
      SELECT tenant_id 
      FROM user_profiles 
      WHERE id = auth.uid()
    )
  )
);

-- =============================================
-- HABILITAR TIEMPO REAL EN LAS TABLAS
-- =============================================
-- Estos comandos habilitan el tiempo real para cada tabla
-- NOTA: Ejecutar desde SQL Editor después de crear las políticas

ALTER PUBLICATION supabase_realtime ADD TABLE tenants;
ALTER PUBLICATION supabase_realtime ADD TABLE user_profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE branches;
ALTER PUBLICATION supabase_realtime ADD TABLE vehicles;
ALTER PUBLICATION supabase_realtime ADD TABLE leads;
ALTER PUBLICATION supabase_realtime ADD TABLE lead_activities;
ALTER PUBLICATION supabase_realtime ADD TABLE sales;
ALTER PUBLICATION supabase_realtime ADD TABLE vehicle_images;