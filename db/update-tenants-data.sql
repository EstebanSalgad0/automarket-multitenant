-- =====================================================
-- Actualizar Datos Completos del Tenant Toyota Centro Chile
-- =====================================================

-- Actualizar información completa de Toyota Centro Chile
UPDATE tenants 
SET 
  tax_id = '96123456-7',
  address = 'Av. Apoquindo 4501, Las Condes',
  city = 'Santiago',
  state = 'Región Metropolitana',
  postal_code = '7550000',
  website = 'https://toyotacentro.cl',
  subscription_plan = 'enterprise',
  settings = jsonb_build_object(
    'theme_color', '#d32f2f',
    'logo_primary', 'toyota-logo.png',
    'business_hours', jsonb_build_object(
      'monday_friday', '08:30-19:00',
      'saturday', '09:00-17:00',
      'sunday', 'closed'
    ),
    'contact_info', jsonb_build_object(
      'sales_phone', '+56912345678',
      'service_phone', '+56912345679',
      'whatsapp', '+56912345678'
    ),
    'social_media', jsonb_build_object(
      'facebook', '@ToyotaCentroChile',
      'instagram', '@toyotacentrochile',
      'twitter', '@ToyotaChile'
    )
  ),
  updated_at = now()
WHERE company_name = 'Toyota Centro Chile';

-- Actualizar información de Premium Motors
UPDATE tenants 
SET 
  tax_id = '76987654-3',
  address = 'Av. Vitacura 8800, Vitacura',
  city = 'Las Condes',
  state = 'Región Metropolitana',
  postal_code = '7630000',
  website = 'https://premiummotors.cl',
  subscription_plan = 'premium',
  settings = jsonb_build_object(
    'theme_color', '#1976d2',
    'logo_primary', 'premium-logo.png',
    'business_hours', jsonb_build_object(
      'monday_friday', '09:00-18:30',
      'saturday', '09:30-16:00',
      'sunday', 'closed'
    ),
    'contact_info', jsonb_build_object(
      'sales_phone', '+56987654321',
      'service_phone', '+56987654322',
      'whatsapp', '+56987654321'
    )
  ),
  updated_at = now()
WHERE company_name = 'Premium Motors';

-- Actualizar información de AutoVendedores Independientes
UPDATE tenants 
SET 
  tax_id = '12345678-9',
  address = 'Av. Pedro Montt 1567, Valparaíso',
  city = 'Valparaíso',
  state = 'Región de Valparaíso',
  postal_code = '2340000',
  subscription_plan = 'basic',
  settings = jsonb_build_object(
    'theme_color', '#ff9800',
    'business_hours', jsonb_build_object(
      'monday_saturday', '09:00-19:00',
      'sunday', '10:00-16:00'
    ),
    'contact_info', jsonb_build_object(
      'sales_phone', '+56911223344',
      'whatsapp', '+56911223344'
    )
  ),
  updated_at = now()
WHERE company_name = 'AutoVendedores Independientes';

-- Verificar actualizaciones
SELECT 
  company_name,
  tax_id,
  city,
  subscription_plan,
  settings->>'theme_color' as theme_color,
  website
FROM tenants
ORDER BY company_name;