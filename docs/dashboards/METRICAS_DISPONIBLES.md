# 📊 Métricas Reales Disponibles - AutoMarket

## Basado en el esquema de base de datos actual

### 🚗 **Métricas de Vehículos** (tabla: `vehicles`)

#### Estadísticas Básicas:
- ✅ **Total de vehículos** - `COUNT(*) FROM vehicles`
- ✅ **Vehículos disponibles** - `WHERE status = 'available'`
- ✅ **Vehículos vendidos** - `WHERE status = 'sold'`
- ✅ **Vehículos reservados** - `WHERE status = 'reserved'`
- ✅ **Vehículos pendientes** - `WHERE status = 'pending'`

#### Métricas de Engagement:
- ✅ **Total de vistas** - `SUM(views_count)`
- ✅ **Total de favoritos** - `SUM(favorites_count)` o `SUM(favorite_count)`
- ✅ **Promedio de vistas por vehículo** - `AVG(views_count)`
- ✅ **Tasa de conversión** - `(vendidos / total) * 100`

#### Métricas Financieras:
- ✅ **Inventario total en valor** - `SUM(price) WHERE status = 'available'`
- ✅ **Ingresos del mes** - `SUM(price) WHERE status = 'sold' AND updated_at >= CURRENT_MONTH`
- ✅ **Precio promedio** - `AVG(price)`
- ✅ **Vehículo más caro** - `MAX(price)`
- ✅ **Vehículo más barato** - `MIN(price)`

#### Top Rankings:
- ✅ **Vehículos más vistos** - `ORDER BY views_count DESC LIMIT 5`
- ✅ **Vehículos más favoritos** - `ORDER BY favorites_count DESC LIMIT 5`
- ✅ **Vehículos recientes** - `ORDER BY created_at DESC`

#### Análisis por Categorías:
- ✅ **Por tipo de combustible** - `GROUP BY fuel_type`
- ✅ **Por transmisión** - `GROUP BY transmission`
- ✅ **Por tipo de carrocería** - `GROUP BY body_type`
- ✅ **Por año** - `GROUP BY year`
- ✅ **Por marca/modelo** - `GROUP BY make, model`
- ✅ **Por ubicación** - `GROUP BY location_city, location_state`

---

### 👥 **Métricas de Equipo** (tabla: `users` + `user_profiles`)

#### Rendimiento Individual:
- ✅ **Vehículos por vendedor** - `COUNT(*) FROM vehicles WHERE seller_id = user_id`
- ✅ **Ventas por vendedor** - `COUNT(*) WHERE status = 'sold' AND seller_id = user_id`
- ✅ **Ingresos por vendedor** - `SUM(price) WHERE status = 'sold' AND seller_id = user_id`
- ✅ **Rating del vendedor** - `rating FROM user_profiles`
- ✅ **Número de calificaciones** - `rating_count FROM user_profiles`

#### Estadísticas del Equipo:
- ✅ **Total de vendedores activos** - `COUNT(*) WHERE user_type = 'seller' AND status = 'active'`
- ✅ **Total de dealers** - `COUNT(*) WHERE user_type = 'dealer'`
- ✅ **Usuarios por rol** - `GROUP BY role`
- ✅ **Usuarios por sucursal** - `GROUP BY branch_id`

---

### 🏢 **Métricas de Sucursales** (tabla: `branches`)

#### Por Sucursal:
- ✅ **Vehículos por sucursal** - `COUNT(*) FROM vehicles WHERE branch_id = X`
- ✅ **Ventas por sucursal** - `COUNT(*) WHERE status = 'sold' AND branch_id = X`
- ✅ **Personal por sucursal** - `COUNT(*) FROM users WHERE branch_id = X`
- ✅ **Leads por sucursal** - `COUNT(*) FROM leads WHERE branch_id = X`

#### Comparativas:
- ✅ **Top sucursales por ventas**
- ✅ **Top sucursales por inventario**
- ✅ **Sucursales por región/ciudad**

---

### 📞 **Métricas de Leads** (tabla: `leads`)

#### Estadísticas de Contactos:
- ✅ **Total de leads** - `COUNT(*)`
- ✅ **Leads nuevos** - `WHERE status = 'new'`
- ✅ **Leads contactados** - `WHERE status = 'contacted'`
- ✅ **Leads calificados** - `WHERE status = 'qualified'`
- ✅ **Leads perdidos** - `WHERE status = 'lost'`
- ✅ **Leads convertidos en venta** - `WHERE status = 'sold'`

#### Tasa de Conversión:
- ✅ **Tasa de conversión de leads** - `(sold / total) * 100`
- ✅ **Tiempo promedio de respuesta**
- ✅ **Leads por prioridad** - `GROUP BY priority`

#### Por Fuente:
- ✅ **Leads por origen** - `GROUP BY source`
- ✅ **Conversión por fuente** - `GROUP BY source, status`

---

### ❤️ **Métricas de Favoritos** (tabla: `favorites` o `user_favorites`)

#### Engagement:
- ✅ **Total de favoritos** - `COUNT(*)`
- ✅ **Vehículos favoritos únicos** - `COUNT(DISTINCT vehicle_id)`
- ✅ **Usuarios que guardaron favoritos** - `COUNT(DISTINCT user_id)`
- ✅ **Promedio de favoritos por usuario** - `AVG(favorites per user)`
- ✅ **Tasa de conversión favoritos→venta**

---

### 💬 **Métricas de Comunicación** (tabla: `messages`)

#### Interacciones:
- ✅ **Total de mensajes** - `COUNT(*)`
- ✅ **Mensajes por lead** - `GROUP BY lead_id`
- ✅ **Mensajes no leídos** - `WHERE is_read = false`
- ✅ **Tiempo de respuesta promedio**

---

### 🏆 **Métricas de Dealers** (tabla: `dealer_profiles`)

#### Información del Dealer:
- ✅ **Dealers verificados** - `WHERE verified_at IS NOT NULL`
- ✅ **Información de empresa** - `company_name, description, website`
- ✅ **Ubicación del dealer** - `city, state, postal_code`

---

## 📈 **Tendencias y Análisis Temporal**

### Análisis Mensual:
```sql
-- Ventas por mes (últimos 6 meses)
SELECT 
  DATE_TRUNC('month', updated_at) as month,
  COUNT(*) as sales_count,
  SUM(price) as revenue
FROM vehicles
WHERE status = 'sold' 
  AND updated_at >= NOW() - INTERVAL '6 months'
GROUP BY DATE_TRUNC('month', updated_at)
ORDER BY month DESC;
```

### Análisis Semanal:
```sql
-- Nuevos vehículos por semana
SELECT 
  DATE_TRUNC('week', created_at) as week,
  COUNT(*) as new_vehicles
FROM vehicles
WHERE created_at >= NOW() - INTERVAL '3 months'
GROUP BY DATE_TRUNC('week', created_at)
ORDER BY week DESC;
```

### Comparación Año contra Año:
```sql
-- Ventas año actual vs año anterior
SELECT 
  EXTRACT(MONTH FROM updated_at) as month,
  EXTRACT(YEAR FROM updated_at) as year,
  COUNT(*) as sales,
  SUM(price) as revenue
FROM vehicles
WHERE status = 'sold'
GROUP BY EXTRACT(YEAR FROM updated_at), EXTRACT(MONTH FROM updated_at)
ORDER BY year, month;
```

---

## 🎯 **KPIs Sugeridos para Dashboards**

### Dashboard Corporativo:
1. **Ingresos totales del mes**
2. **Total de ventas completadas**
3. **Inventario activo (cantidad y valor)**
4. **Tasa de conversión general**
5. **Top 5 sucursales por ventas**
6. **Top 5 vendedores por ingresos**
7. **Leads pendientes de atención**
8. **Tendencia de ventas (6 meses)**

### Dashboard de Dealer/Concesionario:
1. **Vehículos activos vs vendidos**
2. **Ingresos del mes actual**
3. **Tasa de conversión**
4. **Vistas y favoritos totales**
5. **Top 5 vehículos más populares**
6. **Rendimiento del equipo de ventas**
7. **Leads nuevos y en proceso**
8. **Inventario por categoría**

### Dashboard de Vendedor:
1. **Mis vehículos activos**
2. **Mis ventas del mes**
3. **Mis ingresos generados**
4. **Mis leads asignados**
5. **Vistas en mis vehículos**
6. **Favoritos en mis vehículos**
7. **Mi rating y calificaciones**
8. **Comparación con otros vendedores**

---

## 🔧 **Implementación en el Dashboard Service**

Ya implementamos en `dashboardService.ts`:
- ✅ `getDashboardStats()` - Estadísticas generales
- ✅ `getVehiclesWithStats()` - Vehículos con métricas
- ✅ `getTopVehicles()` - Vehículos más populares
- ✅ `getTeamStats()` - Rendimiento del equipo
- ✅ `getSalesTrends()` - Tendencias de ventas por mes
- ✅ `getLeads()` - Leads/contactos

### Próximas funciones a agregar:
- ⏳ `getBranchStats()` - Estadísticas por sucursal
- ⏳ `getConversionRate()` - Tasas de conversión detalladas
- ⏳ `getRevenueAnalysis()` - Análisis financiero profundo
- ⏳ `getInventoryByCategory()` - Inventario por categoría
- ⏳ `getLeadsFunnel()` - Embudo de conversión de leads

---

¡Tu base de datos tiene toda la información necesaria para dashboards completos y detallados! 🎉
