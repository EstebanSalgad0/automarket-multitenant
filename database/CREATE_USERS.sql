-- ============================================
-- CREAR USUARIOS Y PERFILES PARA TOYOTA CENTRO
-- ============================================
-- Este script crea la estructura completa de usuarios

DO $$
DECLARE
  toyota_tenant_id uuid;
  admin_user_id uuid;
  manager_user_id uuid;
  seller1_user_id uuid;
  seller2_user_id uuid;
BEGIN
  -- Obtener el ID del tenant Toyota Centro
  SELECT id INTO toyota_tenant_id FROM tenants WHERE slug = 'toyota-centro';
  
  IF toyota_tenant_id IS NULL THEN
    RAISE EXCEPTION 'No se encontró el tenant Toyota Centro';
  END IF;

  RAISE NOTICE 'Tenant Toyota Centro ID: %', toyota_tenant_id;

  -- ============================================
  -- 1. VERIFICAR/CREAR USUARIOS EN LA TABLA users
  -- ============================================
  
  -- Verificar si existen usuarios
  SELECT id INTO admin_user_id FROM users WHERE email = 'admin.toyota@toyotacentro.cl';
  SELECT id INTO manager_user_id FROM users WHERE email = 'manager.toyota@toyotacentro.cl';
  SELECT id INTO seller1_user_id FROM users WHERE email = 'vendedor1.toyota@toyotacentro.cl';
  SELECT id INTO seller2_user_id FROM users WHERE email = 'vendedor2.toyota@toyotacentro.cl';

  -- Si no existe el admin, crear uno (esto debería existir desde auth)
  IF admin_user_id IS NULL THEN
    RAISE NOTICE '⚠️  Usuario admin no encontrado. Debe ser creado desde Supabase Auth primero.';
  ELSE
    RAISE NOTICE '✅ Admin encontrado: %', admin_user_id;
  END IF;

  -- Manager (Jefe de Sucursal)
  IF manager_user_id IS NULL THEN
    -- Crear el usuario en la tabla users (asumiendo que ya existe en auth.users)
    INSERT INTO users (id, tenant_id, email, role, created_at, updated_at)
    VALUES (
      gen_random_uuid(),
      toyota_tenant_id,
      'manager.toyota@toyotacentro.cl',
      'dealer',  -- Rol de Jefe de Sucursal/Dealer
      NOW(),
      NOW()
    )
    RETURNING id INTO manager_user_id;
    
    RAISE NOTICE '✅ Manager creado: %', manager_user_id;
  ELSE
    RAISE NOTICE '✅ Manager encontrado: %', manager_user_id;
  END IF;

  -- Vendedor 1
  IF seller1_user_id IS NULL THEN
    INSERT INTO users (id, tenant_id, email, role, created_at, updated_at)
    VALUES (
      gen_random_uuid(),
      toyota_tenant_id,
      'vendedor1.toyota@toyotacentro.cl',
      'seller',  -- Rol de Vendedor
      NOW(),
      NOW()
    )
    RETURNING id INTO seller1_user_id;
    
    RAISE NOTICE '✅ Vendedor 1 creado: %', seller1_user_id;
  ELSE
    RAISE NOTICE '✅ Vendedor 1 encontrado: %', seller1_user_id;
  END IF;

  -- Vendedor 2
  IF seller2_user_id IS NULL THEN
    INSERT INTO users (id, tenant_id, email, role, created_at, updated_at)
    VALUES (
      gen_random_uuid(),
      toyota_tenant_id,
      'vendedor2.toyota@toyotacentro.cl',
      'seller',  -- Rol de Vendedor
      NOW(),
      NOW()
    )
    RETURNING id INTO seller2_user_id;
    
    RAISE NOTICE '✅ Vendedor 2 creado: %', seller2_user_id;
  ELSE
    RAISE NOTICE '✅ Vendedor 2 encontrado: %', seller2_user_id;
  END IF;

  -- ============================================
  -- 2. CREAR PERFILES DE USUARIO (user_profiles)
  -- ============================================
  
  -- Admin Corporativo
  IF admin_user_id IS NOT NULL THEN
    INSERT INTO user_profiles (user_id, first_name, last_name, avatar_url)
    VALUES (
      admin_user_id,
      'Carlos',
      'Rodríguez',
      NULL
    ) ON CONFLICT (user_id) DO UPDATE SET
      first_name = EXCLUDED.first_name,
      last_name = EXCLUDED.last_name;
    
    RAISE NOTICE '✅ Perfil de Admin creado/actualizado';
  END IF;

  -- Manager/Jefe de Sucursal
  INSERT INTO user_profiles (user_id, first_name, last_name)
  VALUES (
    manager_user_id,
    'María',
    'González'
  ) ON CONFLICT (user_id) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name;
  
  RAISE NOTICE '✅ Perfil de Manager creado/actualizado';

  -- Vendedor 1
  INSERT INTO user_profiles (user_id, first_name, last_name)
  VALUES (
    seller1_user_id,
    'Juan',
    'Pérez'
  ) ON CONFLICT (user_id) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name;
  
  RAISE NOTICE '✅ Perfil de Vendedor 1 creado/actualizado';

  -- Vendedor 2
  INSERT INTO user_profiles (user_id, first_name, last_name)
  VALUES (
    seller2_user_id,
    'Ana',
    'Silva'
  ) ON CONFLICT (user_id) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name;
  
  RAISE NOTICE '✅ Perfil de Vendedor 2 creado/actualizado';

  -- ============================================
  -- 3. CREAR VEHÍCULOS ASIGNADOS A VENDEDORES
  -- ============================================
  
  -- Limpiar vehículos existentes de Toyota Centro
  DELETE FROM vehicles WHERE tenant_id = toyota_tenant_id;
  RAISE NOTICE '🗑️  Vehículos anteriores eliminados';
  
  -- Vehículos de Juan Pérez (Vendedor 1 - Especialista en SUVs)
  INSERT INTO vehicles (
    tenant_id, seller_id, make, model, year, price, mileage,
    transmission, fuel_type, body_type, color, status, 
    views_count, favorites_count, description
  ) VALUES 
    -- RAV4 - Juan
    (toyota_tenant_id, seller1_user_id,
     'Toyota', 'RAV4', 2024, 32990000, 5000,
     'automatic', 'hybrid', 'suv', 'Negro', 'available',
     189, 24, 'Toyota RAV4 Hybrid 2024. Tecnología de punta, bajo consumo.'),
    
    -- Hilux - Juan
    (toyota_tenant_id, seller1_user_id,
     'Toyota', 'Hilux', 2022, 28500000, 35000,
     'manual', 'diesel', 'pickup', 'Plata', 'available',
     156, 15, 'Toyota Hilux 2022. Perfecta para trabajo y aventura.'),
    
    -- Land Cruiser - Juan
    (toyota_tenant_id, seller1_user_id,
     'Toyota', 'Land Cruiser', 2022, 89990000, 25000,
     'automatic', 'diesel', 'suv', 'Blanco Perla', 'available',
     412, 45, 'Toyota Land Cruiser 2022. El rey de los todoterreno.'),
    
    -- C-HR VENDIDO - Juan
    (toyota_tenant_id, seller1_user_id,
     'Toyota', 'C-HR', 2023, 24990000, 12000,
     'automatic', 'hybrid', 'suv', 'Gris', 'sold',
     167, 12, 'Toyota C-HR 2023. Diseño moderno y tecnología híbrida.');
  
  -- Vehículos de Ana Silva (Vendedor 2 - Especialista en Sedanes)
  INSERT INTO vehicles (
    tenant_id, seller_id, make, model, year, price, mileage,
    transmission, fuel_type, body_type, color, status, 
    views_count, favorites_count, description
  ) VALUES 
    -- Corolla - Ana
    (toyota_tenant_id, seller2_user_id,
     'Toyota', 'Corolla', 2023, 18990000, 15000,
     'automatic', 'gasoline', 'sedan', 'Blanco', 'available',
     245, 18, 'Toyota Corolla 2023 en excelente estado. Un solo dueño, mantenciones al día.'),
    
    -- Yaris VENDIDO - Ana
    (toyota_tenant_id, seller2_user_id,
     'Toyota', 'Yaris', 2023, 12990000, 8000,
     'automatic', 'gasoline', 'hatchback', 'Rojo', 'sold',
     134, 9, 'Toyota Yaris 2023. Económico y confiable.'),
    
    -- Camry - Ana
    (toyota_tenant_id, seller2_user_id,
     'Toyota', 'Camry', 2024, 35990000, 2000,
     'automatic', 'hybrid', 'sedan', 'Azul', 'available',
     298, 31, 'Toyota Camry Hybrid 2024. Lujo y eficiencia combinados.'),
    
    -- Prius - Ana
    (toyota_tenant_id, seller2_user_id,
     'Toyota', 'Prius', 2024, 29990000, 1500,
     'automatic', 'hybrid', 'sedan', 'Verde', 'available',
     201, 22, 'Toyota Prius 2024. Máxima eficiencia energética.');
  
  RAISE NOTICE '✅ 8 vehículos creados (4 por vendedor)';
  RAISE NOTICE '📊 Juan Pérez (SUVs): 3 disponibles, 1 vendido';
  RAISE NOTICE '📊 Ana Silva (Sedanes): 3 disponibles, 1 vendido';
  RAISE NOTICE '';
  RAISE NOTICE '🎉 ¡Base de datos lista!';
  RAISE NOTICE '👤 Admin Corporativo: Carlos Rodríguez (NO vende)';
  RAISE NOTICE '👤 Jefe Sucursal: María González (NO vende)';
  RAISE NOTICE '👤 Vendedor 1: Juan Pérez - 4 vehículos (SUVs/Pickup)';
  RAISE NOTICE '👤 Vendedor 2: Ana Silva - 4 vehículos (Sedanes/Hatchback)';

END $$;
