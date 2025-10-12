# 🔒 RLS Policies Enhanced - AutoMarket Multitenant

## 📋 Resumen Ejecutivo

Este documento describe las **Row Level Security (RLS) Policies mejoradas** implementadas para el proyecto AutoMarket Multitenant. Las políticas solucionan el problema crítico donde **los compradores no podían ver vehículos** porque tenían `tenant_id = NULL`, mientras mantienen el aislamiento de datos por tenant para vendedores y administradores.

## 🎯 Problemas Solucionados

### ❌ Problema Original
- **Compradores**: No podían ver ningún vehículo (tenant_id = NULL)
- **Multitenancy**: Funcionaba para vendedores pero bloqueaba compradores
- **Inconsistencias**: Políticas muy restrictivas para casos de uso legítimos

### ✅ Solución Implementada
- **Compradores**: Ven TODOS los vehículos disponibles (sin restricción de tenant)
- **Vendedores/Admins**: Ven solo datos de su tenant (multitenancy preservado)
- **Flexibilidad**: Permisos adaptativos según el rol del usuario

## 🏗️ Arquitectura de las RLS

### Funciones Helper Principales

```sql
-- Obtiene tenant_id del usuario actual
get_current_user_tenant_id() → UUID | NULL

-- Verifica si es comprador
is_current_user_buyer() → BOOLEAN

-- Verifica si tiene tenant asignado  
user_has_tenant() → BOOLEAN

-- Verifica acceso a tenant específico
can_access_tenant(target_tenant_id UUID) → BOOLEAN
```

### Matriz de Permisos por Tabla

| Tabla | Compradores | Vendedores | Branch Managers | Corporate Admins |
|-------|-------------|------------|-----------------|------------------|
| **vehicles** | ✅ Todos disponibles | 🏢 Solo su tenant | 🏢 Solo su tenant | 🏢 Solo su tenant |
| **vehicle_images** | ✅ De vehículos disponibles | 🏢 Solo su tenant | 🏢 Solo su tenant | 🏢 Solo su tenant |
| **user_profiles** | ✅ De vendedores activos | 🏢 Solo su tenant | 🏢 Solo su tenant | 🏢 Solo su tenant |
| **branches** | ✅ Con vehículos disponibles | 🏢 Solo su tenant | 🏢 Solo su tenant | 🏢 Gestión completa |
| **leads** | ✅ Crear nuevos | 👤 Asignados a él | 🏪 De su sucursal | 🏢 Todos del tenant |
| **favorites** | ✅ Gestionar propios | 👤 Gestionar propios | 👤 Gestionar propios | 👤 Gestionar propios |

**Leyenda:**
- ✅ Acceso amplio
- 🏢 Restringido por tenant  
- 👤 Solo registros propios
- 🏪 Restringido por sucursal

## 🧪 Testing y Validación

### Tests Implementados
Para validar las RLS policies, ejecuta:
```sql
-- Ver archivo: database/RLS_TESTING.sql
-- Incluye tests para todos los roles y escenarios
```

### Usuarios de Prueba
- **comprador1@email.com** - Comprador (sin tenant)
- **admin.toyota@toyotacentro.cl** - Admin corporativo Toyota
- **vendedor1.lascondes@toyotacentro.cl** - Vendedor Toyota Las Condes
- **gerente.lascondes@toyotacentro.cl** - Gerente sucursal

### Resultados Esperados
- ✅ Compradores: Ven ~19 vehículos disponibles de todos los tenants
- ✅ Admin Toyota: Ve solo 5 vehículos de Toyota Centro
- ✅ Admin Premium: Ve solo 5 vehículos de Premium Motors  
- ✅ Vendedores: Ven solo vehículos de su tenant

## 🚨 Troubleshooting

### Problema: "Compradores no ven vehículos"
**Verificar:**
```sql
-- 1. Policy activa
SELECT * FROM pg_policies WHERE policyname = 'buyers_can_view_available_vehicles';

-- 2. Usuario es comprador
SELECT role FROM users WHERE email = 'comprador1@email.com';

-- 3. Hay vehículos disponibles
SELECT COUNT(*) FROM vehicles WHERE status = 'available';
```

### Problema: "Vendedores ven otros tenants"
**Verificar:**
```sql
-- 1. Tenant del usuario
SELECT email, tenant_id FROM users WHERE email = 'vendedor1@email.com';

-- 2. Función helper existe
SELECT proname FROM pg_proc WHERE proname = 'get_current_user_tenant_id';
```

## 📚 Archivos Relacionados

- `database/RLS_POLICIES_IMPROVED.sql` - Políticas implementadas
- `database/RLS_DEPLOYMENT.sql` - Script de despliegue seguro  
- `database/RLS_TESTING.sql` - Suite de tests
- `PROXIMOS_PASOS.md` - Roadmap del proyecto

## 🔄 Próximos Pasos

- [x] Implementar RLS policies mejoradas
- [x] Crear funciones helper  
- [x] Documentar matriz de permisos
- [x] Crear suite de tests
- [ ] **Aplicar policies en producción**
- [ ] **Probar con usuarios reales**
- [ ] **Monitorear performance**

---

*Documentación actualizada: $(date)*
*Próxima revisión: Después del despliegue en producción*
- 🏪 Restringido por sucursal  
- 👤 Solo datos propios

## 📁 Archivos Creados

### 1. `RLS_POLICIES_ENHANCED.sql`
**Propósito**: Contiene todas las políticas RLS mejoradas  
**Contenido**:
- Funciones helper para verificación de permisos
- Políticas adaptativas por tabla
- Comentarios explicativos detallados
- Casos de uso cubiertos

### 2. `APPLY_RLS_ENHANCED.sql`  
**Propósito**: Script de aplicación segura  
**Contenido**:
- Pasos de verificación pre-aplicación
- Aplicación controlada de políticas
- Tests de verificación post-aplicación
- Script de rollback en caso de emergencia

### 3. `TEST_RLS_POLICIES.sql`
**Propósito**: Suite completa de tests  
**Contenido**:
- Tests por usuario específico
- Verificación de métricas de dashboard
- Tests de funcionalidades (favoritos, leads)
- Resultados esperados documentados

## 🚀 Guía de Implementación

### Paso 1: Backup de Seguridad
```sql
-- Crear backup de políticas actuales
SELECT * FROM pg_policies WHERE schemaname = 'public';
```

### Paso 2: Aplicar Políticas Enhanced
1. Abrir Supabase SQL Editor
2. Ejecutar `RLS_POLICIES_ENHANCED.sql` completo
3. Verificar que no hay errores

### Paso 3: Verificar Aplicación
```sql
-- Ejecutar verificaciones de APPLY_RLS_ENHANCED.sql
SELECT COUNT(*) FROM pg_policies WHERE policyname LIKE 'Enhanced_%';
```

### Paso 4: Testing Completo
Ejecutar tests de `TEST_RLS_POLICIES.sql` con cada tipo de usuario:
- **Comprador**: `comprador1@email.com`
- **Admin Toyota**: `admin.toyota@toyotacentro.cl`
- **Admin Premium**: `admin.premium@premiummotors.cl`

## 📊 Casos de Uso Validados

### Caso 1: Comprador Explorando Catálogo
```
Usuario: comprador1@email.com (tenant_id = NULL)
Resultado: Ve 19 vehículos disponibles de todos los tenants
Acceso: Perfiles de vendedores, imágenes, sucursales relacionadas
```

### Caso 2: Admin Toyota Gestionando Inventario
```
Usuario: admin.toyota@toyotacentro.cl 
Resultado: Ve solo 5 vehículos de Toyota Centro
Acceso: Dashboard corporativo, métricas del tenant, gestión de usuarios
```

### Caso 3: Vendedor Creando Lead
```
Usuario: vendedor1.lascondes@toyotacentro.cl
Resultado: Ve vehículos de Toyota, puede crear/gestionar leads asignados
Acceso: Dashboard personal, métricas de ventas propias
```

### Caso 4: Comprador Agregando a Favoritos
```
Flujo: Comprador ve vehículo → Lo agrega a favoritos
Resultado: Favorito creado exitosamente para vehículo disponible
Restricción: No puede agregar vehículos no disponibles
```

## 🔧 Troubleshooting

### Error: "Usuario no puede ver vehículos"
**Síntomas**: COUNT(*) FROM vehicles = 0  
**Causas posibles**:
- RLS no aplicadas correctamente
- Usuario sin sesión autenticada  
- Funciones helper no accesibles

**Solución**:
```sql
-- Verificar autenticación
SELECT auth.uid();

-- Verificar funciones
SELECT get_current_user_tenant_id(), is_current_user_buyer();

-- Verificar políticas activas
SELECT * FROM pg_policies WHERE tablename = 'vehicles';
```

### Error: "Dashboard sin datos"
**Síntomas**: Métricas en cero para admin de tenant  
**Causas posibles**:
- Usuario logueado como comprador en dashboard de admin
- Datos de seed no cargados correctamente

**Solución**:
```sql
-- Verificar rol del usuario
SELECT role, tenant_id FROM users WHERE id = auth.uid();

-- Verificar datos por tenant
SELECT tenant_id, COUNT(*) FROM vehicles GROUP BY tenant_id;
```

### Error: "No puede crear lead"
**Síntomas**: INSERT en leads falla  
**Causas posibles**:
- Vehicle_id no accesible al usuario
- Branch_id o tenant_id inconsistentes

**Solución**:
```sql
-- Verificar acceso al vehículo
SELECT id FROM vehicles WHERE id = 'vehicle_uuid_here';

-- Verificar datos del vehículo
SELECT tenant_id, branch_id, status FROM vehicles WHERE id = 'vehicle_uuid_here';
```

## 📈 Impacto en Performance

### Índices Recomendados
Las políticas RLS utilizan estos campos frecuentemente:
```sql
-- Índices existentes optimizados
CREATE INDEX IF NOT EXISTS idx_users_tenant_branch ON users(tenant_id, branch_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_vehicles_status ON vehicles(status);
CREATE INDEX IF NOT EXISTS idx_vehicles_tenant_status ON vehicles(tenant_id, status);
```

### Funciones con SECURITY DEFINER
Las funciones helper usan `SECURITY DEFINER` para evitar múltiples consultas:
- `get_current_user_tenant_id()`: Cache interno del tenant
- `is_current_user_buyer()`: Verificación de rol optimizada

## 🛡️ Consideraciones de Seguridad

### Principios Aplicados
1. **Least Privilege**: Usuarios solo ven lo mínimo necesario
2. **Defense in Depth**: Múltiples verificaciones por política  
3. **Fail Secure**: Por defecto, acceso negado
4. **Auditability**: Todas las políticas están documentadas

### Vectores de Seguridad Cubiertos
- ✅ **Tenant Isolation**: Vendedores no ven datos de otros tenants
- ✅ **Data Leakage Prevention**: Compradores solo ven datos públicos  
- ✅ **Privilege Escalation**: Roles verificados en cada operación
- ✅ **Cross-Tenant Access**: Bloqueado para usuarios con tenant

## 🔄 Mantenimiento y Actualizaciones

### Agregar Nueva Tabla
1. Crear tabla con RLS habilitado
2. Crear políticas siguiendo el patrón Enhanced_*
3. Agregar funciones helper si es necesario
4. Crear tests específicos
5. Documentar casos de uso

### Modificar Políticas Existentes
1. Crear backup de política actual
2. DROP la política existente
3. CREATE nueva política con nombre Enhanced_*
4. Ejecutar tests de regresión
5. Actualizar documentación

### Monitoring RLS
```sql
-- Ver políticas activas
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public' 
ORDER BY tablename;

-- Verificar performance de queries con RLS
EXPLAIN (ANALYZE, BUFFERS) SELECT * FROM vehicles;
```

## 📞 Contacto y Soporte

Para dudas sobre implementación RLS:
1. Revisar este documento completo
2. Ejecutar tests en `TEST_RLS_POLICIES.sql`
3. Verificar logs de Supabase para errores específicos
4. Consultar documentación oficial de PostgreSQL RLS

---

**Última actualización**: 9 de octubre de 2025  
**Versión**: 1.0 Enhanced  
**Estado**: ✅ Listo para producción