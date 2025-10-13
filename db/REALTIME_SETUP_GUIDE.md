# 🔴 GUÍA: Configurar Políticas de Tiempo Real en Supabase

## 📋 **PASO 1: Crear Políticas en la Interfaz Web**

### En la sección "Realtime" > "Políticas" de Supabase:

#### **1. Política para `tenants`**
```
Nombre: realtime_tenants_policy
Tabla: tenants
Operación: SELECT
Rol: authenticated
Condición: true
```

#### **2. Política para `user_profiles`**
```
Nombre: realtime_user_profiles_policy
Tabla: user_profiles  
Operación: SELECT
Rol: authenticated
Condición: tenant_id IN (
  SELECT tenant_id 
  FROM user_profiles 
  WHERE id = auth.uid()
)
```

#### **3. Política para `branches`**
```
Nombre: realtime_branches_policy
Tabla: branches
Operación: SELECT
Rol: authenticated
Condición: tenant_id IN (
  SELECT tenant_id 
  FROM user_profiles 
  WHERE id = auth.uid()
)
```

#### **4. Política para `vehicles`**
```
Nombre: realtime_vehicles_policy
Tabla: vehicles
Operación: SELECT
Rol: authenticated
Condición: tenant_id IN (
  SELECT tenant_id 
  FROM user_profiles 
  WHERE id = auth.uid()
)
```

#### **5. Política para `leads`**
```
Nombre: realtime_leads_policy
Tabla: leads
Operación: SELECT
Rol: authenticated
Condición: tenant_id IN (
  SELECT tenant_id 
  FROM user_profiles 
  WHERE id = auth.uid()
)
AND (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() 
    AND user_type IN ('dealer') 
    AND role IN ('admin', 'manager')
  )
  OR assigned_to = auth.uid()
  OR assigned_to IS NULL
)
```

#### **6. Política para `sales`**
```
Nombre: realtime_sales_policy
Tabla: sales
Operación: SELECT
Rol: authenticated
Condición: tenant_id IN (
  SELECT tenant_id 
  FROM user_profiles 
  WHERE id = auth.uid()
)
AND (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() 
    AND user_type IN ('dealer') 
    AND role IN ('admin', 'manager')
  )
  OR salesperson_id = auth.uid()
)
```

## 📋 **PASO 2: Habilitar Tiempo Real en SQL Editor**

Ve a **SQL Editor** y ejecuta estos comandos:

```sql
-- Habilitar tiempo real para todas las tablas
ALTER PUBLICATION supabase_realtime ADD TABLE tenants;
ALTER PUBLICATION supabase_realtime ADD TABLE user_profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE branches;
ALTER PUBLICATION supabase_realtime ADD TABLE vehicles;
ALTER PUBLICATION supabase_realtime ADD TABLE leads;
ALTER PUBLICATION supabase_realtime ADD TABLE lead_activities;
ALTER PUBLICATION supabase_realtime ADD TABLE sales;
ALTER PUBLICATION supabase_realtime ADD TABLE vehicle_images;
```

## 🔧 **PASO 3: Verificar Configuración**

1. **Ir a Realtime > Inspector**
2. **Verificar que aparezcan las tablas habilitadas**
3. **Probar suscripciones desde la aplicación**

## ⚡ **PASO 4: Implementar en React (opcional)**

Ejemplo de uso en componente React:

```typescript
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export const RealtimeExample = () => {
  const [vehicles, setVehicles] = useState([])

  useEffect(() => {
    // Suscripción a cambios en vehicles
    const subscription = supabase
      .channel('vehicles-changes')
      .on(
        'postgres_changes',
        {
          event: '*', // INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'vehicles'
        },
        (payload) => {
          console.log('Cambio detectado:', payload)
          // Actualizar estado local
          loadVehicles()
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const loadVehicles = async () => {
    const { data } = await supabase
      .from('vehicles')
      .select('*')
    setVehicles(data || [])
  }

  return <div>Vehículos en tiempo real: {vehicles.length}</div>
}
```

## 🚨 **IMPORTANTE**

- ✅ **Seguridad**: Las políticas aseguran que cada usuario solo ve datos de su tenant
- ✅ **Roles**: Administradores ven todo, vendedores solo sus asignaciones
- ✅ **Rendimiento**: Las políticas están optimizadas para evitar consultas lentas
- ✅ **Escalabilidad**: Preparado para múltiples tenants simultáneos

## 🔍 **Troubleshooting**

### Si no funcionan las suscripciones:
1. **Verificar que RLS esté habilitado** en las tablas
2. **Comprobar que las políticas estén activas**
3. **Verificar que el usuario esté autenticado**
4. **Revisar logs en Supabase Dashboard**

### Error común:
```
Error: insufficient_privilege
```
**Solución**: Verificar que la política permite SELECT para el usuario actual

## 📊 **Monitoreo**

Puedes monitorear las suscripciones en:
- **Realtime > Inspector**: Ver conexiones activas
- **Logs**: Ver errores de tiempo real
- **API > Logs**: Ver consultas SQL generadas