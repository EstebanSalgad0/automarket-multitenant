-- ============================================
-- SINCRONIZAR USUARIOS DE AUTH CON TABLA USERS
-- ============================================
-- Este script asigna roles, tenants y sucursales a usuarios existentes

DO $$
DECLARE
  -- IDs de tenants
  toyota_id uuid;
  premium_id uuid;
  delsur_id uuid;
  express_id uuid;
  marketplace_id uuid;  -- Tenant para compradores y vendedores particulares
  
  -- IDs de sucursales Toyota Centro
  toyota_lascondes_id uuid;
  toyota_maipu_id uuid;
  
  -- IDs de sucursales Premium Motors
  premium_vitacura_id uuid;
  
  -- IDs de usuarios (desde auth.users)
  admin_toyota_id uuid;
  gerente_lascondes_id uuid;
  vendedor1_lascondes_id uuid;
  vendedor1_maipu_id uuid;
  admin_premium_id uuid;
  vendedor_vitacura_id uuid;
  comprador1_id uuid;
  comprador2_id uuid;
BEGIN
  
  -- ============================================
  -- 0. CREAR TENANT MARKETPLACE (si no existe)
  -- ============================================
  -- Tenant para compradores y vendedores particulares
  INSERT INTO tenants (name, slug, country_code, currency, timezone, status)
  VALUES (
    'Marketplace Público',
    'marketplace',
    'CL',  -- ISO 3166-1 alpha-2 (2 letras)
    'CLP',
    'America/Santiago',
    'active'
  )
  ON CONFLICT (slug) DO NOTHING;
  
  -- ============================================
  -- 1. OBTENER IDs DE TENANTS
  -- ============================================
  SELECT id INTO toyota_id FROM tenants WHERE slug = 'toyota-centro';
  SELECT id INTO premium_id FROM tenants WHERE slug = 'premium-motors';
  SELECT id INTO delsur_id FROM tenants WHERE slug = 'del-sur';
  SELECT id INTO express_id FROM tenants WHERE slug = 'express';
  SELECT id INTO marketplace_id FROM tenants WHERE slug = 'marketplace';
  
  RAISE NOTICE '✅ Tenants encontrados:';
  RAISE NOTICE '   - Toyota Centro: %', toyota_id;
  RAISE NOTICE '   - Premium Motors: %', premium_id;
  RAISE NOTICE '   - Marketplace: %', marketplace_id;
  
  -- ============================================
  -- 2. OBTENER IDs DE SUCURSALES
  -- ============================================
  
  -- Toyota Centro - Las Condes
  SELECT id INTO toyota_lascondes_id 
  FROM branches 
  WHERE tenant_id = toyota_id 
  AND name ILIKE '%Las Condes%'
  LIMIT 1;
  
  -- Toyota Centro - Maipú
  SELECT id INTO toyota_maipu_id 
  FROM branches 
  WHERE tenant_id = toyota_id 
  AND name ILIKE '%Maipú%'
  LIMIT 1;
  
  -- Premium Motors - Vitacura
  SELECT id INTO premium_vitacura_id 
  FROM branches 
  WHERE tenant_id = premium_id 
  AND name ILIKE '%Vitacura%'
  LIMIT 1;
  
  RAISE NOTICE '✅ Sucursales encontradas:';
  RAISE NOTICE '   - Las Condes: %', toyota_lascondes_id;
  RAISE NOTICE '   - Maipú: %', toyota_maipu_id;
  RAISE NOTICE '   - Vitacura: %', premium_vitacura_id;
  
  -- ============================================
  -- 3. OBTENER IDs DE USUARIOS DESDE AUTH.USERS
  -- ============================================
  SELECT id INTO admin_toyota_id FROM auth.users WHERE email = 'admin.toyota@toyotacentro.cl';
  SELECT id INTO gerente_lascondes_id FROM auth.users WHERE email = 'gerente.lascondes@toyotacentro.cl';
  SELECT id INTO vendedor1_lascondes_id FROM auth.users WHERE email = 'vendedor1.lascondes@toyotacentro.cl';
  SELECT id INTO vendedor1_maipu_id FROM auth.users WHERE email = 'vendedor1.maipu@toyotacentro.cl';
  SELECT id INTO admin_premium_id FROM auth.users WHERE email = 'admin.premium@premiummotors.cl';
  SELECT id INTO vendedor_vitacura_id FROM auth.users WHERE email = 'vendedor.vitacura@premiummotors.cl';
  SELECT id INTO comprador1_id FROM auth.users WHERE email = 'comprador1@email.com';
  SELECT id INTO comprador2_id FROM auth.users WHERE email = 'comprador2@email.com';
  
  RAISE NOTICE '✅ Usuarios encontrados en auth.users';
  
  -- ============================================
  -- 4. INSERTAR/ACTUALIZAR USUARIOS EN TABLA USERS
  -- ============================================
  
  -- 1. Admin Toyota Centro (Corporate Admin)
  IF admin_toyota_id IS NOT NULL THEN
    INSERT INTO users (id, tenant_id, email, role, user_type, branch_id, created_at, updated_at)
    VALUES (
      admin_toyota_id,
      toyota_id,
      'admin.toyota@toyotacentro.cl',
      'corporate_admin',
      'dealer',
      NULL,
      NOW(),
      NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
      tenant_id = EXCLUDED.tenant_id,
      role = EXCLUDED.role,
      user_type = EXCLUDED.user_type,
      branch_id = EXCLUDED.branch_id,
      updated_at = NOW();
    
    RAISE NOTICE '✅ 1. Admin Toyota - Corporate Admin';
  ELSE
    RAISE NOTICE '❌ 1. admin.toyota@toyotacentro.cl NO encontrado en auth.users';
  END IF;
  
  -- 2. Gerente Las Condes (Branch Manager)
  IF gerente_lascondes_id IS NOT NULL THEN
    INSERT INTO users (id, tenant_id, email, role, user_type, branch_id, created_at, updated_at)
    VALUES (
      gerente_lascondes_id,
      toyota_id,
      'gerente.lascondes@toyotacentro.cl',
      'branch_manager',
      'dealer',
      toyota_lascondes_id,
      NOW(),
      NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
      tenant_id = EXCLUDED.tenant_id,
      role = EXCLUDED.role,
      user_type = EXCLUDED.user_type,
      branch_id = EXCLUDED.branch_id,
      updated_at = NOW();
    
    RAISE NOTICE '✅ 2. Gerente Las Condes - Branch Manager';
  ELSE
    RAISE NOTICE '❌ 2. gerente.lascondes@toyotacentro.cl NO encontrado en auth.users';
  END IF;
  
  -- 3. Vendedor Las Condes
  IF vendedor1_lascondes_id IS NOT NULL THEN
    INSERT INTO users (id, tenant_id, email, role, user_type, branch_id, created_at, updated_at)
    VALUES (
      vendedor1_lascondes_id,
      toyota_id,
      'vendedor1.lascondes@toyotacentro.cl',
      'sales_person',
      'dealer',
      toyota_lascondes_id,
      NOW(),
      NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
      tenant_id = EXCLUDED.tenant_id,
      role = EXCLUDED.role,
      user_type = EXCLUDED.user_type,
      branch_id = EXCLUDED.branch_id,
      updated_at = NOW();
    
    RAISE NOTICE '✅ 3. Vendedor Las Condes - Sales Person';
  ELSE
    RAISE NOTICE '❌ 3. vendedor1.lascondes@toyotacentro.cl NO encontrado en auth.users';
  END IF;
  
  -- 4. Vendedor Maipú
  IF vendedor1_maipu_id IS NOT NULL THEN
    INSERT INTO users (id, tenant_id, email, role, user_type, branch_id, created_at, updated_at)
    VALUES (
      vendedor1_maipu_id,
      toyota_id,
      'vendedor1.maipu@toyotacentro.cl',
      'sales_person',
      'dealer',
      toyota_maipu_id,
      NOW(),
      NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
      tenant_id = EXCLUDED.tenant_id,
      role = EXCLUDED.role,
      user_type = EXCLUDED.user_type,
      branch_id = EXCLUDED.branch_id,
      updated_at = NOW();
    
    RAISE NOTICE '✅ 4. Vendedor Maipú - Sales Person';
  ELSE
    RAISE NOTICE '❌ 4. vendedor1.maipu@toyotacentro.cl NO encontrado en auth.users';
  END IF;
  
  -- 5. Admin Premium Motors (Corporate Admin)
  IF admin_premium_id IS NOT NULL THEN
    INSERT INTO users (id, tenant_id, email, role, user_type, branch_id, created_at, updated_at)
    VALUES (
      admin_premium_id,
      premium_id,
      'admin.premium@premiummotors.cl',
      'corporate_admin',
      'dealer',
      NULL,
      NOW(),
      NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
      tenant_id = EXCLUDED.tenant_id,
      role = EXCLUDED.role,
      user_type = EXCLUDED.user_type,
      branch_id = EXCLUDED.branch_id,
      updated_at = NOW();
    
    RAISE NOTICE '✅ 5. Admin Premium - Corporate Admin';
  ELSE
    RAISE NOTICE '❌ 5. admin.premium@premiummotors.cl NO encontrado en auth.users';
  END IF;
  
  -- 6. Vendedor Vitacura (Premium Motors)
  IF vendedor_vitacura_id IS NOT NULL THEN
    INSERT INTO users (id, tenant_id, email, role, user_type, branch_id, created_at, updated_at)
    VALUES (
      vendedor_vitacura_id,
      premium_id,
      'vendedor.vitacura@premiummotors.cl',
      'sales_person',
      'dealer',
      premium_vitacura_id,
      NOW(),
      NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
      tenant_id = EXCLUDED.tenant_id,
      role = EXCLUDED.role,
      user_type = EXCLUDED.user_type,
      branch_id = EXCLUDED.branch_id,
      updated_at = NOW();
    
    RAISE NOTICE '✅ 6. Vendedor Vitacura - Sales Person';
  ELSE
    RAISE NOTICE '❌ 6. vendedor.vitacura@premiummotors.cl NO encontrado en auth.users';
  END IF;
  
  -- 7. Comprador 1 (marketplace)
  IF comprador1_id IS NOT NULL THEN
    INSERT INTO users (id, tenant_id, email, role, user_type, branch_id, created_at, updated_at)
    VALUES (
      comprador1_id,
      marketplace_id,  -- Compradores usan tenant "marketplace"
      'comprador1@email.com',
      'buyer',
      'buyer',
      NULL,
      NOW(),
      NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
      tenant_id = EXCLUDED.tenant_id,
      role = EXCLUDED.role,
      user_type = EXCLUDED.user_type,
      branch_id = EXCLUDED.branch_id,
      updated_at = NOW();
    
    RAISE NOTICE '✅ 7. Comprador 1 - Buyer (Marketplace)';
  ELSE
    RAISE NOTICE '❌ 7. comprador1@email.com NO encontrado en auth.users';
  END IF;
  
  -- 8. Comprador 2 (marketplace)
  IF comprador2_id IS NOT NULL THEN
    INSERT INTO users (id, tenant_id, email, role, user_type, branch_id, created_at, updated_at)
    VALUES (
      comprador2_id,
      marketplace_id,  -- Compradores usan tenant "marketplace"
      'comprador2@email.com',
      'buyer',
      'buyer',
      NULL,
      NOW(),
      NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
      tenant_id = EXCLUDED.tenant_id,
      role = EXCLUDED.role,
      user_type = EXCLUDED.user_type,
      branch_id = EXCLUDED.branch_id,
      updated_at = NOW();
    
    RAISE NOTICE '✅ 8. Comprador 2 - Buyer (Marketplace)';
  ELSE
    RAISE NOTICE '❌ 8. comprador2@email.com NO encontrado en auth.users';
  END IF;
  
  RAISE NOTICE '';
  RAISE NOTICE '🎉 ¡SINCRONIZACIÓN COMPLETADA!';
  RAISE NOTICE '';
  RAISE NOTICE '📊 RESUMEN:';
  RAISE NOTICE '   - Toyota Centro: 4 usuarios';
  RAISE NOTICE '   - Premium Motors: 2 usuarios';
  RAISE NOTICE '   - Marketplace (Compradores): 2 usuarios';
  RAISE NOTICE '   - TOTAL: 8 usuarios configurados';
  
END $$;

-- ============================================
-- VERIFICACIÓN: Ver todos los usuarios con sus roles
-- ============================================
SELECT 
  au.email,
  u.role,
  u.user_type,
  t.name as tenant,
  b.name as branch
FROM auth.users au
LEFT JOIN users u ON au.id = u.id
LEFT JOIN tenants t ON u.tenant_id = t.id
LEFT JOIN branches b ON u.branch_id = b.id
WHERE au.email IN (
  'admin.toyota@toyotacentro.cl',
  'gerente.lascondes@toyotacentro.cl',
  'vendedor1.lascondes@toyotacentro.cl',
  'vendedor1.maipu@toyotacentro.cl',
  'admin.premium@premiummotors.cl',
  'vendedor.vitacura@premiummotors.cl',
  'comprador1@email.com',
  'comprador2@email.com'
)
ORDER BY 
  CASE 
    WHEN u.role = 'corporate_admin' THEN 1
    WHEN u.role = 'branch_manager' THEN 2
    WHEN u.role = 'sales_person' THEN 3
    WHEN u.role = 'buyer' THEN 4
    ELSE 5
  END,
  au.email;
