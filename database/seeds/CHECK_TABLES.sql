-- Script para verificar las columnas de las tablas
-- Ejecutar esto primero para saber qué columnas existen

-- Ver columnas de la tabla vehicles
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'vehicles' 
ORDER BY ordinal_position;

-- Ver columnas de la tabla user_profiles
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'user_profiles' 
ORDER BY ordinal_position;
