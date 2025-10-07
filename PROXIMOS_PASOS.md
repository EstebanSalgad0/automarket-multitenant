# 📋 PRÓXIMOS PASOS - AutoMarket Multitenant

## ✅ COMPLETADO HASTA AHORA

### 1. Base de Datos y Seed Data
- ✅ Ejecutado `seed_data.sql` con 4 tenants, 14 sucursales, 19 vehículos
- ✅ Creados 8 usuarios de prueba en Supabase Auth
- ✅ Asignados roles y tenant_id a todos los usuarios

### 2. Multitenancy y RLS
- ✅ Corregidas RLS policies para filtrar por `users.tenant_id`
- ✅ Eliminadas policies de desarrollo que permitían acceso sin restricciones
- ✅ Probado y funcionando: Toyota Centro ve solo sus 5 vehículos
- ✅ Probado y funcionando: Premium Motors ve solo sus 5 vehículos

### 3. Frontend - Catálogo de Vehículos
- ✅ Conectado `VehiclesCatalog.tsx` a base de datos real
- ✅ Implementados estados de loading y error
- ✅ Corregidos errores de TypeScript en `vehicleService.ts`
- ✅ Transformación de datos de Supabase al formato del componente

---

## 🚀 PRÓXIMOS PASOS

### FASE 1: Conectar Dashboards a Datos Reales (3-4 horas)

#### A. SimpleCorporateAdminDashboard
**Usuarios que lo usan:** `admin.toyota@toyotacentro.cl`, `admin.premium@premiummotors.cl`

**Métricas a mostrar:**
```typescript
// 1. Total de vehículos del tenant
SELECT COUNT(*) FROM vehicles WHERE tenant_id = current_tenant;

// 2. Vehículos por estado
SELECT status, COUNT(*) 
FROM vehicles 
WHERE tenant_id = current_tenant 
GROUP BY status;

// 3. Leads del mes
SELECT COUNT(*) 
FROM leads 
WHERE tenant_id = current_tenant 
AND created_at >= date_trunc('month', NOW());

// 4. Ventas del mes (vehículos con status='sold')
SELECT COUNT(*) 
FROM vehicles 
WHERE tenant_id = current_tenant 
AND status = 'sold'
AND updated_at >= date_trunc('month', NOW());

// 5. Top sucursales por ventas
SELECT 
  b.name,
  COUNT(v.id) as total_ventas
FROM vehicles v
JOIN branches b ON v.branch_id = b.id
WHERE v.tenant_id = current_tenant 
AND v.status = 'sold'
GROUP BY b.name
ORDER BY total_ventas DESC
LIMIT 5;

// 6. Top vendedores
SELECT 
  CONCAT(up.first_name, ' ', up.last_name) as nombre,
  COUNT(v.id) as total_ventas
FROM vehicles v
JOIN users u ON v.seller_id = u.id
JOIN user_profiles up ON u.id = up.user_id
WHERE v.tenant_id = current_tenant 
AND v.status = 'sold'
GROUP BY up.first_name, up.last_name
ORDER BY total_ventas DESC
LIMIT 5;
```

**Archivos a modificar:**
- `app/src/components/dashboards/SimpleCorporateAdminDashboard.tsx`
- Crear `app/src/services/dashboardService.ts`

**Pasos:**
1. Crear `dashboardService.ts` con métodos:
   - `getCorporateMetrics(tenantId: string)`
   - `getBranchPerformance(tenantId: string)`
   - `getSellerPerformance(tenantId: string)`
2. Modificar `SimpleCorporateAdminDashboard.tsx`:
   - Agregar `useEffect` para cargar datos
   - Reemplazar datos mock con datos reales
   - Agregar loading/error states

---

#### B. SimpleRegionalAdminDashboard
**Usuarios que lo usan:** `gerente.lascondes@toyotacentro.cl`

**Métricas a mostrar:**
```typescript
// 1. Total de vehículos de la sucursal
SELECT COUNT(*) 
FROM vehicles 
WHERE branch_id = current_branch_id;

// 2. Vehículos por estado (solo de la sucursal)
SELECT status, COUNT(*) 
FROM vehicles 
WHERE branch_id = current_branch_id 
GROUP BY status;

// 3. Leads asignados a la sucursal
SELECT COUNT(*) 
FROM leads 
WHERE branch_id = current_branch_id;

// 4. Vendedores de la sucursal con sus ventas
SELECT 
  CONCAT(up.first_name, ' ', up.last_name) as nombre,
  COUNT(v.id) as total_ventas
FROM users u
JOIN user_profiles up ON u.id = up.user_id
LEFT JOIN vehicles v ON v.seller_id = u.id AND v.status = 'sold'
WHERE u.branch_id = current_branch_id
GROUP BY up.first_name, up.last_name;

// 5. Inventario por marca
SELECT make, COUNT(*) as total
FROM vehicles
WHERE branch_id = current_branch_id
AND status = 'available'
GROUP BY make
ORDER BY total DESC;
```

**Archivos a modificar:**
- `app/src/components/dashboards/SimpleRegionalAdminDashboard.tsx`
- Agregar métodos en `dashboardService.ts`:
  - `getBranchMetrics(branchId: string)`
  - `getBranchInventory(branchId: string)`

---

#### C. SellerDashboard
**Usuarios que lo usan:** `vendedor1.lascondes@toyotacentro.cl`, `vendedor1.maipu@toyotacentro.cl`

**Métricas a mostrar:**
```typescript
// 1. Mis vehículos publicados
SELECT COUNT(*) 
FROM vehicles 
WHERE seller_id = current_user_id
AND status = 'available';

// 2. Mis ventas del mes
SELECT COUNT(*) 
FROM vehicles 
WHERE seller_id = current_user_id
AND status = 'sold'
AND updated_at >= date_trunc('month', NOW());

// 3. Mis leads asignados
SELECT COUNT(*) 
FROM leads 
WHERE assigned_to = current_user_id
AND status = 'new';

// 4. Mis vehículos por estado
SELECT status, COUNT(*) 
FROM vehicles 
WHERE seller_id = current_user_id
GROUP BY status;

// 5. Lista de mis últimos vehículos
SELECT 
  make,
  model,
  year,
  price,
  status,
  created_at
FROM vehicles
WHERE seller_id = current_user_id
ORDER BY created_at DESC
LIMIT 10;
```

**Archivos a modificar:**
- `app/src/components/dashboards/SellerDashboard.tsx`
- Agregar métodos en `dashboardService.ts`:
  - `getSellerMetrics(sellerId: string)`
  - `getSellerVehicles(sellerId: string)`
  - `getSellerLeads(sellerId: string)`

---

### FASE 2: Crear dashboardService.ts

**Estructura del servicio:**

```typescript
// app/src/services/dashboardService.ts
import { supabase } from '../lib/supabase'

export interface CorporateMetrics {
  totalVehicles: number
  vehiclesByStatus: { status: string; count: number }[]
  leadsThisMonth: number
  salesThisMonth: number
  topBranches: { name: string; sales: number }[]
  topSellers: { name: string; sales: number }[]
}

export interface BranchMetrics {
  totalVehicles: number
  vehiclesByStatus: { status: string; count: number }[]
  leads: number
  sellers: { name: string; sales: number }[]
  inventoryByBrand: { brand: string; count: number }[]
}

export interface SellerMetrics {
  publishedVehicles: number
  salesThisMonth: number
  assignedLeads: number
  vehiclesByStatus: { status: string; count: number }[]
  recentVehicles: Array<{
    make: string
    model: string
    year: number
    price: number
    status: string
    created_at: string
  }>
}

class DashboardService {
  private static instance: DashboardService

  static getInstance(): DashboardService {
    if (!DashboardService.instance) {
      DashboardService.instance = new DashboardService()
    }
    return DashboardService.instance
  }

  // Métricas para Corporate Admin
  async getCorporateMetrics(tenantId: string): Promise<CorporateMetrics> {
    // Implementar queries
  }

  // Métricas para Branch Manager
  async getBranchMetrics(branchId: string): Promise<BranchMetrics> {
    // Implementar queries
  }

  // Métricas para Seller
  async getSellerMetrics(sellerId: string): Promise<SellerMetrics> {
    // Implementar queries
  }
}

export const dashboardService = DashboardService.getInstance()
```

---

### FASE 3: Mejorar RLS Policies para Compradores (1 hora)

**Problema actual:** Los compradores no ven vehículos porque tienen `tenant_id = NULL`

**Solución:** Modificar la policy para permitir acceso a compradores

```sql
-- Eliminar policy actual
DROP POLICY IF EXISTS "View vehicles from user's tenant" ON vehicles;

-- Crear nueva policy que permite a compradores ver TODOS los vehículos
CREATE POLICY "View vehicles from user's tenant" ON vehicles 
FOR SELECT 
USING (
  -- Si el usuario tiene tenant_id, solo ve vehículos de su tenant
  -- Si el usuario NO tiene tenant_id (comprador), ve TODOS los vehículos disponibles
  CASE 
    WHEN (SELECT tenant_id FROM users WHERE id = auth.uid()) IS NOT NULL 
    THEN tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
    ELSE status = 'available'
  END
);
```

**Pruebas:**
- Login como `comprador1@email.com` → debe ver los 19 vehículos
- Login como `admin.toyota@toyotacentro.cl` → debe ver solo 5 de Toyota
- Login como `admin.premium@premiummotors.cl` → debe ver solo 5 de Premium

---

### FASE 4: Funcionalidades Adicionales (Opcional)

#### 4.1. Formulario de Creación de Vehículos
- Permitir a vendedores publicar nuevos vehículos
- Upload de imágenes a Supabase Storage
- Validaciones de formulario

#### 4.2. Sistema de Leads
- Formulario de contacto en detalle de vehículo
- Asignación automática de leads a vendedores
- Dashboard de gestión de leads

#### 4.3. Favoritos
- Implementar toggle de favoritos en catálogo
- Página de vehículos favoritos del usuario

#### 4.4. Búsqueda y Filtros Avanzados
- Búsqueda por marca, modelo, año
- Filtros por rango de precio
- Filtros por ubicación (ciudad)
- Ordenamiento (más recientes, menor precio, etc.)

#### 4.5. Detalle de Vehículo
- Crear página de detalle con todas las especificaciones
- Galería de imágenes
- Información del vendedor/dealer
- Botón de contacto que genera lead

---

## 📊 PRIORIZACIÓN RECOMENDADA

### Alta Prioridad
1. ✅ **Multitenancy básico** - COMPLETADO
2. 🔄 **Dashboards con datos reales** - PENDIENTE (3-4 horas)
3. 🔄 **RLS para compradores** - PENDIENTE (1 hora)

### Media Prioridad
4. 🔄 **Detalle de vehículo** (2-3 horas)
5. 🔄 **Sistema de leads básico** (2-3 horas)
6. 🔄 **Búsqueda y filtros** (2-3 horas)

### Baja Prioridad
7. 🔄 **Formulario de creación de vehículos** (3-4 horas)
8. 🔄 **Upload de imágenes** (2-3 horas)
9. 🔄 **Sistema de favoritos** (1-2 horas)

---

## 🔧 COMANDOS ÚTILES

### Verificar RLS Policies
```sql
-- Ver todas las policies activas
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE tablename IN ('vehicles', 'vehicle_images', 'leads')
ORDER BY tablename, policyname;
```

### Verificar datos de usuario
```sql
-- Ver configuración de un usuario específico
SELECT 
  au.id,
  au.email,
  u.tenant_id,
  u.role,
  u.user_type,
  u.branch_id,
  t.name as tenant_name,
  b.name as branch_name
FROM auth.users au
LEFT JOIN public.users u ON au.id = u.id
LEFT JOIN public.tenants t ON u.tenant_id = t.id
LEFT JOIN public.branches b ON u.branch_id = b.id
WHERE au.email = 'admin.toyota@toyotacentro.cl';
```

### Contar vehículos por tenant
```sql
SELECT 
  t.name as tenant_name,
  COUNT(v.id) as total_vehiculos,
  COUNT(CASE WHEN v.status = 'available' THEN 1 END) as disponibles,
  COUNT(CASE WHEN v.status = 'sold' THEN 1 END) as vendidos
FROM tenants t
LEFT JOIN vehicles v ON t.id = v.tenant_id
GROUP BY t.name
ORDER BY total_vehiculos DESC;
```

---

## 📝 CREDENCIALES DE USUARIOS DE PRUEBA

### 🔐 RESUMEN DE ACCESOS

| # | Email | Contraseña | Rol | Tenant | Sucursal |
|---|-------|-----------|-----|--------|----------|
| 1 | admin.toyota@toyotacentro.cl | Admin123! | Corporate Admin | Toyota Centro | - |
| 2 | gerente.lascondes@toyotacentro.cl | Gerente123! | Branch Manager | Toyota Centro | Las Condes |
| 3 | vendedor1.lascondes@toyotacentro.cl | Vendedor123! | Sales | Toyota Centro | Las Condes |
| 4 | vendedor1.maipu@toyotacentro.cl | Vendedor123! | Sales | Toyota Centro | Maipú |
| 5 | admin.premium@premiummotors.cl | Admin123! | Corporate Admin | Premium Motors | - |
| 6 | vendedor.vitacura@premiummotors.cl | Vendedor123! | Sales | Premium Motors | Vitacura |
| 7 | comprador1@email.com | Comprador123! | Buyer | - | - |
| 8 | comprador2@email.com | Comprador123! | Buyer | - | - |

---

### 🚗 TOYOTA CENTRO (4 usuarios)

#### 1. Administrador Corporativo
```
Email:    admin.toyota@toyotacentro.cl
Password: Admin123!
Rol:      corporate_admin
Tenant:   Toyota Centro
Acceso:   Ve 5 vehículos de Toyota Centro ✅
Dashboard: SimpleCorporateAdminDashboard
```

#### 2. Gerente de Sucursal - Las Condes
```
Email:    gerente.lascondes@toyotacentro.cl
Password: Gerente123!
Rol:      branch_manager
Tenant:   Toyota Centro
Sucursal: Las Condes
Dashboard: SimpleRegionalAdminDashboard
```

#### 3. Vendedor - Las Condes
```
Email:    vendedor1.lascondes@toyotacentro.cl
Password: Vendedor123!
Rol:      sales
Tenant:   Toyota Centro
Sucursal: Las Condes
Dashboard: SellerDashboard
```

#### 4. Vendedor - Maipú
```
Email:    vendedor1.maipu@toyotacentro.cl
Password: Vendedor123!
Rol:      sales
Tenant:   Toyota Centro
Sucursal: Maipú
Dashboard: SellerDashboard
```

---

### 🏎️ PREMIUM MOTORS (2 usuarios)

#### 5. Administrador Corporativo
```
Email:    admin.premium@premiummotors.cl
Password: Admin123!
Rol:      corporate_admin
Tenant:   Premium Motors
Acceso:   Ve 5 vehículos de Premium Motors ✅
Dashboard: SimpleCorporateAdminDashboard
```

#### 6. Vendedor - Vitacura
```
Email:    vendedor.vitacura@premiummotors.cl
Password: Vendedor123!
Rol:      sales
Tenant:   Premium Motors
Sucursal: Vitacura
Dashboard: SellerDashboard
```

---

### 👤 COMPRADORES (2 usuarios)

#### 7. Comprador 1
```
Email:    comprador1@email.com
Password: Comprador123!
Rol:      buyer
Tenant:   NULL (sin tenant)
Acceso:   ⚠️ Actualmente ve 0 vehículos (necesita fix de RLS)
          Debería ver: TODOS los vehículos disponibles (19 total)
```

#### 8. Comprador 2
```
Email:    comprador2@email.com
Password: Comprador123!
Rol:      buyer
Tenant:   NULL (sin tenant)
Acceso:   ⚠️ Actualmente ve 0 vehículos (necesita fix de RLS)
          Debería ver: TODOS los vehículos disponibles (19 total)
```

---

### 🔑 FORMATO RÁPIDO PARA COPIAR/PEGAR

```bash
# Toyota Centro
admin.toyota@toyotacentro.cl / Admin123!
gerente.lascondes@toyotacentro.cl / Gerente123!
vendedor1.lascondes@toyotacentro.cl / Vendedor123!
vendedor1.maipu@toyotacentro.cl / Vendedor123!

# Premium Motors
admin.premium@premiummotors.cl / Admin123!
vendedor.vitacura@premiummotors.cl / Vendedor123!

# Compradores
comprador1@email.com / Comprador123!
comprador2@email.com / Comprador123!
```

---

### 📊 DISTRIBUCIÓN DE VEHÍCULOS POR TENANT

| Tenant | Total Vehículos | Disponibles | Vendidos |
|--------|----------------|-------------|----------|
| Toyota Centro | 5 | 5 | 0 |
| Premium Motors | 5 | 5 | 0 |
| Automotora Del Sur | 4 | 4 | 0 |
| Automotora Express | 5 | 5 | 0 |
| **TOTAL** | **19** | **19** | **0** |

**Nota:** Actualmente solo hay usuarios para Toyota Centro y Premium Motors. Los otros 2 tenants (Del Sur y Express) tienen vehículos pero no usuarios asignados.

---

## ✅ CHECKLIST DE VALIDACIÓN

Antes de considerar el proyecto completado, verificar:

- [ ] Dashboards muestran datos reales (no mock)
- [ ] Métricas se actualizan en tiempo real
- [ ] Compradores pueden ver todos los vehículos disponibles
- [ ] Dealers solo ven sus propios vehículos
- [ ] Gerentes solo ven datos de su sucursal
- [ ] Vendedores solo ven sus propios vehículos y leads
- [ ] No hay errores en consola del navegador
- [ ] No hay errores de TypeScript
- [ ] Todos los tests de multitenancy pasan

---

## 📚 RECURSOS

### Documentación
- [Supabase Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase Database Functions](https://supabase.com/docs/guides/database/functions)
- [React Query (para cache)](https://tanstack.com/query/latest)

### Archivos Importantes
- `app/src/services/vehicleService.ts` - Servicio de vehículos (COMPLETADO)
- `app/src/components/VehiclesCatalog.tsx` - Catálogo (COMPLETADO)
- `scripts/fix_rls_policies.sql` - RLS policies (COMPLETADO)
- `database/seeds/seed_data.sql` - Datos de prueba (COMPLETADO)

---

## 🎯 OBJETIVO FINAL

Tener un sistema completo de marketplace de vehículos multitenancy donde:
- ✅ Cada automotora solo ve y gestiona sus propios vehículos
- ✅ Compradores pueden ver todos los vehículos de todas las automotoras
- ✅ Dashboards muestran métricas relevantes según el rol
- ✅ Sistema seguro con RLS en todas las tablas críticas

---

**Fecha de creación:** 7 de octubre, 2025
**Estado actual:** Multitenancy funcionando, dashboards pendientes
**Próxima sesión:** Implementar dashboards con datos reales
