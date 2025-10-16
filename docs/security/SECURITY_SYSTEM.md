# Sistema de Seguridad y Auditoría - AutoMarket MultiTenant

## 📋 Resumen de Implementación

Este documento describe el sistema completo de seguridad y auditoría implementado para la plataforma AutoMarket MultiTenant, cumpliendo con los requisitos de "5. Políticas de seguridad" solicitados.

## 🔐 Componentes Implementados

### 1. Sistema de Roles y Permisos (`/src/lib/permissions.ts`)

**Roles Implementados:**
- `SUPER_ADMIN`: Control total del sistema
- `CORPORATE_ADMIN`: Administrador corporativo del tenant
- `BRANCH_MANAGER`: Gerente de sucursal
- `SALES_MANAGER`: Gerente de ventas
- `SALESPERSON`: Vendedor/a
- `DEALER`: Concesionario/distribuidor
- `INDEPENDENT_SELLER`: Vendedor independiente
- `CUSTOMER`: Cliente regular
- `PREMIUM_CUSTOMER`: Cliente premium
- `SUPPORT_AGENT`: Agente de soporte
- `VIEWER`: Solo lectura

**Permisos Granulares (32 permisos):**
- Gestión de empleados (contratar/despedir/editar)
- Gestión de vehículos (crear/editar/eliminar)
- Gestión de leads y ventas
- Reportes financieros
- Gestión de sucursales
- Configuración del sistema
- Logs de auditoría
- Perfiles de usuario

### 2. Servicio de Autenticación Mejorado (`/src/services/authService.ts`)

**Características de Seguridad:**
- ✅ Validación de email y contraseñas robustas
- ✅ Gestión de sesiones con timeout automático
- ✅ Seguimiento de actividad del usuario
- ✅ Integración con sistema de auditoría
- ✅ Limpieza automática de datos locales
- ✅ Verificación periódica de validez de sesión

**Funcionalidades:**
- Login con validaciones de seguridad
- Registro con verificación de contraseña
- Logout con registro de eventos
- Obtención de perfil completo del usuario
- Gestión de sesiones persistentes

### 3. Sistema de Auditoría Completo (`/src/services/auditService.ts`)

**Eventos Auditados (25 tipos):**
- **Autenticación**: Login, logout, intentos fallidos
- **Gestión de usuarios**: Creación, actualización, eliminación, cambios de rol
- **Gestión de empleados**: Contratación, despido, promociones
- **Gestión de vehículos**: Creación, actualización, eliminación, cambios de precio
- **Seguridad**: Accesos no autorizados, violaciones, actividad sospechosa
- **Datos**: Exportaciones, importaciones, eliminaciones masivas

**Información Registrada:**
- Usuario y email del actor
- Rol y tenant del usuario
- Tipo de evento y recurso afectado
- Descripción detallada de la acción
- IP y user agent
- Metadatos adicionales
- Timestamp preciso

### 4. Hooks de React para Permisos (`/src/hooks/usePermissions.ts`)

**Funcionalidades:**
- `hasPermission()`: Verificar permisos específicos
- `canManageUser()`: Verificar gestión de usuarios
- `isAdmin()`: Verificar roles administrativos
- `canDeleteVehicle()`: Verificar eliminación de vehículos
- `useActionValidation()`: Validación de acciones específicas

### 5. Componentes de Seguridad (`/src/components/security/PermissionGuards.tsx`)

**Guards Implementados:**
- `PermissionGuard`: Protección basada en permisos específicos
- `AdminGuard`: Solo administradores
- `ManagerGuard`: Gerentes y superiores
- `SellerGuard`: Vendedores y superiores
- `ConditionalAction`: Acciones condicionales
- `UnauthorizedMessage`: Mensajes de acceso denegado

### 6. Sistema de Auditoría con Hooks (`/src/hooks/useAudit.ts`)

**Funcionalidades:**
- `useAuditLogs()`: Gestión y consulta de logs
- `useAuditLogger()`: Registro fácil de eventos
- Filtrado por tipo de evento, recurso, fechas
- Estadísticas de eventos críticos
- Detección automática de eventos importantes

### 7. Interfaz de Logs de Auditoría (`/src/components/admin/AuditLogs.tsx`)

**Características:**
- ✅ Visualización completa de logs de auditoría
- ✅ Filtros avanzados por evento, recurso, fecha, usuario
- ✅ Búsqueda en tiempo real
- ✅ Destacado de eventos críticos
- ✅ Estadísticas en tiempo real
- ✅ Exportación de datos
- ✅ Interfaz responsive
- ✅ Protección por permisos

### 8. Base de Datos de Auditoría (`/db/init.sql`)

**Tabla `audit_logs`:**
```sql
CREATE TABLE audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  user_email text,
  user_role text,
  tenant_id text NOT NULL,
  event_type text NOT NULL,
  resource_type text NOT NULL,
  resource_id text,
  action text NOT NULL,
  description text NOT NULL,
  ip_address text,
  user_agent text,
  metadata jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
```

**Índices para Rendimiento:**
- Por tenant_id
- Por user_id
- Por event_type
- Por created_at (descendente)
- Por resource_type y resource_id

## 🚀 Funcionalidades de Seguridad Implementadas

### Control de Acceso Granular
- ✅ Roles jerárquicos con herencia de permisos
- ✅ Permisos específicos por funcionalidad
- ✅ Guards de React para protección de UI
- ✅ Validación en cliente y servidor

### Auditoría Completa
- ✅ Registro automático de todas las acciones críticas
- ✅ Seguimiento de cambios en empleados (contrataciones/despidos)
- ✅ Log de accesos no autorizados
- ✅ Monitoreo de actividad sospechosa
- ✅ Rastro completo de modificaciones de datos

### Autenticación Robusta
- ✅ Validación de contraseñas seguras
- ✅ Gestión de sesiones con timeout
- ✅ Seguimiento de actividad del usuario
- ✅ Limpieza automática de datos sensibles

### Protección de Interfaz
- ✅ Componentes protegidos por permisos
- ✅ Ocultación de funcionalidades no autorizadas
- ✅ Mensajes claros de acceso denegado
- ✅ Validación en tiempo real

## 📊 Eventos Críticos Monitoreados

El sistema identifica y destaca eventos críticos que requieren atención especial:

1. **Despido de empleados** - Registro completo con razón
2. **Cambios de roles** - Quién, cuándo y por qué
3. **Accesos no autorizados** - Intentos de acceso sin permisos
4. **Violaciones de seguridad** - Actividades sospechosas
5. **Exportación de datos** - Control de información sensible
6. **Eliminaciones masivas** - Prevención de pérdida de datos

## 🎯 Casos de Uso Implementados

### Gestión de Empleados
```typescript
// Ejemplo: Despedir un empleado con auditoría completa
await auditService.logEmployeeFired(
  currentUser.id,
  currentUser.email,
  employeeId,
  employeeEmail,
  'Terminación por reestructuración',
  tenantId
);
```

### Protección de Vehículos
```jsx
// Solo vendedores pueden ver la gestión de vehículos
<SellerGuard>
  <VehicleManagement />
</SellerGuard>

// Solo quien tiene permisos puede eliminar
<PermissionGuard permission={Permission.DELETE_OWN_VEHICLES}>
  <button onClick={() => handleDelete(vehicleId)}>
    Eliminar Vehículo
  </button>
</PermissionGuard>
```

### Monitoreo de Actividad
```typescript
// Hook para mostrar logs críticos en dashboard de admin
const { logs, loadCriticalLogs } = useAuditLogs();
await loadCriticalLogs(50); // Últimos 50 eventos críticos
```

## 🔧 Configuración y Uso

### 1. Configurar Roles de Usuario
```typescript
import { UserRole, PermissionManager } from '../lib/permissions';

// Verificar si un usuario puede gestionar empleados
const canManageEmployees = PermissionManager.hasPermission(
  user.role, 
  Permission.MANAGE_EMPLOYEES
);
```

### 2. Proteger Componentes
```jsx
import { PermissionGuard } from '../components/security/PermissionGuards';

<PermissionGuard permission={Permission.VIEW_AUDIT_LOGS}>
  <AuditLogs />
</PermissionGuard>
```

### 3. Registrar Eventos de Auditoría
```typescript
import { useAuditLogger } from '../hooks/useAudit';

const { logAction } = useAuditLogger();

await logAction(
  AuditEventType.VEHICLE_DELETED,
  ResourceType.VEHICLE,
  'delete_vehicle',
  `Eliminó vehículo ${vehicleInfo}`,
  vehicleId
);
```

## 📈 Beneficios del Sistema Implementado

### Seguridad
- Control granular de acceso por roles y permisos
- Prevención de acciones no autorizadas
- Registro completo de actividades críticas
- Detección de actividad sospechosa

### Compliance y Auditoría
- Rastro completo de todas las acciones críticas
- Información detallada para auditorías
- Monitoreo de empleados y cambios organizacionales
- Protección de datos sensibles

### Experiencia de Usuario
- Interfaces adaptadas según permisos del usuario
- Mensajes claros de acceso denegado
- Funcionalidades mostradas u ocultadas dinámicamente
- Interfaz intuitiva para gestión de logs

### Mantenimiento
- Sistema modular y extensible
- Hooks reutilizables para React
- Configuración centralizada de permisos
- Fácil adición de nuevos roles y permisos

## 🚀 Próximos Pasos Sugeridos

1. **Row Level Security (RLS)** en Supabase para protección a nivel de base de datos
2. **Alertas automáticas** para eventos críticos vía email/SMS
3. **Dashboard de seguridad** con métricas en tiempo real
4. **Integración con servicios de autenticación externos** (OAuth, SAML)
5. **Políticas de retención** de logs de auditoría
6. **Backup automático** y recuperación de logs críticos

---

**✅ Estado: COMPLETO Y FUNCIONAL**
- Sistema compilado sin errores
- Todos los componentes integrados
- Base de datos configurada
- Interfaz de usuario lista para uso
- Documentación completa

El sistema de seguridad está listo para uso en producción y cumple con todos los requisitos de la política de seguridad solicitada.