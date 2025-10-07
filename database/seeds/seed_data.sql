-- ============================================
-- SEED DATA - AutoMarket Multitenant
-- Script para crear datos de prueba completos
-- Ejecutar en Supabase SQL Editor
-- ============================================

-- ============================================
-- PASO 1: LIMPIAR DATOS EXISTENTES (OPCIONAL)
-- ============================================
-- ⚠️ CUIDADO: Esto elimina TODOS los datos
-- Descomentar solo si quieres empezar de cero

-- DELETE FROM messages;
-- DELETE FROM favorites;
-- DELETE FROM leads;
-- DELETE FROM vehicle_images;
-- DELETE FROM vehicles;
-- DELETE FROM dealer_profiles;
-- DELETE FROM user_profiles;
-- DELETE FROM users WHERE email NOT LIKE '%salgado%';  -- Mantener tu usuario
-- DELETE FROM branches;
-- DELETE FROM tenants WHERE slug != 'chile';  -- Mantener Chile

-- ============================================
-- PASO 2: CREAR TENANTS (Automotoras/Concesionarios)
-- ============================================
-- Cada tenant representa una automotora/concesionario independiente en Chile

-- Tenant 1: Automotora Toyota Centro (Grupo grande)
INSERT INTO tenants (name, slug, country_code, currency, timezone, status)
VALUES ('Automotora Toyota Centro', 'toyota-centro', 'CL', 'CLP', 'America/Santiago', 'active')
ON CONFLICT (slug) DO NOTHING;

-- Tenant 2: Automotora Premium Motors (Multimarca)
INSERT INTO tenants (name, slug, country_code, currency, timezone, status)
VALUES ('Automotora Premium Motors', 'premium-motors', 'CL', 'CLP', 'America/Santiago', 'active')
ON CONFLICT (slug) DO NOTHING;

-- Tenant 3: Automotora Del Sur (Regional)
INSERT INTO tenants (name, slug, country_code, currency, timezone, status)
VALUES ('Automotora Del Sur', 'del-sur', 'CL', 'CLP', 'America/Santiago', 'active')
ON CONFLICT (slug) DO NOTHING;

-- Tenant 4: Automotora Express (Económicos)
INSERT INTO tenants (name, slug, country_code, currency, timezone, status)
VALUES ('Automotora Express', 'express', 'CL', 'CLP', 'America/Santiago', 'active')
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- PASO 3: CREAR SUCURSALES POR TENANT
-- ============================================

-- AUTOMOTORA TOYOTA CENTRO - 5 Sucursales (Grupo grande en Santiago y regiones)
DO $$
DECLARE
    tenant_id UUID;
BEGIN
    SELECT id INTO tenant_id FROM tenants WHERE slug = 'toyota-centro' LIMIT 1;
    
    INSERT INTO branches (tenant_id, name, slug, address, city, region, phone, email, status) VALUES
    (tenant_id, 'Toyota Centro Las Condes', 'tc-las-condes', 'Av. Kennedy 5600', 'Santiago', 'Metropolitana', '+56912345001', 'lascondes@toyotacentro.cl', 'active'),
    (tenant_id, 'Toyota Centro Maipú', 'tc-maipu', 'Av. Pajaritos 3000', 'Santiago', 'Metropolitana', '+56912345002', 'maipu@toyotacentro.cl', 'active'),
    (tenant_id, 'Toyota Centro La Florida', 'tc-la-florida', 'Av. Vicuña Mackenna 7110', 'Santiago', 'Metropolitana', '+56912345003', 'laflorida@toyotacentro.cl', 'active'),
    (tenant_id, 'Toyota Centro Concepción', 'tc-concepcion', 'Av. Jorge Alessandri 3177', 'Concepción', 'Biobío', '+56912345004', 'concepcion@toyotacentro.cl', 'active'),
    (tenant_id, 'Toyota Centro Viña del Mar', 'tc-vina', 'Av. Libertad 1348', 'Viña del Mar', 'Valparaíso', '+56912345005', 'vina@toyotacentro.cl', 'active');
END $$;

-- AUTOMOTORA PREMIUM MOTORS - 3 Sucursales (Multimarca, enfoque premium)
DO $$
DECLARE
    tenant_id UUID;
BEGIN
    SELECT id INTO tenant_id FROM tenants WHERE slug = 'premium-motors' LIMIT 1;
    
    INSERT INTO branches (tenant_id, name, slug, address, city, region, phone, email, status) VALUES
    (tenant_id, 'Premium Motors Vitacura', 'pm-vitacura', 'Av. Vitacura 4380', 'Santiago', 'Metropolitana', '+56923456001', 'vitacura@premiummotors.cl', 'active'),
    (tenant_id, 'Premium Motors Providencia', 'pm-providencia', 'Av. Providencia 2133', 'Santiago', 'Metropolitana', '+56923456002', 'providencia@premiummotors.cl', 'active'),
    (tenant_id, 'Premium Motors Valparaíso', 'pm-valparaiso', 'Av. España 1050', 'Valparaíso', 'Valparaíso', '+56923456003', 'valparaiso@premiummotors.cl', 'active');
END $$;

-- AUTOMOTORA DEL SUR - 4 Sucursales (Cobertura regional sur)
DO $$
DECLARE
    tenant_id UUID;
BEGIN
    SELECT id INTO tenant_id FROM tenants WHERE slug = 'del-sur' LIMIT 1;
    
    INSERT INTO branches (tenant_id, name, slug, address, city, region, phone, email, status) VALUES
    (tenant_id, 'Del Sur Temuco', 'ds-temuco', 'Av. Alemania 0645', 'Temuco', 'Araucanía', '+56934567001', 'temuco@delsur.cl', 'active'),
    (tenant_id, 'Del Sur Valdivia', 'ds-valdivia', 'Av. Pedro de Valdivia 850', 'Valdivia', 'Los Ríos', '+56934567002', 'valdivia@delsur.cl', 'active'),
    (tenant_id, 'Del Sur Osorno', 'ds-osorno', 'Av. René Soriano 1750', 'Osorno', 'Los Lagos', '+56934567003', 'osorno@delsur.cl', 'active'),
    (tenant_id, 'Del Sur Puerto Montt', 'ds-puerto-montt', 'Av. Diego Portales 750', 'Puerto Montt', 'Los Lagos', '+56934567004', 'puertomontt@delsur.cl', 'active');
END $$;

-- AUTOMOTORA EXPRESS - 2 Sucursales (Autos económicos, sector popular)
DO $$
DECLARE
    tenant_id UUID;
BEGIN
    SELECT id INTO tenant_id FROM tenants WHERE slug = 'express' LIMIT 1;
    
    INSERT INTO branches (tenant_id, name, slug, address, city, region, phone, email, status) VALUES
    (tenant_id, 'Express Puente Alto', 'exp-puente-alto', 'Av. Concha y Toro 2255', 'Puente Alto', 'Metropolitana', '+56945678001', 'puentealto@express.cl', 'active'),
    (tenant_id, 'Express San Bernardo', 'exp-san-bernardo', 'Av. Portales 2590', 'San Bernardo', 'Metropolitana', '+56945678002', 'sanbernardo@express.cl', 'active');
END $$;

-- ============================================
-- PASO 4: CREAR USUARIOS DE PRUEBA
-- ============================================

-- NOTA: Primero debes crear estos usuarios en Auth de Supabase
-- Authentication → Add User → Email + Password

-- Luego, ejecuta este script para asignarles roles y tenant

-- TOYOTA CENTRO - Usuarios
DO $$
DECLARE
    tenant_id UUID;
    branch_lascondes_id UUID;
    branch_maipu_id UUID;
BEGIN
    SELECT id INTO tenant_id FROM tenants WHERE slug = 'toyota-centro' LIMIT 1;
    SELECT id INTO branch_lascondes_id FROM branches WHERE slug = 'tc-las-condes' LIMIT 1;
    SELECT id INTO branch_maipu_id FROM branches WHERE slug = 'tc-maipu' LIMIT 1;
    
    -- Admin Corporativo Toyota Centro
    -- Crear primero en Auth: admin.toyota@toyotacentro.cl / Admin123!
    /*
    INSERT INTO users (id, tenant_id, email, user_type, role, full_name, status, branch_id)
    SELECT id, tenant_id, 'admin.toyota@toyotacentro.cl', 'dealer', 'corporate_admin', 'Carlos Rodríguez', 'active', NULL
    FROM auth.users WHERE email = 'admin.toyota@toyotacentro.cl'
    ON CONFLICT (id) DO UPDATE SET role = 'corporate_admin', full_name = 'Carlos Rodríguez', tenant_id = tenant_id;
    */
    
    -- Gerente Las Condes
    -- Crear en Auth: gerente.lascondes@toyotacentro.cl / Gerente123!
    /*
    INSERT INTO users (id, tenant_id, email, user_type, role, full_name, status, branch_id)
    SELECT id, tenant_id, 'gerente.lascondes@toyotacentro.cl', 'dealer', 'branch_manager', 'María González', 'active', branch_lascondes_id
    FROM auth.users WHERE email = 'gerente.lascondes@toyotacentro.cl'
    ON CONFLICT (id) DO UPDATE SET role = 'branch_manager', branch_id = branch_lascondes_id, tenant_id = tenant_id;
    */
    
    -- Vendedor Las Condes
    -- Crear en Auth: vendedor1.lascondes@toyotacentro.cl / Vendedor123!
    /*
    INSERT INTO users (id, tenant_id, email, user_type, role, full_name, status, branch_id)
    SELECT id, tenant_id, 'vendedor1.lascondes@toyotacentro.cl', 'dealer', 'sales_person', 'Juan Pérez', 'active', branch_lascondes_id
    FROM auth.users WHERE email = 'vendedor1.lascondes@toyotacentro.cl'
    ON CONFLICT (id) DO UPDATE SET role = 'sales_person', branch_id = branch_lascondes_id, tenant_id = tenant_id;
    */
    
    -- Vendedor Maipú
    -- Crear en Auth: vendedor1.maipu@toyotacentro.cl / Vendedor123!
    /*
    INSERT INTO users (id, tenant_id, email, user_type, role, full_name, status, branch_id)
    SELECT id, tenant_id, 'vendedor1.maipu@toyotacentro.cl', 'dealer', 'sales_person', 'Ana Silva', 'active', branch_maipu_id
    FROM auth.users WHERE email = 'vendedor1.maipu@toyotacentro.cl'
    ON CONFLICT (id) DO UPDATE SET role = 'sales_person', branch_id = branch_maipu_id, tenant_id = tenant_id;
    */
END $$;

-- PREMIUM MOTORS - Usuarios
DO $$
DECLARE
    tenant_id UUID;
    branch_id UUID;
BEGIN
    SELECT id INTO tenant_id FROM tenants WHERE slug = 'premium-motors' LIMIT 1;
    SELECT id INTO branch_id FROM branches WHERE slug = 'pm-vitacura' LIMIT 1;
    
    -- Admin Premium Motors
    -- Crear en Auth: admin.premium@premiummotors.cl / Admin123!
    /*
    INSERT INTO users (id, tenant_id, email, user_type, role, full_name, status, branch_id)
    SELECT id, tenant_id, 'admin.premium@premiummotors.cl', 'dealer', 'corporate_admin', 'Roberto Martínez', 'active', NULL
    FROM auth.users WHERE email = 'admin.premium@premiummotors.cl'
    ON CONFLICT (id) DO UPDATE SET role = 'corporate_admin', tenant_id = tenant_id;
    */
    
    -- Vendedor Vitacura
    -- Crear en Auth: vendedor.vitacura@premiummotors.cl / Vendedor123!
    /*
    INSERT INTO users (id, tenant_id, email, user_type, role, full_name, status, branch_id)
    SELECT id, tenant_id, 'vendedor.vitacura@premiummotors.cl', 'dealer', 'sales_person', 'Patricia López', 'active', branch_id
    FROM auth.users WHERE email = 'vendedor.vitacura@premiummotors.cl'
    ON CONFLICT (id) DO UPDATE SET role = 'sales_person', branch_id = branch_id, tenant_id = tenant_id;
    */
END $$;

-- COMPRADORES (pueden comprar en cualquier automotora)
DO $$
DECLARE
    chile_tenant_id UUID;
BEGIN
    -- Los compradores no tienen tenant específico o se asocian al tenant de Chile general
    SELECT id INTO chile_tenant_id FROM tenants LIMIT 1;
    
    -- Comprador 1
    -- Crear en Auth: comprador1@email.com / Comprador123!
    /*
    INSERT INTO users (id, tenant_id, email, user_type, role, full_name, status, branch_id)
    SELECT id, chile_tenant_id, 'comprador1@email.com', 'buyer', 'buyer', 'Pedro Sánchez', 'active', NULL
    FROM auth.users WHERE email = 'comprador1@email.com'
    ON CONFLICT (id) DO UPDATE SET role = 'buyer', tenant_id = chile_tenant_id;
    */
    
    -- Comprador 2
    -- Crear en Auth: comprador2@email.com / Comprador123!
    /*
    INSERT INTO users (id, tenant_id, email, user_type, role, full_name, status, branch_id)
    SELECT id, chile_tenant_id, 'comprador2@email.com', 'buyer', 'buyer', 'Laura Torres', 'active', NULL
    FROM auth.users WHERE email = 'comprador2@email.com'
    ON CONFLICT (id) DO UPDATE SET role = 'buyer', tenant_id = chile_tenant_id;
    */
END $$;

-- ============================================
-- PASO 5: CREAR VEHÍCULOS DE EJEMPLO
-- ============================================

-- Vehículos para TOYOTA CENTRO
DO $$
DECLARE
    v_tenant_id UUID;
    v_branch_id UUID;
    v_seller_id UUID;
    v_vehicle_id UUID;
BEGIN
    SELECT id INTO v_tenant_id FROM tenants WHERE slug = 'toyota-centro' LIMIT 1;
    SELECT id INTO v_branch_id FROM branches WHERE slug = 'tc-las-condes' LIMIT 1;
    
    -- Buscar vendedor del tenant, si no existe usar el usuario actual como temporal
    SELECT u.id INTO v_seller_id FROM users u WHERE u.email LIKE '%vendedor%toyotacentro%' AND u.tenant_id = v_tenant_id LIMIT 1;
    IF v_seller_id IS NULL THEN
        SELECT u.id INTO v_seller_id FROM users u WHERE u.tenant_id = v_tenant_id LIMIT 1;
    END IF;
    IF v_seller_id IS NULL THEN
        -- Usar usuario actual como seller temporal (cambiar tenant_id después)
        SELECT id INTO v_seller_id FROM auth.users WHERE email = 'salgadoesteban95@gmail.com' LIMIT 1;
    END IF;
    
    -- Vehículo 1: Toyota Corolla
    INSERT INTO vehicles (tenant_id, seller_id, branch_id, make, model, year, price, currency, mileage, body_type, fuel_type, transmission, color, description, status)
    VALUES (
        v_tenant_id, v_seller_id, v_branch_id,
        'Toyota', 'Corolla GLi 1.8', 2022, 18500000, 'CLP', 15000, 'sedan', 'gasoline', 'automatic', 'Blanco',
        'Toyota Corolla 2022 en excelente estado. Un solo dueño, mantenciones al día en casa matriz Toyota, full equipo.',
        'available'
    ) RETURNING id INTO v_vehicle_id;
    
    INSERT INTO vehicle_images (vehicle_id, image_url, is_primary, sort_order) VALUES
    (v_vehicle_id, 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800', true, 1),
    (v_vehicle_id, 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800', false, 2);
    
    -- Más vehículos Toyota
    INSERT INTO vehicles (tenant_id, seller_id, branch_id, make, model, year, price, currency, mileage, body_type, fuel_type, transmission, color, description, status)
    VALUES 
    (v_tenant_id, v_seller_id, v_branch_id, 'Toyota', 'RAV4 Hybrid', 2023, 32900000, 'CLP', 8000, 'suv', 'hybrid', 'automatic', 'Gris', 'Toyota RAV4 Híbrida 2023, certificada, garantía extendida, ahorra combustible', 'available'),
    (v_tenant_id, v_seller_id, v_branch_id, 'Toyota', 'Yaris Cross XLS', 2023, 19900000, 'CLP', 5000, 'suv', 'gasoline', 'automatic', 'Rojo', 'Toyota Yaris Cross 2023, SUV compacto, ideal para ciudad', 'available'),
    (v_tenant_id, v_seller_id, v_branch_id, 'Toyota', 'Hilux SR5', 2022, 38500000, 'CLP', 25000, 'pickup', 'diesel', 'automatic', 'Blanco', 'Toyota Hilux SR5 2022, 4x4, tracción integral, perfecta para trabajo y aventura', 'available'),
    (v_tenant_id, v_seller_id, v_branch_id, 'Toyota', 'Camry Hybrid', 2023, 42900000, 'CLP', 3000, 'sedan', 'hybrid', 'automatic', 'Negro', 'Toyota Camry Híbrida 2023, sedán premium, tecnología de punta', 'available');
    
END $$;

-- Vehículos para PREMIUM MOTORS (Multimarca)
DO $$
DECLARE
    v_tenant_id UUID;
    v_branch_id UUID;
    v_seller_id UUID;
BEGIN
    SELECT id INTO v_tenant_id FROM tenants WHERE slug = 'premium-motors' LIMIT 1;
    SELECT id INTO v_branch_id FROM branches WHERE slug = 'pm-vitacura' LIMIT 1;
    
    -- Buscar vendedor del tenant, si no existe usar el usuario actual
    SELECT u.id INTO v_seller_id FROM users u WHERE u.tenant_id = v_tenant_id LIMIT 1;
    IF v_seller_id IS NULL THEN
        SELECT id INTO v_seller_id FROM auth.users WHERE email = 'salgadoesteban95@gmail.com' LIMIT 1;
    END IF;
    
    INSERT INTO vehicles (tenant_id, seller_id, branch_id, make, model, year, price, currency, mileage, body_type, fuel_type, transmission, color, description, status)
    VALUES 
    (v_tenant_id, v_seller_id, v_branch_id, 'BMW', 'X3 xDrive30i', 2023, 52900000, 'CLP', 8000, 'suv', 'gasoline', 'automatic', 'Azul', 'BMW X3 2023, SUV premium alemán, tecnología y confort', 'available'),
    (v_tenant_id, v_seller_id, v_branch_id, 'Mercedes-Benz', 'GLA 200', 2023, 48500000, 'CLP', 5000, 'suv', 'gasoline', 'automatic', 'Negro', 'Mercedes-Benz GLA 2023, lujo y elegancia alemana', 'available'),
    (v_tenant_id, v_seller_id, v_branch_id, 'Audi', 'A4 40 TFSI', 2022, 46900000, 'CLP', 12000, 'sedan', 'gasoline', 'automatic', 'Gris', 'Audi A4 2022, sedán deportivo alemán, quattro', 'available'),
    (v_tenant_id, v_seller_id, v_branch_id, 'Volvo', 'XC60 T6', 2023, 58900000, 'CLP', 6000, 'suv', 'hybrid', 'automatic', 'Blanco', 'Volvo XC60 T6 Híbrido 2023, seguridad sueca, tecnología híbrida', 'available'),
    (v_tenant_id, v_seller_id, v_branch_id, 'Mazda', 'CX-5 Signature', 2023, 32500000, 'CLP', 10000, 'suv', 'gasoline', 'automatic', 'Rojo', 'Mazda CX-5 Signature 2023, SUV premium japonés', 'available');
    
END $$;

-- Vehículos para DEL SUR
DO $$
DECLARE
    v_tenant_id UUID;
    v_branch_id UUID;
    v_seller_id UUID;
BEGIN
    SELECT id INTO v_tenant_id FROM tenants WHERE slug = 'del-sur' LIMIT 1;
    SELECT id INTO v_branch_id FROM branches WHERE slug = 'ds-temuco' LIMIT 1;
    
    -- Buscar vendedor del tenant, si no existe usar el usuario actual
    SELECT u.id INTO v_seller_id FROM users u WHERE u.tenant_id = v_tenant_id LIMIT 1;
    IF v_seller_id IS NULL THEN
        SELECT id INTO v_seller_id FROM auth.users WHERE email = 'salgadoesteban95@gmail.com' LIMIT 1;
    END IF;
    
    INSERT INTO vehicles (tenant_id, seller_id, branch_id, make, model, year, price, currency, mileage, body_type, fuel_type, transmission, color, description, status)
    VALUES 
    (v_tenant_id, v_seller_id, v_branch_id, 'Chevrolet', 'Tracker Premier', 2022, 21900000, 'CLP', 18000, 'suv', 'gasoline', 'automatic', 'Gris', 'Chevrolet Tracker 2022, SUV familiar, ideal para la región', 'available'),
    (v_tenant_id, v_seller_id, v_branch_id, 'Nissan', 'Qashqai Tekna', 2023, 26900000, 'CLP', 12000, 'suv', 'gasoline', 'automatic', 'Azul', 'Nissan Qashqai 2023, tecnología japonesa', 'available'),
    (v_tenant_id, v_seller_id, v_branch_id, 'Mitsubishi', 'L200 Katana', 2022, 31500000, 'CLP', 22000, 'pickup', 'diesel', 'manual', 'Blanco', 'Mitsubishi L200 2022, 4x4, perfecta para caminos del sur', 'available'),
    (v_tenant_id, v_seller_id, v_branch_id, 'Hyundai', 'Tucson Limited', 2023, 29900000, 'CLP', 8000, 'suv', 'gasoline', 'automatic', 'Negro', 'Hyundai Tucson 2023, garantía de fábrica vigente', 'available');
    
END $$;

-- Vehículos para EXPRESS (Económicos)
DO $$
DECLARE
    v_tenant_id UUID;
    v_branch_id UUID;
    v_seller_id UUID;
BEGIN
    SELECT id INTO v_tenant_id FROM tenants WHERE slug = 'express' LIMIT 1;
    SELECT id INTO v_branch_id FROM branches WHERE slug = 'exp-puente-alto' LIMIT 1;
    
    -- Buscar vendedor del tenant, si no existe usar el usuario actual
    SELECT u.id INTO v_seller_id FROM users u WHERE u.tenant_id = v_tenant_id LIMIT 1;
    IF v_seller_id IS NULL THEN
        SELECT id INTO v_seller_id FROM auth.users WHERE email = 'salgadoesteban95@gmail.com' LIMIT 1;
    END IF;
    
    INSERT INTO vehicles (tenant_id, seller_id, branch_id, make, model, year, price, currency, mileage, body_type, fuel_type, transmission, color, description, status)
    VALUES 
    (v_tenant_id, v_seller_id, v_branch_id, 'Suzuki', 'Swift GL', 2020, 9500000, 'CLP', 45000, 'hatchback', 'gasoline', 'manual', 'Rojo', 'Suzuki Swift 2020, económico, perfecto primer auto', 'available'),
    (v_tenant_id, v_seller_id, v_branch_id, 'Chevrolet', 'Onix LT', 2021, 10900000, 'CLP', 35000, 'hatchback', 'gasoline', 'manual', 'Blanco', 'Chevrolet Onix 2021, bajo consumo, mantenimiento económico', 'available'),
    (v_tenant_id, v_seller_id, v_branch_id, 'Nissan', 'March Sense', 2020, 8900000, 'CLP', 50000, 'hatchback', 'gasoline', 'manual', 'Azul', 'Nissan March 2020, ideal para ciudad, muy económico', 'available'),
    (v_tenant_id, v_seller_id, v_branch_id, 'Hyundai', 'Accent RB', 2019, 9900000, 'CLP', 55000, 'sedan', 'gasoline', 'manual', 'Gris', 'Hyundai Accent 2019, sedán confiable, buen estado', 'available'),
    (v_tenant_id, v_seller_id, v_branch_id, 'Kia', 'Picanto EX', 2021, 8500000, 'CLP', 40000, 'hatchback', 'gasoline', 'manual', 'Amarillo', 'Kia Picanto 2021, compacto y ágil para ciudad', 'available');
    
END $$;

-- ============================================
-- PASO 6: CREAR LEADS DE EJEMPLO
-- ============================================

DO $$
DECLARE
    v_toyota_tenant_id UUID;
    v_premium_tenant_id UUID;
    v_branch_id UUID;
    v_vehicle_id UUID;
    v_seller_id UUID;
BEGIN
    -- Leads para Toyota Centro
    SELECT id INTO v_toyota_tenant_id FROM tenants WHERE slug = 'toyota-centro' LIMIT 1;
    SELECT id INTO v_branch_id FROM branches WHERE slug = 'tc-las-condes' LIMIT 1;
    SELECT u.id INTO v_seller_id FROM users u WHERE u.tenant_id = v_toyota_tenant_id LIMIT 1;
    SELECT v.id INTO v_vehicle_id FROM vehicles v WHERE v.tenant_id = v_toyota_tenant_id LIMIT 1;
    
    IF v_vehicle_id IS NOT NULL THEN
        INSERT INTO leads (tenant_id, branch_id, vehicle_id, assigned_to, customer_name, customer_email, customer_phone, message, status, priority)
        VALUES 
        (v_toyota_tenant_id, v_branch_id, v_vehicle_id, v_seller_id, 'Juan Pérez', 'juan.perez@email.com', '+56912345678', 'Me interesa el Toyota Corolla, ¿está disponible para prueba de manejo?', 'new', 'high'),
        (v_toyota_tenant_id, v_branch_id, v_vehicle_id, v_seller_id, 'María González', 'maria.gonzalez@email.com', '+56987654321', '¿Tienen financiamiento disponible? Me interesa la RAV4', 'contacted', 'medium'),
        (v_toyota_tenant_id, v_branch_id, v_vehicle_id, v_seller_id, 'Carlos López', 'carlos.lopez@email.com', '+56965432109', 'Consulta por part payment del Yaris Cross', 'qualified', 'high');
    END IF;
    
    -- Leads para Premium Motors
    SELECT id INTO v_premium_tenant_id FROM tenants WHERE slug = 'premium-motors' LIMIT 1;
    SELECT id INTO v_branch_id FROM branches WHERE slug = 'pm-vitacura' LIMIT 1;
    SELECT u.id INTO v_seller_id FROM users u WHERE u.tenant_id = v_premium_tenant_id LIMIT 1;
    SELECT v.id INTO v_vehicle_id FROM vehicles v WHERE v.tenant_id = v_premium_tenant_id LIMIT 1;
    
    IF v_vehicle_id IS NOT NULL THEN
        INSERT INTO leads (tenant_id, branch_id, vehicle_id, assigned_to, customer_name, customer_email, customer_phone, message, status, priority)
        VALUES 
        (v_premium_tenant_id, v_branch_id, v_vehicle_id, v_seller_id, 'Roberto Sánchez', 'roberto.sanchez@email.com', '+56911223344', 'Interesado en BMW X3, ¿incluye garantía extendida?', 'new', 'high'),
        (v_premium_tenant_id, v_branch_id, v_vehicle_id, v_seller_id, 'Patricia Rojas', 'patricia.rojas@email.com', '+56922334455', 'Me gustaría agendar test drive del Mercedes GLA', 'contacted', 'high');
    END IF;
END $$;

-- ============================================
-- VERIFICACIÓN FINAL
-- ============================================

-- Ver resumen de datos creados
SELECT 
    (SELECT COUNT(*) FROM tenants) as total_tenants,
    (SELECT COUNT(*) FROM branches) as total_branches,
    (SELECT COUNT(*) FROM users) as total_users,
    (SELECT COUNT(*) FROM vehicles) as total_vehicles,
    (SELECT COUNT(*) FROM leads) as total_leads;

-- Ver vehículos por tenant
SELECT t.name as tenant, COUNT(v.id) as vehicle_count
FROM tenants t
LEFT JOIN vehicles v ON v.tenant_id = t.id
GROUP BY t.name;

-- Ver sucursales por tenant
SELECT t.name as tenant, COUNT(b.id) as branch_count
FROM tenants t
LEFT JOIN branches b ON b.tenant_id = t.id
GROUP BY t.name;

-- ============================================
-- PRÓXIMOS PASOS
-- ============================================

/*
GUÍA DE IMPLEMENTACIÓN:

1. CREAR USUARIOS EN SUPABASE AUTH
   Ve a: Authentication → Add User → Email + Password
   
   TOYOTA CENTRO:
   ✉️ admin.toyota@toyotacentro.cl / 🔐 Admin123!
   ✉️ gerente.lascondes@toyotacentro.cl / 🔐 Gerente123!
   ✉️ vendedor1.lascondes@toyotacentro.cl / 🔐 Vendedor123!
   ✉️ vendedor1.maipu@toyotacentro.cl / 🔐 Vendedor123!
   
   PREMIUM MOTORS:
   ✉️ admin.premium@premiummotors.cl / 🔐 Admin123!
   ✉️ vendedor.vitacura@premiummotors.cl / 🔐 Vendedor123!
   
   COMPRADORES:
   ✉️ comprador1@email.com / 🔐 Comprador123!
   ✉️ comprador2@email.com / 🔐 Comprador123!

2. ASIGNAR ROLES (Después de crear cada usuario)
   Descomenta y ejecuta las secciones correspondientes en PASO 4

3. VERIFICAR MULTITENANCY
   - Login con usuario de Toyota Centro
   - Verificar que SOLO ve vehículos de Toyota Centro
   - Login con usuario de Premium Motors
   - Verificar que SOLO ve vehículos de Premium Motors
   - Los datos están completamente aislados por automotora

4. ESCENARIO DE PRUEBA:
   
   AUTOMOTORA TOYOTA CENTRO:
   - Admin puede ver todos los dashboards corporativos
   - Gerente Las Condes ve solo su sucursal
   - Vendedor Las Condes ve sus leads asignados
   - Vehículos: Solo Toyotas en inventario
   
   AUTOMOTORA PREMIUM MOTORS:
   - Admin ve sus 3 sucursales
   - Vendedores ven vehículos multimarca premium
   - Vehículos: BMW, Mercedes, Audi, Volvo, Mazda
   
   COMPRADORES:
   - Pueden ver vehículos de TODAS las automotoras
   - No tienen acceso a dashboards
   - Pueden crear leads en cualquier automotora

5. TESTING DE AISLAMIENTO:
   
   Query como Admin Toyota Centro:
   SELECT COUNT(*) FROM vehicles;
   -- Debe retornar solo vehículos Toyota
   
   Query como Admin Premium Motors:
   SELECT COUNT(*) FROM vehicles;
   -- Debe retornar solo vehículos Premium
   
   ¡Los tenants están aislados correctamente!
*/
