# 📊 Resumen de Métricas Disponibles - Dashboard Corporativo

## 🎯 KPIs Principales (Ya Implementados)

### 1. **Inventario Total** 🚗
- **Métrica:** Total de vehículos en el sistema
- **Fuente:** `vehicles` table
- **Cálculo:** `COUNT(*) FROM vehicles`
- **Desglose:**
  - Vehículos activos (`status = 'available'`)
  - Vehículos vendidos (`status = 'sold'`)
  - Vehículos reservados (`status = 'reserved'`)
  - % de disponibilidad

### 2. **Ingresos del Mes** 💰
- **Métrica:** Suma de precios de vehículos vendidos en el mes actual
- **Fuente:** `vehicles` table
- **Cálculo:** `SUM(price) WHERE status = 'sold' AND MONTH(updated_at) = CURRENT_MONTH`
- **Formato:** CLP (Peso Chileno)
- **Incluye:** Comparación con mes anterior (+12%)

### 3. **Tasa de Conversión** 📊
- **Métrica:** Porcentaje de vehículos vendidos vs inventario total
- **Fuente:** `vehicles` table
- **Cálculo:** `(soldVehicles / totalVehicles) * 100`
- **Meta:** 25%
- **Uso:** Medir efectividad de ventas

### 4. **Engagement Total** 👁️
- **Métricas:**
  - Total de vistas (`SUM(views_count)`)
  - Total de favoritos (`SUM(favorites_count)`)
- **Fuente:** `vehicles` table
- **Uso:** Medir interés del público en el inventario

---

## 📈 Métricas Detalladas

### **Top 5 Vehículos Más Populares** 🔥
- **Ordenamiento:** Por número de vistas (views_count DESC)
- **Datos mostrados:**
  - Ranking con medallas (🥇🥈🥉)
  - Marca/Modelo/Año
  - Precio en CLP
  - Vistas totales
  - Favoritos
  - Estado (Disponible/Vendido/Reservado)
- **Fuente:** `vehicles` table, filtrado por `status = 'active'`

### **Métricas Rápidas** ⚡
1. **Inventario Activo:** Cantidad de vehículos actualmente en venta
2. **Valor Total Inventario:** Suma de precios de todos los vehículos activos
3. **Precio Promedio:** `AVG(price)` del inventario
4. **Equipo de Ventas:** Cantidad de vendedores registrados

---

## 📊 Tendencias de Ventas (6 meses)

### **Gráfico de Barras Interactivo**
- **Periodo:** Últimos 6 meses
- **Métricas por mes:**
  - Cantidad de ventas
  - Ingresos totales (CLP)
- **Cálculo:** 
  ```sql
  SELECT 
    DATE_TRUNC('month', updated_at) as month,
    COUNT(*) as sales,
    SUM(price) as revenue
  FROM vehicles
  WHERE status = 'sold' 
    AND updated_at >= NOW() - INTERVAL '6 months'
  GROUP BY month
  ORDER BY month DESC
  ```

### **Resumen de Tendencias:**
- Ventas totales (6 meses)
- Ingresos totales (6 meses)
- Promedio mensual de ventas

---

## 👥 Equipo de Ventas Nacional

### **Métricas por Vendedor:**
1. **Nombre y Email**
2. **Rol:** Corporate Admin / Gerente Sucursal / Vendedor
3. **Vehículos Publicados:** Total de vehículos asignados
4. **Ventas Completadas:** Vehículos vendidos por el vendedor
5. **Ingresos Generados:** Suma de precios de vehículos vendidos

### **Rankings:**
- Top 3 vendedores con medallas (🥇🥈🥉)
- Colores especiales para destacar a los mejores

### **Cálculo:**
```sql
-- Por cada usuario
SELECT 
  u.id,
  CONCAT(up.first_name, ' ', up.last_name) as full_name,
  u.email,
  u.role,
  COUNT(v.id) as vehicles_count,
  COUNT(CASE WHEN v.status = 'sold' THEN 1 END) as sales_count,
  SUM(CASE WHEN v.status = 'sold' THEN v.price ELSE 0 END) as total_revenue
FROM users u
LEFT JOIN user_profiles up ON u.id = up.user_id
LEFT JOIN vehicles v ON u.id = v.seller_id
GROUP BY u.id, up.first_name, up.last_name, u.email, u.role
ORDER BY total_revenue DESC
```

---

## 🏢 Módulo de Sucursales (Próximamente)

### **Métricas Planeadas:**
- Lista de todas las sucursales
- Vehículos por sucursal
- Ventas por sucursal
- Personal asignado
- Leads por sucursal
- Comparación entre sucursales
- Mapas de distribución regional

### **Requisitos:**
- Tabla `branches` con datos poblados
- Relaciones `vehicles.branch_id` → `branches.id`
- Relaciones `users.branch_id` → `branches.id`
- Relaciones `leads.branch_id` → `branches.id`

---

## 📱 Datos en Tiempo Real

### **Fuente de Datos:**
- **Supabase PostgreSQL** con Row Level Security (RLS)
- **Hook:** `useCorporateDashboard()` de `useDashboardData.ts`
- **Servicio:** `dashboardService.ts`

### **Actualización:**
- Botón "🔄 Actualizar" para refrescar manualmente
- Carga automática al cambiar de usuario
- Loading states con animaciones

---

## 🎨 Diseño Visual

### **Paleta de Colores:**
1. **Morado (Inventario):** `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`
2. **Rosa (Ingresos):** `linear-gradient(135deg, #f093fb 0%, #f5576c 100%)`
3. **Azul (Conversión):** `linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)`
4. **Amarillo (Engagement):** `linear-gradient(135deg, #fa709a 0%, #fee140 100%)`

### **Características:**
- ✅ Gradientes modernos
- ✅ Sombras suaves
- ✅ Iconos grandes en background
- ✅ Animaciones hover
- ✅ Responsive design
- ✅ Tabs de navegación
- ✅ Botón de actualización

---

## 🔢 Formato de Números

### **Moneda:**
```javascript
new Intl.NumberFormat('es-CL', {
  style: 'currency',
  currency: 'CLP',
  minimumFractionDigits: 0
}).format(amount)
```
**Resultado:** $12.500.000 (sin decimales)

### **Números:**
```javascript
number.toLocaleString()
```
**Resultado:** 1.247 (con separadores de miles)

### **Porcentajes:**
```javascript
percentage.toFixed(1) + '%'
```
**Resultado:** 25.5%

---

## 📊 Resumen de Implementación

### **✅ Implementado:**
- Dashboard responsivo con 4 tabs
- KPIs principales con datos reales
- Top 5 vehículos más populares
- Métricas rápidas
- Tendencias de ventas (6 meses con gráfico)
- Equipo de ventas con rankings
- Loading states
- Botón de actualización
- Diseño moderno con gradientes

### **⏳ Pendiente:**
- Módulo de sucursales (requiere datos en DB)
- Gráficos avanzados con librería (Recharts)
- Filtros por fecha
- Exportación a PDF/Excel
- Notificaciones en tiempo real
- Comparación año contra año

---

## 🚀 Cómo Agregar Datos de Prueba

Para ver el dashboard con métricas reales, ejecuta este SQL en Supabase:

```sql
-- 1. Crear un tenant
INSERT INTO tenants (id, name, slug, country_code, currency)
VALUES (
  'tenant-chile-1',
  'AutoMarket Chile',
  'chile',
  'CHL',
  'CLP'
) ON CONFLICT DO NOTHING;

-- 2. Crear usuarios de prueba (requiere autenticación de Supabase)
-- Se hace desde el Auth dashboard de Supabase

-- 3. Insertar vehículos de prueba
INSERT INTO vehicles (
  tenant_id, seller_id, make, model, year, price, mileage,
  fuel_type, transmission, body_type, color, status,
  views_count, favorites_count
) VALUES
  ('tenant-chile-1', '[USER_ID]', 'Toyota', 'Corolla', 2023, 18500000, 12000, 'gasoline', 'automatic', 'sedan', 'Blanco', 'available', 450, 78),
  ('tenant-chile-1', '[USER_ID]', 'Honda', 'Civic', 2022, 21900000, 25000, 'gasoline', 'manual', 'sedan', 'Negro', 'available', 380, 62),
  ('tenant-chile-1', '[USER_ID]', 'Nissan', 'Sentra', 2023, 16500000, 8000, 'gasoline', 'automatic', 'sedan', 'Gris', 'sold', 295, 45),
  ('tenant-chile-1', '[USER_ID]', 'Mazda', 'CX-5', 2024, 32000000, 5000, 'gasoline', 'automatic', 'suv', 'Rojo', 'available', 520, 95),
  ('tenant-chile-1', '[USER_ID]', 'Chevrolet', 'Tracker', 2023, 24500000, 15000, 'gasoline', 'automatic', 'suv', 'Azul', 'sold', 310, 58);
```

---

**📝 Nota:** Este dashboard consume datos reales de Supabase. Sin datos en la base de datos, las métricas mostrarán valores en 0.
