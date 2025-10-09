-- ============================================
-- CREAR VENDEDORES PARTICULARES
-- ============================================
-- Vendedores particulares que venden sus propios vehículos
-- Pertenecen al tenant "marketplace" (NO a automotoras específicas)
-- NO trabajan en sucursales (branch_id = NULL)

DO $$
DECLARE
  marketplace_id uuid;
  vendedor_particular1_id uuid;
  vendedor_particular2_id uuid;
BEGIN
  
  RAISE NOTICE '🚗 CREANDO VENDEDORES PARTICULARES...';
  RAISE NOTICE '';
  
  -- ============================================
  -- OBTENER O CREAR TENANT MARKETPLACE
  -- ============================================
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
  
  SELECT id INTO marketplace_id FROM tenants WHERE slug = 'marketplace';
  
  RAISE NOTICE '✅ Tenant Marketplace: %', marketplace_id;
  RAISE NOTICE '';
  
  -- ============================================
  -- OBTENER IDs DE USUARIOS DESDE AUTH.USERS
  -- ============================================
  SELECT id INTO vendedor_particular1_id 
  FROM auth.users 
  WHERE email = 'vendedor.particular1@gmail.com';
  
  SELECT id INTO vendedor_particular2_id 
  FROM auth.users 
  WHERE email = 'vendedor.particular2@gmail.com';
  
  -- ============================================
  -- VENDEDOR PARTICULAR 1
  -- ============================================
  IF vendedor_particular1_id IS NOT NULL THEN
    INSERT INTO users (id, tenant_id, email, role, user_type, branch_id, created_at, updated_at)
    VALUES (
      vendedor_particular1_id,
      marketplace_id,  -- ✅ Usa tenant "marketplace"
      'vendedor.particular1@gmail.com',
      'sales_person',  -- ✅ Rol de vendedor
      'seller',        -- ✅ Tipo: vendedor PARTICULAR
      NULL,            -- ❌ NO tiene sucursal
      NOW(),
      NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
      tenant_id = EXCLUDED.tenant_id,
      role = EXCLUDED.role,
      user_type = EXCLUDED.user_type,
      branch_id = EXCLUDED.branch_id,
      updated_at = NOW();
    
    RAISE NOTICE '✅ Vendedor Particular 1 - vendedor.particular1@gmail.com';
  ELSE
    RAISE NOTICE '❌ vendedor.particular1@gmail.com NO encontrado en auth.users';
    RAISE NOTICE '   → Crear usuario en: Authentication > Users > Add User';
    RAISE NOTICE '   → Email: vendedor.particular1@gmail.com';
    RAISE NOTICE '   → Password: [elegir contraseña]';
  END IF;
  
  -- ============================================
  -- VENDEDOR PARTICULAR 2
  -- ============================================
  IF vendedor_particular2_id IS NOT NULL THEN
    INSERT INTO users (id, tenant_id, email, role, user_type, branch_id, created_at, updated_at)
    VALUES (
      vendedor_particular2_id,
      marketplace_id,  -- ✅ Usa tenant "marketplace"
      'vendedor.particular2@gmail.com',
      'sales_person',  -- ✅ Rol de vendedor
      'seller',        -- ✅ Tipo: vendedor PARTICULAR
      NULL,            -- ❌ NO tiene sucursal
      NOW(),
      NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
      tenant_id = EXCLUDED.tenant_id,
      role = EXCLUDED.role,
      user_type = EXCLUDED.user_type,
      branch_id = EXCLUDED.branch_id,
      updated_at = NOW();
    
    RAISE NOTICE '✅ Vendedor Particular 2 - vendedor.particular2@gmail.com';
  ELSE
    RAISE NOTICE '❌ vendedor.particular2@gmail.com NO encontrado en auth.users';
    RAISE NOTICE '   → Crear usuario en: Authentication > Users > Add User';
    RAISE NOTICE '   → Email: vendedor.particular2@gmail.com';
    RAISE NOTICE '   → Password: [elegir contraseña]';
  END IF;
  
  RAISE NOTICE '';
  RAISE NOTICE '🎉 ¡VENDEDORES PARTICULARES CONFIGURADOS!';
  RAISE NOTICE '';
  RAISE NOTICE '📊 RESUMEN:';
  RAISE NOTICE '   - Vendedores particulares: 2';
  RAISE NOTICE '   - Tenant: Marketplace Público';
  RAISE NOTICE '   - Sin sucursal';
  RAISE NOTICE '   - Pueden publicar sus propios vehículos';
  
END $$;

-- ============================================
-- VERIFICACIÓN: Ver vendedores particulares
-- ============================================
SELECT 
  au.email,
  u.role,
  u.user_type,
  t.name as tenant,
  u.branch_id as tiene_sucursal,
  CASE 
    WHEN u.user_type = 'seller' THEN '✅ Vendedor Particular'
    ELSE '🏢 Vendedor Automotora'
  END as tipo_vendedor
FROM auth.users au
LEFT JOIN users u ON au.id = u.id
LEFT JOIN tenants t ON u.tenant_id = t.id
WHERE au.email IN (
  'vendedor.particular1@gmail.com',
  'vendedor.particular2@gmail.com'
)
ORDER BY au.email;

-- ============================================
-- COMPARACIÓN: Vendedores de Automotora vs Particulares
-- ============================================
SELECT 
  au.email,
  u.role,
  u.user_type,
  t.name as tenant,
  b.name as sucursal,
  CASE 
    WHEN u.user_type = 'dealer' THEN '🏢 Automotora'
    WHEN u.user_type = 'seller' THEN '🚗 Particular'
    ELSE '👤 Otro'
  END as categoria
FROM auth.users au
LEFT JOIN users u ON au.id = u.id
LEFT JOIN tenants t ON u.tenant_id = t.id
LEFT JOIN branches b ON u.branch_id = b.id
WHERE u.role = 'sales_person'
ORDER BY u.user_type, au.email;
