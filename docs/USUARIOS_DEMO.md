# 👥 USUARIOS DEMO - AutoMarket MultiTenant

## 🔐 CREDENCIALES DE ACCESO

### 🏢 **Toyota Centro Chile**
**Tenant ID:** `11111111-1111-1111-1111-111111111111`
- **RUT:** 96123456-7
- **Dirección:** Av. Apoquindo 4501, Las Condes, Santiago
- **Teléfono Ventas:** +56912345678
- **Teléfono Servicio:** +56912345679
- **Website:** https://toyotacentro.cl
- **Plan:** Enterprise
- **Horarios:** Lun-Vie 08:30-19:00, Sáb 09:00-17:00

#### 👨‍💼 Administrador - Carlos Eduardo Martínez
- **Email:** `admin@toyotacentro.cl`
- **Contraseña:** `Toyota123!`
- **Rol:** `corporate_admin`
- **Tipo de Usuario:** `admin`
- **Teléfono:** `+56912345678`
- **ID Empleado:** `TCC-001`
- **Fecha Contratación:** 15 de enero 2020
- **Salario:** $8.500.000 CLP
- **Comisión:** 5.00%

#### 👤 Vendedor - María José Silva Romero
- **Email:** `vendedor@toyotacentro.cl`
- **Contraseña:** `Vendedor123!`
- **Rol:** `salesperson`
- **Tipo de Usuario:** `seller`
- **Teléfono:** `+56987654321`
- **ID Empleado:** `TCC-002`
- **Fecha Contratación:** 10 de marzo 2021
- **Salario:** $650.000 CLP
- **Comisión:** 15.00%

---

### 🏢 **Premium Motors**
**Tenant ID:** `22222222-2222-2222-2222-222222222222`
- **RUT:** 76987654-3
- **Dirección:** Av. Vitacura 8800, Vitacura, Las Condes
- **Teléfono Ventas:** +56987654321
- **Teléfono Servicio:** +56987654322
- **Website:** https://premiummotors.cl
- **Plan:** Premium
- **Horarios:** Lun-Vie 09:00-18:30, Sáb 09:30-16:00

#### 👨‍💼 Administrador - Roberto Antonio González
- **Email:** `admin@premiummotors.cl`
- **Contraseña:** `Premium123!`
- **Rol:** `corporate_admin`
- **Tipo de Usuario:** `admin`
- **Teléfono:** `+56998877665`
- **ID Empleado:** `PM-001`
- **Fecha Contratación:** 1 de junio 2019
- **Salario:** $9.200.000 CLP
- **Comisión:** 4.00%

---

### 🏢 **AutoVendedores Independientes**
**Tenant ID:** `33333333-3333-3333-3333-333333333333`
- **RUT:** 12345678-9
- **Dirección:** Av. Pedro Montt 1567, Valparaíso
- **Teléfono:** +56911223344
- **Plan:** Básico
- **Horarios:** Lun-Sáb 09:00-19:00, Dom 10:00-16:00

#### 👤 Vendedor - Ana Patricia Morales
- **Email:** `vendedor@autoindependientes.cl`
- **Contraseña:** `Auto123!`
- **Rol:** `salesperson`
- **Tipo de Usuario:** `seller`
- **Teléfono:** `+56911223344`
- **ID Empleado:** `IND-001`
- **Fecha Contratación:** 20 de enero 2022
- **Comisión:** 20.00%

---

## 📊 VEHÍCULOS DE PRUEBA CREADOS

### Toyota Centro Chile:
1. **Toyota Corolla 2023** - $15.000.000 (Admin)
2. **Toyota RAV4 2022** - $25.000.000 (Vendedor)

### Premium Motors:
1. **BMW Serie 3 2023** - $35.000.000 (Admin)

### AutoVendedores Independientes:
1. **Honda Civic 2021** - $12.000.000 (Vendedor)

---

## 🔧 COMANDOS ÚTILES PARA TESTING

### Verificar usuarios en SQL:
```sql
SELECT 
  au.email as user_email,
  up.role as user_role,
  t.company_name as tenant_name,
  (up.id IS NOT NULL) as profile_exists
FROM auth.users au
LEFT JOIN user_profiles up ON au.id = up.id
LEFT JOIN tenants t ON up.tenant_id = t.id
ORDER BY au.email;
```

### Ver vehículos por tenant:
```sql
SELECT 
  v.brand,
  v.model,
  v.year,
  v.price,
  t.company_name as tenant,
  up.email as seller_email
FROM vehicles v
JOIN tenants t ON v.tenant_id = t.id
JOIN user_profiles up ON v.seller_id = up.id
ORDER BY t.company_name;
```

---

## 📝 NOTAS IMPORTANTES

- ✅ Todos los usuarios están configurados y asignados a sus tenants
- ✅ Las políticas RLS están activas y funcionando
- ✅ Cada usuario solo puede ver/editar datos de su tenant
- ✅ Los roles determinan los permisos dentro del tenant

**Fecha de Creación:** 21 de octubre de 2025  
**Estado:** ✅ Configuración Completa y Funcional