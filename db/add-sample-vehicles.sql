-- Script para agregar más vehículos de ejemplo
INSERT INTO vehiculos (tenant_id, marca, modelo, año, precio, kilometraje, color, combustible, transmision, descripcion, estado) VALUES
-- Más vehículos para Toyota Centro
('11111111-1111-1111-1111-111111111111', 'Toyota', 'Prius', 2021, 429900.00, 25000, 'Plata', 'Híbrido', 'CVT', 'Toyota Prius 2021, excelente eficiencia de combustible, ideal para ciudad', 'disponible'),
('11111111-1111-1111-1111-111111111111', 'Toyota', 'Highlander', 2022, 679900.00, 8000, 'Negro', 'Gasolina', 'Automática', 'SUV familiar Toyota Highlander 2022, 7 asientos, perfecta para familia', 'disponible'),
('11111111-1111-1111-1111-111111111111', 'Toyota', 'Yaris', 2020, 189900.00, 45000, 'Rojo', 'Gasolina', 'Manual', 'Toyota Yaris 2020, compacto y económico, perfecto para la ciudad', 'disponible'),

-- Más vehículos para Carlos Pérez Motors
('22222222-2222-2222-2222-222222222222', 'Mazda', 'CX-5', 2021, 459900.00, 28000, 'Azul', 'Gasolina', 'Automática', 'Mazda CX-5 2021, SUV elegante con excelente manejo', 'disponible'),
('22222222-2222-2222-2222-222222222222', 'Hyundai', 'Elantra', 2022, 319900.00, 15000, 'Blanco', 'Gasolina', 'Automática', 'Hyundai Elantra 2022, sedán moderno con tecnología avanzada', 'disponible'),
('22222222-2222-2222-2222-222222222222', 'Kia', 'Sportage', 2020, 389900.00, 38000, 'Gris', 'Gasolina', 'Automática', 'Kia Sportage 2020, SUV confiable con garantía extendida', 'disponible'),
('22222222-2222-2222-2222-222222222222', 'Chevrolet', 'Cruze', 2019, 259900.00, 52000, 'Negro', 'Gasolina', 'Automática', 'Chevrolet Cruze 2019, sedán espacioso y cómodo', 'disponible'),

-- Más vehículos para el vendedor particular María González
('33333333-3333-3333-3333-333333333333', 'Suzuki', 'Swift', 2018, 149900.00, 62000, 'Amarillo', 'Gasolina', 'Manual', 'Suzuki Swift 2018, citycar ideal para tráfico urbano, muy económico', 'disponible'),
('33333333-3333-3333-3333-333333333333', 'Mitsubishi', 'ASX', 2017, 219900.00, 78000, 'Blanco', 'Gasolina', 'CVT', 'Mitsubishi ASX 2017, SUV compacta, mantenimiento al día', 'disponible'),
('33333333-3333-3333-3333-333333333333', 'Peugeot', '208', 2019, 179900.00, 55000, 'Rojo', 'Gasolina', 'Manual', 'Peugeot 208 2019, hatchback francés, muy bien cuidado', 'disponible');

-- También agregar algunos vehículos vendidos para estadísticas
INSERT INTO vehiculos (tenant_id, marca, modelo, año, precio, kilometraje, color, combustible, transmision, descripcion, estado) VALUES
('11111111-1111-1111-1111-111111111111', 'Toyota', 'Camry', 2020, 399900.00, 30000, 'Blanco', 'Híbrido', 'CVT', 'Toyota Camry Híbrido vendido recientemente', 'vendido'),
('22222222-2222-2222-2222-222222222222', 'Honda', 'CR-V', 2021, 519900.00, 20000, 'Gris', 'Gasolina', 'CVT', 'Honda CR-V vendida la semana pasada', 'vendido'),
('33333333-3333-3333-3333-333333333333', 'Nissan', 'March', 2017, 129900.00, 85000, 'Azul', 'Gasolina', 'Manual', 'Nissan March vendido este mes', 'vendido');