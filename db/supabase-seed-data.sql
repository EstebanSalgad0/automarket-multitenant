-- =====================================================
-- AutoMarket MultiTenant - Datos Iniciales Limpios
-- =====================================================

-- =====================================================
-- TENANTS DE EJEMPLO
-- =====================================================
INSERT INTO tenants (id, company_name, company_type, email, phone, city, country, status) VALUES
('11111111-1111-1111-1111-111111111111', 'Toyota Centro Chile', 'dealership', 'admin@toyotacentro.cl', '+56912345678', 'Santiago', 'CHL', 'active'),
('22222222-2222-2222-2222-222222222222', 'Premium Motors', 'dealership', 'admin@premiummotors.cl', '+56987654321', 'Las Condes', 'CHL', 'active'),
('33333333-3333-3333-3333-333333333333', 'AutoVendedores Independientes', 'individual_seller', 'info@autoindependientes.cl', '+56911223344', 'Valparaíso', 'CHL', 'active')
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- MARCAS DE VEHÍCULOS
-- =====================================================
INSERT INTO vehicle_brands (name, country) VALUES
('Toyota', 'JPN'),
('Honda', 'JPN'),
('Ford', 'USA'),
('Chevrolet', 'USA'),
('BMW', 'DEU'),
('Mercedes-Benz', 'DEU'),
('Audi', 'DEU'),
('Hyundai', 'KOR'),
('Kia', 'KOR'),
('Nissan', 'JPN'),
('Volkswagen', 'DEU'),
('Mazda', 'JPN')
ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- MODELOS DE VEHÍCULOS (EJEMPLOS)
-- =====================================================
INSERT INTO vehicle_models (brand_id, name, body_type, fuel_type, transmission_type) VALUES
-- Toyota
(1, 'Corolla', 'sedan', 'gasoline', 'automatic'),
(1, 'RAV4', 'suv', 'hybrid', 'automatic'),
(1, 'Camry', 'sedan', 'gasoline', 'automatic'),
(1, 'Prius', 'hatchback', 'hybrid', 'automatic'),
-- Honda
(2, 'Civic', 'sedan', 'gasoline', 'manual'),
(2, 'CR-V', 'suv', 'gasoline', 'automatic'),
(2, 'Accord', 'sedan', 'gasoline', 'automatic'),
-- Ford
(3, 'Focus', 'hatchback', 'gasoline', 'manual'),
(3, 'Escape', 'suv', 'gasoline', 'automatic'),
(3, 'F-150', 'pickup', 'gasoline', 'automatic'),
-- BMW
(5, 'Serie 3', 'sedan', 'gasoline', 'automatic'),
(5, 'X3', 'suv', 'gasoline', 'automatic'),
(5, 'X5', 'suv', 'gasoline', 'automatic')
ON CONFLICT (brand_id, name) DO NOTHING;

-- =====================================================
-- VERIFICAR DATOS INSERTADOS
-- =====================================================
SELECT 'RESUMEN DE DATOS INICIALES' as status;

SELECT 'tenants' as tabla, count(*) as registros FROM tenants
UNION ALL
SELECT 'vehicle_brands', count(*) FROM vehicle_brands
UNION ALL  
SELECT 'vehicle_models', count(*) FROM vehicle_models
ORDER BY tabla;