-- ============================================
-- CORREGIR ASIGNACIÓN DE VEHÍCULOS
-- ============================================
-- Los admins y gerentes NO deben tener vehículos asignados
-- Solo los vendedores (sales_person) deben tener vehículos

DO $$
DECLARE
  -- IDs de tenants
  toyota_id uuid;
  premium_id uuid;
  
  -- IDs de usuarios Toyota
  admin_toyota_id uuid;
  gerente_lascondes_id uuid;
  vendedor_lascondes_id uuid;
  vendedor_maipu_id uuid;
  
  -- IDs de usuarios Premium
  admin_premium_id uuid;
  vendedor_vitacura_id uuid;
  
  -- Contadores
  total_vehicles_toyota int := 0;
  total_vehicles_premium int := 0;
  vehicles_sin_asignar int := 0;
BEGIN
  
  RAISE NOTICE '🔧 CORRIGIENDO ASIGNACIÓN DE VEHÍCULOS...';
  RAISE NOTICE '';
  
  -- ============================================
  -- 1. OBTENER IDs DE TENANTS
  -- ============================================
  SELECT id INTO toyota_id FROM tenants WHERE slug = 'toyota-centro';
  SELECT id INTO premium_id FROM tenants WHERE slug = 'premium-motors';
  
  -- ============================================
  -- 2. OBTENER IDs DE USUARIOS
  -- ============================================
  SELECT id INTO admin_toyota_id FROM auth.users WHERE email = 'admin.toyota@toyotacentro.cl';
  SELECT id INTO gerente_lascondes_id FROM auth.users WHERE email = 'gerente.lascondes@toyotacentro.cl';
  SELECT id INTO vendedor_lascondes_id FROM auth.users WHERE email = 'vendedor1.lascondes@toyotacentro.cl';
  SELECT id INTO vendedor_maipu_id FROM auth.users WHERE email = 'vendedor1.maipu@toyotacentro.cl';
  
  SELECT id INTO admin_premium_id FROM auth.users WHERE email = 'admin.premium@premiummotors.cl';
  SELECT id INTO vendedor_vitacura_id FROM auth.users WHERE email = 'vendedor.vitacura@premiummotors.cl';
  
  RAISE NOTICE '✅ Usuarios encontrados';
  RAISE NOTICE '';
  
  -- ============================================
  -- 3. VERIFICAR ESTADO ACTUAL
  -- ============================================
  SELECT COUNT(*) INTO total_vehicles_toyota FROM vehicles WHERE tenant_id = toyota_id;
  SELECT COUNT(*) INTO total_vehicles_premium FROM vehicles WHERE tenant_id = premium_id;
  SELECT COUNT(*) INTO vehicles_sin_asignar FROM vehicles WHERE assigned_to IS NULL;
  
  RAISE NOTICE '📊 Estado actual:';
  RAISE NOTICE '   - Total vehículos Toyota Centro: %', total_vehicles_toyota;
  RAISE NOTICE '   - Total vehículos Premium Motors: %', total_vehicles_premium;
  RAISE NOTICE '   - Vehículos sin asignar: %', vehicles_sin_asignar;
  RAISE NOTICE '';
  -- ============================================
  -- 4. REASIGNAR TODOS LOS VEHÍCULOS DE TOYOTA
  -- ============================================
  IF total_vehicles_toyota > 0 THEN
    RAISE NOTICE '🔄 Reasignando TODOS los vehículos de Toyota Centro...';
    
    -- Asignar directamente sin poner NULL primero (seller_id es NOT NULL)
    WITH vehiculos_toyota AS (
      SELECT 
        id,
        ROW_NUMBER() OVER (ORDER BY created_at) as row_num
      FROM vehicles
      WHERE tenant_id = toyota_id
    )
    UPDATE vehicles v
    SET 
      seller_id = CASE 
        WHEN vt.row_num % 2 = 1 THEN vendedor_lascondes_id  -- Impares a Las Condes
        ELSE vendedor_maipu_id                                -- Pares a Maipú
      END,
      updated_at = NOW()
    FROM vehiculos_toyota vt
    WHERE v.id = vt.id;
    
    RAISE NOTICE '   ✅ Vehículos de Toyota reasignados 50/50';
  END IF;
  
  -- ============================================
  -- 5. REASIGNAR TODOS LOS VEHÍCULOS DE PREMIUM
  -- ============================================
  IF total_vehicles_premium > 0 THEN
    RAISE NOTICE '🔄 Reasignando TODOS los vehículos de Premium Motors...';
    
    -- Todos los vehículos de Premium van al vendedor de Vitacura
    UPDATE vehicles
    SET 
      seller_id = vendedor_vitacura_id,
      updated_at = NOW()
    WHERE tenant_id = premium_id;
    
    RAISE NOTICE '   ✅ Vehículos de Premium reasignados a Vitacura';
  END IF;
  
  -- ============================================
  -- 6. VERIFICAR ASIGNACIÓN CORRECTA
  -- ============================================
  RAISE NOTICE '';
  RAISE NOTICE '✅ NUEVA DISTRIBUCIÓN:';
  RAISE NOTICE '';
  
  -- Contar vehículos por vendedor
  DECLARE
    count_lascondes int;
    count_maipu int;
    count_vitacura int;
  BEGIN
    SELECT COUNT(*) INTO count_lascondes FROM vehicles WHERE seller_id = vendedor_lascondes_id;
    SELECT COUNT(*) INTO count_maipu FROM vehicles WHERE seller_id = vendedor_maipu_id;
    SELECT COUNT(*) INTO count_vitacura FROM vehicles WHERE seller_id = vendedor_vitacura_id;
    
    RAISE NOTICE '📊 Toyota Centro:';
    RAISE NOTICE '   - Vendedor Las Condes: % vehículos', count_lascondes;
    RAISE NOTICE '   - Vendedor Maipú: % vehículos', count_maipu;
    RAISE NOTICE '';
    RAISE NOTICE '📊 Premium Motors:';
    RAISE NOTICE '   - Vendedor Vitacura: % vehículos', count_vitacura;
  END;
  
  RAISE NOTICE '';
  RAISE NOTICE '🎉 ¡CORRECCIÓN COMPLETADA!';
  RAISE NOTICE '';
  RAISE NOTICE '✅ Los admins y gerentes ya NO tienen vehículos';
  RAISE NOTICE '✅ Solo los vendedores tienen vehículos asignados';
  
END $$;

-- ============================================
-- VERIFICACIÓN: Ver asignación por rol
-- ============================================
SELECT 
  u.role,
  u.user_type,
  au.email,
  t.name as tenant,
  b.name as branch,
  COUNT(v.id) as total_vehiculos
FROM users u
JOIN auth.users au ON u.id = au.id
JOIN tenants t ON u.tenant_id = t.id
LEFT JOIN branches b ON u.branch_id = b.id
LEFT JOIN vehicles v ON v.seller_id = u.id  -- CAMBIO: usar seller_id en lugar de assigned_to
WHERE t.slug IN ('toyota-centro', 'premium-motors')
GROUP BY u.role, u.user_type, au.email, t.name, b.name
ORDER BY 
  t.name,
  CASE 
    WHEN u.role = 'corporate_admin' THEN 1
    WHEN u.role = 'branch_manager' THEN 2
    WHEN u.role = 'sales_person' THEN 3
    ELSE 4
  END,
  au.email;
