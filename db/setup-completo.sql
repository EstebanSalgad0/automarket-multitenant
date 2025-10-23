-- =====================================
-- AUTOMARKET MULTITENANT - SETUP COMPLETO
-- Script único para configurar todo el proyecto
-- Fecha: 23 de octubre de 2025
-- =====================================

-- =====================================
-- 1. EXTENSIONES NECESARIAS
-- =====================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================
-- 2. LIMPIEZA (opcional - descomenta si necesitas reset completo)
-- =====================================
-- DROP TABLE IF EXISTS vehicle_images CASCADE;
-- DROP TABLE IF EXISTS vehiculos CASCADE;
-- DROP TABLE IF EXISTS productos CASCADE;
-- DROP TABLE IF EXISTS tenant_usuarios CASCADE;
-- DROP TABLE IF EXISTS usuarios CASCADE;
-- DROP TABLE IF EXISTS tenants CASCADE;

-- =====================================
-- 3. FUNCIONES AUXILIARES
-- =====================================

-- Función para actualizar timestamp automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- =====================================
-- 4. TABLA PRINCIPAL: TENANTS
-- =====================================
CREATE TABLE IF NOT EXISTS tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(255) NOT NULL,
    tipo VARCHAR(50) NOT NULL CHECK (tipo IN ('automotora', 'particular')),
    descripcion TEXT,
    
    -- Información de contacto
    direccion TEXT,
    telefono VARCHAR(20),
    email VARCHAR(255),
    website VARCHAR(255),
    
    -- Metadatos
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    estado VARCHAR(20) DEFAULT 'activo' CHECK (estado IN ('activo', 'inactivo', 'suspendido'))
);

-- Trigger para updated_at
CREATE TRIGGER update_tenants_updated_at BEFORE UPDATE ON tenants
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- =====================================
-- 5. TABLA: USUARIOS GLOBALES
-- =====================================
CREATE TABLE IF NOT EXISTS usuarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    telefono VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    estado VARCHAR(20) DEFAULT 'activo' CHECK (estado IN ('activo', 'inactivo', 'suspendido'))
);

-- Trigger para updated_at
CREATE TRIGGER update_usuarios_updated_at BEFORE UPDATE ON usuarios
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- =====================================
-- 6. TABLA: MEMBRESÍAS TENANT-USUARIO
-- =====================================
CREATE TABLE IF NOT EXISTS tenant_usuarios (
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    rol VARCHAR(50) NOT NULL CHECK (rol IN (
        'automotora_admin',
        'vendedor_automotora', 
        'vendedor_particular',
        'comprador'
    )),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (tenant_id, usuario_id)
);

-- =====================================
-- 7. TABLA PRINCIPAL: VEHÍCULOS
-- =====================================
CREATE TABLE IF NOT EXISTS vehiculos (
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    
    -- Información básica del vehículo
    marca VARCHAR(100) NOT NULL,
    modelo VARCHAR(100) NOT NULL,
    año INTEGER NOT NULL CHECK (año >= 1900 AND año <= EXTRACT(YEAR FROM CURRENT_DATE) + 1),
    precio NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (precio >= 0),
    
    -- Características técnicas
    kilometraje INTEGER DEFAULT 0 CHECK (kilometraje >= 0),
    color VARCHAR(50),
    combustible VARCHAR(30) CHECK (combustible IN ('Gasolina', 'Diésel', 'Híbrido', 'Eléctrico', 'GLP', 'GNC')),
    transmision VARCHAR(30) CHECK (transmision IN ('Manual', 'Automática', 'CVT', 'Semi-automática')),
    
    -- Información adicional
    descripcion TEXT,
    estado VARCHAR(20) NOT NULL DEFAULT 'disponible' CHECK (estado IN (
        'disponible', 
        'vendido', 
        'reservado',
        'mantenimiento',
        'oculto'
    )),
    
    -- Información del vendedor
    vendedor_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
    
    -- Metadatos
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    PRIMARY KEY (tenant_id, id)
);

-- Trigger para updated_at
CREATE TRIGGER update_vehiculos_updated_at BEFORE UPDATE ON vehiculos
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- =====================================
-- 8. TABLA: IMÁGENES DE VEHÍCULOS
-- =====================================
CREATE TABLE IF NOT EXISTS vehicle_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    vehicle_id UUID NOT NULL,
    image_url TEXT NOT NULL,
    image_name VARCHAR(255),
    is_primary BOOLEAN DEFAULT FALSE,
    orden INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (tenant_id, vehicle_id) REFERENCES vehiculos(tenant_id, id) ON DELETE CASCADE
);

-- =====================================
-- 9. TABLA: PRODUCTOS (Para requisitos académicos)
-- =====================================
CREATE TABLE IF NOT EXISTS productos (
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    precio NUMERIC(10,2) NOT NULL DEFAULT 0,
    categoria VARCHAR(100),
    stock INTEGER DEFAULT 0,
    estado VARCHAR(20) DEFAULT 'activo' CHECK (estado IN ('activo', 'inactivo', 'agotado')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (tenant_id, id)
);

-- Trigger para updated_at
CREATE TRIGGER update_productos_updated_at BEFORE UPDATE ON productos
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- =====================================
-- 10. ÍNDICES PARA OPTIMIZACIÓN
-- =====================================

-- Índices para tenants
CREATE INDEX IF NOT EXISTS idx_tenants_email ON tenants(email);
CREATE INDEX IF NOT EXISTS idx_tenants_tipo ON tenants(tipo);
CREATE INDEX IF NOT EXISTS idx_tenants_estado ON tenants(estado);

-- Índices para usuarios
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);
CREATE INDEX IF NOT EXISTS idx_usuarios_estado ON usuarios(estado);

-- Índices para vehículos
CREATE INDEX IF NOT EXISTS idx_vehiculos_tenant_marca ON vehiculos(tenant_id, marca);
CREATE INDEX IF NOT EXISTS idx_vehiculos_tenant_precio ON vehiculos(tenant_id, precio);
CREATE INDEX IF NOT EXISTS idx_vehiculos_tenant_año ON vehiculos(tenant_id, año);
CREATE INDEX IF NOT EXISTS idx_vehiculos_tenant_estado ON vehiculos(tenant_id, estado);
CREATE INDEX IF NOT EXISTS idx_vehiculos_marca_modelo ON vehiculos(marca, modelo);
CREATE INDEX IF NOT EXISTS idx_vehiculos_precio_range ON vehiculos(precio) WHERE estado = 'disponible';

-- Índices para imágenes
CREATE INDEX IF NOT EXISTS idx_vehicle_images_tenant_vehicle ON vehicle_images(tenant_id, vehicle_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_images_primary ON vehicle_images(is_primary) WHERE is_primary = TRUE;

-- Índices para productos
CREATE INDEX IF NOT EXISTS idx_productos_tenant_categoria ON productos(tenant_id, categoria);
CREATE INDEX IF NOT EXISTS idx_productos_tenant_precio ON productos(tenant_id, precio);

-- =====================================
-- 11. DATOS DE EJEMPLO - TENANTS
-- =====================================

-- Tenant 1: Toyota Centro Chile
INSERT INTO tenants (id, nombre, tipo, descripcion, direccion, telefono, email, website) VALUES 
('11111111-1111-1111-1111-111111111111', 
 'Toyota Centro Chile', 
 'automotora', 
 'Concesionario oficial Toyota con más de 20 años de experiencia',
 'Av. Apoquindo 4501, Las Condes, Santiago',
 '+56912345678',
 'info@toyotacentro.cl',
 'https://toyotacentro.cl')
ON CONFLICT (id) DO NOTHING;

-- Tenant 2: Premium Motors
INSERT INTO tenants (id, nombre, tipo, descripcion, direccion, telefono, email, website) VALUES 
('22222222-2222-2222-2222-222222222222', 
 'Premium Motors', 
 'automotora', 
 'Especialistas en vehículos premium y de lujo',
 'Av. Vitacura 8800, Vitacura, Las Condes',
 '+56987654321',
 'contacto@premiummotors.cl',
 'https://premiummotors.cl')
ON CONFLICT (id) DO NOTHING;

-- Tenant 3: AutoVendedores Independientes
INSERT INTO tenants (id, nombre, tipo, descripcion, direccion, telefono, email) VALUES 
('33333333-3333-3333-3333-333333333333', 
 'AutoVendedores Independientes', 
 'particular', 
 'Plataforma para vendedores particulares de vehículos',
 'Av. Pedro Montt 1567, Valparaíso',
 '+56911223344',
 'info@autoindependientes.cl')
ON CONFLICT (id) DO NOTHING;

-- =====================================
-- 12. DATOS DE EJEMPLO - USUARIOS
-- =====================================

-- Usuarios Toyota Centro
INSERT INTO usuarios (id, email, nombre, telefono) VALUES 
('u1111111-1111-1111-1111-111111111111', 'admin@toyotacentro.cl', 'Carlos Eduardo Martínez', '+56912345678'),
('u1111111-1111-1111-1111-111111111112', 'vendedor@toyotacentro.cl', 'María José Silva Romero', '+56987654321')
ON CONFLICT (email) DO NOTHING;

-- Usuarios Premium Motors
INSERT INTO usuarios (id, email, nombre, telefono) VALUES 
('u2222222-2222-2222-2222-222222222221', 'admin@premiummotors.cl', 'Roberto Antonio González', '+56998877665')
ON CONFLICT (email) DO NOTHING;

-- Usuarios Independientes
INSERT INTO usuarios (id, email, nombre, telefono) VALUES 
('u3333333-3333-3333-3333-333333333331', 'vendedor@autoindependientes.cl', 'Ana Patricia Morales', '+56911223344')
ON CONFLICT (email) DO NOTHING;

-- =====================================
-- 13. DATOS DE EJEMPLO - MEMBRESÍAS
-- =====================================

-- Membresías Toyota Centro
INSERT INTO tenant_usuarios (tenant_id, usuario_id, rol) VALUES 
('11111111-1111-1111-1111-111111111111', 'u1111111-1111-1111-1111-111111111111', 'automotora_admin'),
('11111111-1111-1111-1111-111111111111', 'u1111111-1111-1111-1111-111111111112', 'vendedor_automotora')
ON CONFLICT (tenant_id, usuario_id) DO NOTHING;

-- Membresías Premium Motors
INSERT INTO tenant_usuarios (tenant_id, usuario_id, rol) VALUES 
('22222222-2222-2222-2222-222222222222', 'u2222222-2222-2222-2222-222222222221', 'automotora_admin')
ON CONFLICT (tenant_id, usuario_id) DO NOTHING;

-- Membresías Independientes
INSERT INTO tenant_usuarios (tenant_id, usuario_id, rol) VALUES 
('33333333-3333-3333-3333-333333333333', 'u3333333-3333-3333-3333-333333333331', 'vendedor_particular')
ON CONFLICT (tenant_id, usuario_id) DO NOTHING;

-- =====================================
-- 14. DATOS DE EJEMPLO - VEHÍCULOS
-- =====================================

-- Vehículos Toyota Centro
INSERT INTO vehiculos (tenant_id, id, marca, modelo, año, precio, kilometraje, color, combustible, transmision, descripcion, vendedor_id) VALUES 
('11111111-1111-1111-1111-111111111111', '59f78bf8-c593-4604-873e-80bb51911774', 'Toyota', 'Corolla', 2023, 379900.00, 15000, 'Blanco', 'Gasolina', 'Automática', 'Vehículo en excelente estado, único dueño, revisiones al día', 'u1111111-1111-1111-1111-111111111111'),
('11111111-1111-1111-1111-111111111111', '9322374f-d62e-4866-ab9f-7d1f355c0a69', 'Toyota', 'RAV4', 2022, 519900.00, 25000, 'Azul', 'Gasolina', 'Automática', 'SUV familiar, perfecto para aventuras', 'u1111111-1111-1111-1111-111111111112'),
('11111111-1111-1111-1111-111111111111', '2397d998-5fa0-40d1-80a7-21f6a27357c4', 'Toyota', 'Camry', 2022, 469900.00, 18000, 'Negro', 'Gasolina', 'Automática', 'Sedan ejecutivo, muy cómodo y elegante', 'u1111111-1111-1111-1111-111111111111')
ON CONFLICT (tenant_id, id) DO NOTHING;

-- Vehículos Premium Motors
INSERT INTO vehiculos (tenant_id, id, marca, modelo, año, precio, kilometraje, color, combustible, transmision, descripcion, vendedor_id) VALUES 
('22222222-2222-2222-2222-222222222222', 'f9d8cfc7-7384-4431-8c56-27d9056f3202', 'Honda', 'Civic', 2020, 325000.00, 35000, 'Rojo', 'Gasolina', 'Manual', 'Deportivo y eficiente, ideal para jóvenes', 'u2222222-2222-2222-2222-222222222221'),
('22222222-2222-2222-2222-222222222222', '4e2d5e68-beb8-4ba7-aa9b-8b86ceb6bb16', 'Volkswagen', 'Jetta', 2019, 285000.00, 42000, 'Plata', 'Gasolina', 'Automática', 'Calidad alemana, muy confiable', 'u2222222-2222-2222-2222-222222222221')
ON CONFLICT (tenant_id, id) DO NOTHING;

-- Vehículos Independientes
INSERT INTO vehiculos (tenant_id, id, marca, modelo, año, precio, kilometraje, color, combustible, transmision, descripcion, vendedor_id) VALUES 
('33333333-3333-3333-3333-333333333333', '7e3c88ce-c44f-41f3-8160-5dca5d1187a1', 'Nissan', 'Sentra', 2018, 195000.00, 65000, 'Gris', 'Gasolina', 'CVT', 'Económico y rendidor, ideal para ciudad', 'u3333333-3333-3333-3333-333333333331'),
('33333333-3333-3333-3333-333333333333', '26670a6e-82b8-41e3-952f-e3053d0e44b2', 'Ford', 'Focus', 2017, 178000.00, 78000, 'Azul', 'Gasolina', 'Manual', 'Compacto y ágil, perfecto para la ciudad', 'u3333333-3333-3333-3333-333333333331')
ON CONFLICT (tenant_id, id) DO NOTHING;

-- =====================================
-- 15. DATOS DE EJEMPLO - PRODUCTOS (Académico)
-- =====================================

-- Productos Toyota Centro
INSERT INTO productos (tenant_id, nombre, descripcion, precio, categoria, stock) VALUES 
('11111111-1111-1111-1111-111111111111', 'Aceite de Motor 5W-30', 'Aceite sintético premium para motores Toyota', 45990.00, 'Repuestos', 50),
('11111111-1111-1111-1111-111111111111', 'Filtro de Aire', 'Filtro de aire original Toyota', 25990.00, 'Repuestos', 30),
('11111111-1111-1111-1111-111111111111', 'Neumático Bridgestone 205/55R16', 'Neumático de alta calidad', 89990.00, 'Neumáticos', 20)
ON CONFLICT DO NOTHING;

-- Productos Premium Motors
INSERT INTO productos (tenant_id, nombre, descripcion, precio, categoria, stock) VALUES 
('22222222-2222-2222-2222-222222222222', 'Cera Premium', 'Cera de carnauba para acabado profesional', 35990.00, 'Accesorios', 25),
('22222222-2222-2222-2222-222222222222', 'Fundas de Asiento Cuero', 'Fundas de cuero genuino importadas', 159990.00, 'Accesorios', 10)
ON CONFLICT DO NOTHING;

-- =====================================
-- 16. CONSULTAS DE VERIFICACIÓN
-- =====================================

-- Verificar instalación
DO $$
BEGIN
    RAISE NOTICE '===============================================';
    RAISE NOTICE 'AUTOMARKET MULTITENANT - INSTALACIÓN COMPLETA';
    RAISE NOTICE '===============================================';
    RAISE NOTICE 'Tenants creados: %', (SELECT COUNT(*) FROM tenants);
    RAISE NOTICE 'Usuarios creados: %', (SELECT COUNT(*) FROM usuarios);
    RAISE NOTICE 'Vehículos creados: %', (SELECT COUNT(*) FROM vehiculos);
    RAISE NOTICE 'Productos creados: %', (SELECT COUNT(*) FROM productos);
    RAISE NOTICE '===============================================';
    RAISE NOTICE 'Instalación completada exitosamente!';
    RAISE NOTICE 'Puedes comenzar a usar el sistema.';
    RAISE NOTICE '===============================================';
END $$;

-- =====================================
-- 17. CONSULTAS DE PRUEBA
-- =====================================

-- Mostrar resumen de datos
SELECT 
    t.nombre as tenant,
    t.tipo,
    COUNT(v.id) as total_vehiculos,
    AVG(v.precio) as precio_promedio
FROM tenants t
LEFT JOIN vehiculos v ON t.id = v.tenant_id
GROUP BY t.id, t.nombre, t.tipo
ORDER BY t.nombre;

-- Mostrar vehículos por tenant
SELECT 
    t.nombre as concesionario,
    v.marca,
    v.modelo,
    v.año,
    v.precio,
    v.estado
FROM tenants t
JOIN vehiculos v ON t.id = v.tenant_id
ORDER BY t.nombre, v.precio DESC;

-- =====================================
-- FIN DEL SCRIPT
-- =====================================