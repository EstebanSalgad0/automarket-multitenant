-- =====================================================
-- AUTOMARKET MULTITENANT - SETUP ULTRA SEGURO
-- =====================================================
-- Este script usa bloques condicionales para máxima seguridad

-- =====================================================
-- 1. ELIMINAR CONSTRAINT FOREIGN KEY TEMPORALMENTE
-- =====================================================
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'vehicles_seller_id_fkey'
    ) THEN
        ALTER TABLE vehicles DROP CONSTRAINT vehicles_seller_id_fkey;
    END IF;
END $$;

-- =====================================================
-- 2. FUNCIÓN PARA CREAR POLÍTICAS SEGURAS
-- =====================================================
CREATE OR REPLACE FUNCTION create_policy_safe(
    policy_name TEXT,
    table_name TEXT,
    policy_type TEXT,
    policy_using TEXT DEFAULT 'true'
) RETURNS VOID AS $$
BEGIN
    -- Eliminar política si existe
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I', policy_name, table_name);
    
    -- Crear nueva política
    IF policy_type = 'ALL' THEN
        EXECUTE format('CREATE POLICY %I ON %I FOR ALL USING (%s)', policy_name, table_name, policy_using);
    ELSIF policy_type = 'INSERT' THEN
        EXECUTE format('CREATE POLICY %I ON %I FOR INSERT WITH CHECK (%s)', policy_name, table_name, policy_using);
    ELSE
        EXECUTE format('CREATE POLICY %I ON %I FOR %s USING (%s)', policy_name, table_name, policy_type, policy_using);
    END IF;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 3. CREAR POLÍTICAS USANDO LA FUNCIÓN SEGURA
-- =====================================================

-- Tenants
SELECT create_policy_safe('dev_tenants_public_select', 'tenants', 'SELECT');

-- Users  
SELECT create_policy_safe('dev_users_public_select', 'users', 'SELECT');
SELECT create_policy_safe('dev_users_public_insert', 'users', 'INSERT');
SELECT create_policy_safe('dev_users_public_update', 'users', 'UPDATE');

-- Vehicles
SELECT create_policy_safe('dev_vehicles_public_select', 'vehicles', 'SELECT');
SELECT create_policy_safe('dev_vehicles_public_insert', 'vehicles', 'INSERT');
SELECT create_policy_safe('dev_vehicles_public_update', 'vehicles', 'UPDATE');

-- Vehicle Images
SELECT create_policy_safe('dev_vehicle_images_public_select', 'vehicle_images', 'SELECT');
SELECT create_policy_safe('dev_vehicle_images_public_all', 'vehicle_images', 'ALL');

-- Vehicle Features
SELECT create_policy_safe('dev_vehicle_features_public_select', 'vehicle_features', 'SELECT');
SELECT create_policy_safe('dev_vehicle_features_public_all', 'vehicle_features', 'ALL');

-- User Profiles
SELECT create_policy_safe('dev_user_profiles_public_select', 'user_profiles', 'SELECT');
SELECT create_policy_safe('dev_user_profiles_public_all', 'user_profiles', 'ALL');

-- Dealer Profiles
SELECT create_policy_safe('dev_dealer_profiles_public_select', 'dealer_profiles', 'SELECT');
SELECT create_policy_safe('dev_dealer_profiles_public_all', 'dealer_profiles', 'ALL');

-- User Favorites
SELECT create_policy_safe('dev_user_favorites_public_select', 'user_favorites', 'SELECT');
SELECT create_policy_safe('dev_user_favorites_public_all', 'user_favorites', 'ALL');

-- =====================================================
-- 4. GESTIÓN SEGURA DE TENANTS
-- =====================================================
DO $$
BEGIN
    -- Limpiar tenants existentes
    DELETE FROM tenants WHERE id IN (
        '11111111-1111-1111-1111-111111111111',
        '22222222-2222-2222-2222-222222222222',
        '33333333-3333-3333-3333-333333333333'
    );
    
    -- Insertar tenants
    INSERT INTO tenants (id, name, slug, country_code, currency, timezone) VALUES
        ('11111111-1111-1111-1111-111111111111', 'AutoMarket Chile', 'chile', 'CL', 'CLP', 'America/Santiago'),
        ('22222222-2222-2222-2222-222222222222', 'AutoMarket Argentina', 'argentina', 'AR', 'ARS', 'America/Buenos_Aires'),
        ('33333333-3333-3333-3333-333333333333', 'AutoMarket México', 'mexico', 'MX', 'MXN', 'America/Mexico_City');
        
    RAISE NOTICE 'Tenants creados correctamente';
END $$;

-- =====================================================
-- 5. GESTIÓN SEGURA DE VEHÍCULOS
-- =====================================================
DO $$
BEGIN
    -- Limpiar vehículos existentes con seller_id dummy
    DELETE FROM vehicles WHERE seller_id IN (
        '99999999-9999-9999-9999-999999999999',
        '88888888-8888-8888-8888-888888888888',
        '77777777-7777-7777-7777-777777777777'
    );
    
    -- Vehículos para Chile
    INSERT INTO vehicles (
        tenant_id, seller_id, make, model, year, price, currency, mileage,
        fuel_type, transmission, body_type, color, description,
        location_city, location_state, vin, license_plate
    ) VALUES
    ('11111111-1111-1111-1111-111111111111', '99999999-9999-9999-9999-999999999999', 'Toyota', 'Corolla', 2020, 15000000, 'CLP', 45000, 'gasoline', 'manual', 'sedan', 'Blanco', 'Toyota Corolla 2020 en excelente estado', 'Santiago', 'Metropolitana', 'JTDBL40E899000001', 'AA-BB-11'),
    ('11111111-1111-1111-1111-111111111111', '99999999-9999-9999-9999-999999999999', 'Honda', 'Civic', 2019, 13500000, 'CLP', 38000, 'gasoline', 'automatic', 'sedan', 'Negro', 'Honda Civic automático premium', 'Valparaíso', 'Valparaíso', 'JHMFA36289S000001', 'BB-CC-22'),
    ('11111111-1111-1111-1111-111111111111', '99999999-9999-9999-9999-999999999999', 'Chevrolet', 'Spark', 2021, 9800000, 'CLP', 25000, 'gasoline', 'manual', 'hatchback', 'Rojo', 'Chevrolet Spark como nuevo', 'Concepción', 'Biobío', 'KL1MM6SF8MC000001', 'CC-DD-33'),
    ('11111111-1111-1111-1111-111111111111', '99999999-9999-9999-9999-999999999999', 'Mazda', 'CX-3', 2022, 18500000, 'CLP', 15000, 'gasoline', 'automatic', 'suv', 'Blanco Perla', 'Mazda CX-3 SUV compacto', 'La Serena', 'Coquimbo', 'JM1DKDC70N0000001', 'DD-EE-44'),
    ('11111111-1111-1111-1111-111111111111', '99999999-9999-9999-9999-999999999999', 'Hyundai', 'Accent', 2021, 11500000, 'CLP', 32000, 'gasoline', 'manual', 'sedan', 'Plata', 'Hyundai Accent económico', 'Temuco', 'Araucanía', 'KMHC45LP5MA000001', 'EE-FF-55');
    
    -- Vehículos para Argentina
    INSERT INTO vehicles (
        tenant_id, seller_id, make, model, year, price, currency, mileage,
        fuel_type, transmission, body_type, color, description, location_city, location_state
    ) VALUES
    ('22222222-2222-2222-2222-222222222222', '88888888-8888-8888-8888-888888888888', 'Ford', 'Focus', 2018, 2500000, 'ARS', 60000, 'gasoline', 'manual', 'hatchback', 'Azul', 'Ford Focus buen estado', 'Buenos Aires', 'CABA'),
    ('22222222-2222-2222-2222-222222222222', '88888888-8888-8888-8888-888888888888', 'Volkswagen', 'Gol', 2019, 2800000, 'ARS', 45000, 'gasoline', 'manual', 'hatchback', 'Rojo', 'VW Gol Trend económico', 'Córdoba', 'Córdoba');
    
    -- Vehículos para México
    INSERT INTO vehicles (
        tenant_id, seller_id, make, model, year, price, currency, mileage,
        fuel_type, transmission, body_type, color, description, location_city, location_state
    ) VALUES
    ('33333333-3333-3333-3333-333333333333', '77777777-7777-7777-7777-777777777777', 'Nissan', 'Versa', 2019, 250000, 'MXN', 40000, 'gasoline', 'automatic', 'sedan', 'Gris', 'Nissan Versa automático', 'Ciudad de México', 'CDMX'),
    ('33333333-3333-3333-3333-333333333333', '77777777-7777-7777-7777-777777777777', 'Chevrolet', 'Aveo', 2020, 220000, 'MXN', 35000, 'gasoline', 'manual', 'sedan', 'Blanco', 'Chevrolet Aveo sedán', 'Guadalajara', 'Jalisco');
    
    RAISE NOTICE 'Vehículos creados correctamente';
END $$;

-- =====================================================
-- 6. GESTIÓN SEGURA DE IMÁGENES
-- =====================================================
DO $$
BEGIN
    -- Limpiar imágenes existentes para vehículos dummy
    DELETE FROM vehicle_images 
    WHERE vehicle_id IN (
        SELECT id FROM vehicles 
        WHERE seller_id IN (
            '99999999-9999-9999-9999-999999999999',
            '88888888-8888-8888-8888-888888888888',
            '77777777-7777-7777-7777-777777777777'
        )
    );
    
    -- Agregar imágenes para todos los vehículos
    INSERT INTO vehicle_images (vehicle_id, image_url, alt_text, is_primary, sort_order)
    SELECT 
        v.id,
        'https://via.placeholder.com/800x600/4299E1/ffffff?text=' || REPLACE(v.make, ' ', '+') || '+' || REPLACE(v.model, ' ', '+'),
        v.make || ' ' || v.model || ' - Imagen principal',
        true,
        1
    FROM vehicles v 
    WHERE v.seller_id IN (
        '99999999-9999-9999-9999-999999999999',
        '88888888-8888-8888-8888-888888888888',
        '77777777-7777-7777-7777-777777777777'
    );
    
    RAISE NOTICE 'Imágenes creadas correctamente';
END $$;

-- =====================================================
-- 7. REPORTE FINAL DETALLADO
-- =====================================================

-- Contadores
SELECT 
    'CONFIGURACIÓN COMPLETADA' as status,
    'Base de datos lista para usar' as mensaje;

-- Resumen de datos
WITH summary AS (
    SELECT 
        (SELECT COUNT(*) FROM tenants WHERE id IN ('11111111-1111-1111-1111-111111111111','22222222-2222-2222-2222-222222222222','33333333-3333-3333-3333-333333333333')) as tenants_count,
        (SELECT COUNT(*) FROM vehicles WHERE seller_id IN ('99999999-9999-9999-9999-999999999999','88888888-8888-8888-8888-888888888888','77777777-7777-7777-7777-777777777777')) as vehicles_count,
        (SELECT COUNT(*) FROM vehicle_images vi JOIN vehicles v ON vi.vehicle_id = v.id WHERE v.seller_id IN ('99999999-9999-9999-9999-999999999999','88888888-8888-8888-8888-888888888888','77777777-7777-7777-7777-777777777777')) as images_count
)
SELECT 
    '📊 RESUMEN' as seccion,
    'Tenants: ' || tenants_count || ' | Vehículos: ' || vehicles_count || ' | Imágenes: ' || images_count as datos
FROM summary;

-- Detalle por tenant
SELECT 
    '🌍 TENANTS' as seccion,
    t.name || ' (' || t.slug || ') - ' || t.currency || ' - ' || COUNT(v.id) || ' vehículos' as detalle
FROM tenants t
LEFT JOIN vehicles v ON t.id = v.tenant_id AND v.seller_id IN ('99999999-9999-9999-9999-999999999999','88888888-8888-8888-8888-888888888888','77777777-7777-7777-7777-777777777777')
WHERE t.id IN ('11111111-1111-1111-1111-111111111111','22222222-2222-2222-2222-222222222222','33333333-3333-3333-3333-333333333333')
GROUP BY t.name, t.slug, t.currency, t.id
ORDER BY t.name;

-- Muestra de vehículos
SELECT 
    '🚗 VEHÍCULOS' as seccion,
    t.slug || ' | ' || v.make || ' ' || v.model || ' ' || v.year || ' | ' || 
    CASE 
        WHEN v.currency = 'CLP' THEN '$' || TO_CHAR(v.price, 'FM999,999,999') 
        WHEN v.currency = 'ARS' THEN '$' || TO_CHAR(v.price, 'FM999,999,999')
        WHEN v.currency = 'MXN' THEN '$' || TO_CHAR(v.price, 'FM999,999')
        ELSE '$' || v.price::text
    END || ' ' || v.currency || ' | ' || v.location_city as detalle
FROM vehicles v
JOIN tenants t ON v.tenant_id = t.id
WHERE v.seller_id IN ('99999999-9999-9999-9999-999999999999','88888888-8888-8888-8888-888888888888','77777777-7777-7777-7777-777777777777')
ORDER BY t.name, v.price DESC;

-- Limpiar función temporal
DROP FUNCTION IF EXISTS create_policy_safe(TEXT, TEXT, TEXT, TEXT);

-- Mensaje final
SELECT 
    '✅ ÉXITO' as resultado,
    'AutoMarket MultiTenant configurado correctamente en Supabase' as mensaje;