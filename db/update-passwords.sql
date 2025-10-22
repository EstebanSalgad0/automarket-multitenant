-- =====================================================
-- ACTUALIZAR CONTRASEÑAS DE USUARIOS DEMO
-- =====================================================
-- Script para actualizar las contraseñas de todos los usuarios demo
-- para que coincidan con la documentación USUARIOS_DEMO.md

-- Actualizar contraseña de Carlos Eduardo Martínez (Toyota Admin)
UPDATE auth.users 
SET encrypted_password = crypt('toyota123', gen_salt('bf'))
WHERE email = 'carlos.martinez@toyotacentro.cl';

-- Actualizar contraseña de María José Silva Romero (Toyota Seller)
UPDATE auth.users 
SET encrypted_password = crypt('toyota123', gen_salt('bf'))
WHERE email = 'maria.silva@toyotacentro.cl';

-- Actualizar contraseña de Roberto Antonio González (Premium Admin)
UPDATE auth.users 
SET encrypted_password = crypt('premium123', gen_salt('bf'))
WHERE email = 'roberto.gonzalez@premiummotors.cl';

-- Actualizar contraseña de Ana Patricia Morales (Auto Seller)
UPDATE auth.users 
SET encrypted_password = crypt('auto123', gen_salt('bf'))
WHERE email = 'ana.morales@autovendedores.cl';

-- Verificar que las actualizaciones se aplicaron correctamente
SELECT 
    email,
    created_at,
    updated_at,
    email_confirmed_at IS NOT NULL as email_confirmed
FROM auth.users 
WHERE email IN (
    'carlos.martinez@toyotacentro.cl',
    'maria.silva@toyotacentro.cl', 
    'roberto.gonzalez@premiummotors.cl',
    'ana.morales@autovendedores.cl'
)
ORDER BY email;

-- Mensaje de confirmación
DO $$ 
BEGIN 
    RAISE NOTICE '✅ Contraseñas actualizadas correctamente:';
    RAISE NOTICE '- Carlos Eduardo Martínez: toyota123';
    RAISE NOTICE '- María José Silva: toyota123';
    RAISE NOTICE '- Roberto González: premium123';
    RAISE NOTICE '- Ana Patricia Morales: auto123';
END $$;