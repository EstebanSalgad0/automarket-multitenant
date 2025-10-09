-- ============================================
-- SCRIPT DE DATOS DE PRUEBA PARA TOYOTA CENTRO
-- ============================================
-- Ejecutar este script en el SQL Editor de Supabase

-- 1. Obtener el ID del tenant Toyota Centro
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
  
  -- Obtener IDs de usuarios existentes
  SELECT id INTO admin_user_id FROM users WHERE email = 'admin.toyota@toyotacentro.cl';
  SELECT id INTO manager_user_id FROM users WHERE email = 'manager.toyota@toyotacentro.cl';
  SELECT id INTO seller1_user_id FROM users WHERE email = 'vendedor1.toyota@toyotacentro.cl';
  SELECT id INTO seller2_user_id FROM users WHERE email = 'vendedor2.toyota@toyotacentro.cl';

  -- ============================================
  -- 2. CREAR PERFILES DE USUARIO (user_profiles)
  -- ============================================
  
  -- Admin Corporativo
  INSERT INTO user_profiles (user_id, first_name, last_name, avatar_url)
  VALUES (
    admin_user_id,
    'Carlos',
    'Rodríguez',
    NULL
  ) ON CONFLICT (user_id) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name;

  -- Manager/Jefe de Sucursal
  IF manager_user_id IS NOT NULL THEN
    INSERT INTO user_profiles (user_id, first_name, last_name)
    VALUES (
      manager_user_id,
      'María',
      'González'
    ) ON CONFLICT (user_id) DO UPDATE SET
      first_name = EXCLUDED.first_name,
      last_name = EXCLUDED.last_name;
  END IF;

  -- Vendedor 1
  IF seller1_user_id IS NOT NULL THEN
    INSERT INTO user_profiles (user_id, first_name, last_name)
    VALUES (
      seller1_user_id,
      'Juan',
      'Pérez'
    ) ON CONFLICT (user_id) DO UPDATE SET
      first_name = EXCLUDED.first_name,
      last_name = EXCLUDED.last_name;
  END IF;

  -- Vendedor 2
  IF seller2_user_id IS NOT NULL THEN
    INSERT INTO user_profiles (user_id, first_name, last_name)
    VALUES (
      seller2_user_id,
      'Ana',
      'Silva'
    ) ON CONFLICT (user_id) DO UPDATE SET
      first_name = EXCLUDED.first_name,
      last_name = EXCLUDED.last_name;
  END IF;

  -- ============================================
  -- 3. CREAR VEHÍCULOS DE PRUEBA
  -- ============================================
  
  -- Usar seller1_user_id si existe, sino admin_user_id
  DECLARE
    default_seller_id uuid := COALESCE(seller1_user_id, admin_user_id);
  BEGIN
    
    -- Toyota Corolla 2023
    INSERT INTO vehicles (
      tenant_id, seller_id, make, model, year, price, mileage,
      transmission, fuel_type, body_type, color, status, 
      views_count, favorites_count, description
    ) VALUES (
      toyota_tenant_id, default_seller_id,
      'Toyota', 'Corolla', 2023, 18990000, 15000,
      'automatic', 'gasoline', 'sedan', 'Blanco', 'available',
      245, 18,
      'Toyota Corolla 2023 en excelente estado. Un solo dueño, mantenciones al día.'
    );

    -- Toyota RAV4 2024
    INSERT INTO vehicles (
      tenant_id, seller_id, make, model, year, price, mileage,
      transmission, fuel_type, body_type, color, status,
      views_count, favorites_count, description
    ) VALUES (
      toyota_tenant_id, default_seller_id,
      'Toyota', 'RAV4', 2024, 32990000, 5000,
      'automatic', 'hybrid', 'suv', 'Negro', 'available',
      189, 24,
      'Toyota RAV4 Hybrid 2024. Tecnología de punta, bajo consumo.'
    );

    -- Toyota Hilux 2022
    INSERT INTO vehicles (
      tenant_id, seller_id, make, model, year, price, mileage,
      transmission, fuel_type, body_type, color, status,
      views_count, favorites_count, description
    ) VALUES (
      toyota_tenant_id, default_seller_id,
      'Toyota', 'Hilux', 2022, 28500000, 35000,
      'manual', 'diesel', 'pickup', 'Plata', 'available',
      156, 15,
      'Toyota Hilux 2022. Perfecta para trabajo y aventura.'
    );

    -- Toyota Yaris 2023 (VENDIDO)
    INSERT INTO vehicles (
      tenant_id, seller_id, make, model, year, price, mileage,
      transmission, fuel_type, body_type, color, status,
      views_count, favorites_count, description, updated_at
    ) VALUES (
      toyota_tenant_id, default_seller_id,
      'Toyota', 'Yaris', 2023, 12990000, 8000,
      'automatic', 'gasoline', 'hatchback', 'Rojo', 'sold',
      134, 9,
      'Toyota Yaris 2023. Económico y confiable.',
      NOW() - INTERVAL '15 days'  -- Vendido hace 15 días
    );

    -- Toyota Camry 2024
    INSERT INTO vehicles (
      tenant_id, seller_id, make, model, year, price, mileage,
      transmission, fuel_type, body_type, color, status,
      views_count, favorites_count, description
    ) VALUES (
      toyota_tenant_id, default_seller_id,
      'Toyota', 'Camry', 2024, 35990000, 2000,
      'automatic', 'hybrid', 'sedan', 'Azul', 'available',
      298, 31,
      'Toyota Camry Hybrid 2024. Lujo y eficiencia combinados.'
    );

    -- Toyota CH-R 2023 (VENDIDO)
    INSERT INTO vehicles (
      tenant_id, seller_id, make, model, year, price, mileage,
      transmission, fuel_type, body_type, color, status,
      views_count, favorites_count, description, updated_at
    ) VALUES (
      toyota_tenant_id, default_seller_id,
      'Toyota', 'C-HR', 2023, 24990000, 12000,
      'automatic', 'hybrid', 'suv', 'Gris', 'sold',
      167, 12,
      'Toyota C-HR 2023. Diseño moderno y tecnología híbrida.',
      NOW() - INTERVAL '8 days'  -- Vendido hace 8 días
    );

    -- Toyota Land Cruiser 2022
    INSERT INTO vehicles (
      tenant_id, seller_id, make, model, year, price, mileage,
      transmission, fuel_type, body_type, color, status,
      views_count, favorites_count, description
    ) VALUES (
      toyota_tenant_id, default_seller_id,
      'Toyota', 'Land Cruiser', 2022, 89990000, 25000,
      'automatic', 'diesel', 'suv', 'Blanco Perla', 'available',
      412, 45,
      'Toyota Land Cruiser 2022. El rey de los todoterreno.'
    );

    -- Toyota Prius 2024
    INSERT INTO vehicles (
      tenant_id, seller_id, make, model, year, price, mileage,
      transmission, fuel_type, body_type, color, status,
      views_count, favorites_count, description
    ) VALUES (
      toyota_tenant_id, default_seller_id,
      'Toyota', 'Prius', 2024, 29990000, 1500,
      'automatic', 'hybrid', 'sedan', 'Verde', 'available',
      201, 22,
      'Toyota Prius 2024. Máxima eficiencia energética.'
    );

  END;

  RAISE NOTICE 'Datos de prueba creados exitosamente para Toyota Centro!';
  RAISE NOTICE 'Tenant ID: %', toyota_tenant_id;
  RAISE NOTICE 'Admin User ID: %', admin_user_id;
  
END $$;
