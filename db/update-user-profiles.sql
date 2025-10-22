-- =====================================================
-- Actualizar Perfil Completo del Corporate Admin Toyota
-- =====================================================

-- Actualizar perfil del admin de Toyota Centro Chile
UPDATE user_profiles 
SET 
  full_name = 'Carlos Eduardo Martínez',
  phone = '+56912345678',
  employee_id = 'TCC-001',
  hire_date = '2020-01-15',
  salary = 8500000,
  commission_rate = 5.00,
  status = 'active',
  email_verified_at = now(),
  phone_verified_at = now(),
  updated_at = now()
WHERE email = 'admin@toyotacentro.cl';

-- Actualizar perfil del vendedor de Toyota Centro Chile
UPDATE user_profiles 
SET 
  full_name = 'María José Silva Romero',
  phone = '+56987654321',
  employee_id = 'TCC-002', 
  hire_date = '2021-03-10',
  salary = 650000,
  commission_rate = 15.00,
  status = 'active',
  email_verified_at = now(),
  phone_verified_at = now(),
  updated_at = now()
WHERE email = 'vendedor@toyotacentro.cl';

-- Actualizar perfil del admin de Premium Motors
UPDATE user_profiles 
SET 
  full_name = 'Roberto Antonio González',
  phone = '+56998877665',
  employee_id = 'PM-001',
  hire_date = '2019-06-01',
  salary = 9200000,
  commission_rate = 4.00,
  status = 'active',
  email_verified_at = now(),
  phone_verified_at = now(),
  updated_at = now()
WHERE email = 'admin@premiummotors.cl';

-- Actualizar perfil del vendedor independiente
UPDATE user_profiles 
SET 
  full_name = 'Ana Patricia Morales',
  phone = '+56911223344',
  employee_id = 'IND-001',
  hire_date = '2022-01-20',
  commission_rate = 20.00,
  status = 'active',
  email_verified_at = now(),
  phone_verified_at = now(),
  updated_at = now()
WHERE email = 'vendedor@autoindependientes.cl';

-- Verificar las actualizaciones
SELECT 
  email,
  full_name,
  role,
  phone,
  employee_id,
  hire_date,
  salary,
  commission_rate,
  status
FROM user_profiles
ORDER BY email;