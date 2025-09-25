# AutoMarket API — Sistema Multi-tenant con 4 Tipos de Usuario

## Arquitectura del Sistema

Este API implementa un sistema multi-tenant para AutoMarket con **4 tipos de usuarios diferenciados**:

### Tipos de Usuario y Restricciones de Acceso

1. **Automotora Admin** (`automotora_admin`)
   - Administrador de UNA SOLA concesionaria/automotora
   - **AISLAMIENTO**: Solo puede ver/gestionar SU propia automotora
   - **NO PUEDE** acceder a otras automotoras (tenant isolation)
   - Ejemplo: Roberto García solo ve vehículos de Toyota Centro

2. **Vendedor Automotora** (`vendedor_automotora`) 
   - Empleado/vendedor de UNA automotora específica
   - **AISLAMIENTO**: Solo puede gestionar vehículos de SU automotora
   - Opera dentro del tenant de su automotora asignada
   - Ejemplo: Ana López solo maneja vehículos de Toyota Centro

3. **Vendedor Particular** (`vendedor_particular`)
   - Vendedor independiente con tenant individual
   - **AISLAMIENTO**: Solo puede ver/gestionar SUS PROPIOS vehículos
   - Cada vendedor particular = 1 tenant individual
   - Ejemplo: María González solo ve sus Nissan Sentra y Ford Focus

4. **Comprador** (`comprador`)
   - Usuario con acceso **consultivo** a TODOS los tenants
   - **PERMISOS**: Solo lectura (GET), NO puede crear/editar/eliminar
   - Puede contactar vendedores pero sin permisos administrativos

## Endpoints principales (planificado):
- `POST /auth/login`
- `GET /{tenantId}/productos`
- `GET /{tenantId}/vehiculos`
- `POST /{tenantId}/productos` (solo admin/vendedor)
- `POST /{tenantId}/vehiculos` (solo admin/vendedor)
- `PUT /{tenantId}/productos/{id}` (solo admin/vendedor)
- `PUT /{tenantId}/vehiculos/{id}` (solo admin/vendedor)
- `DELETE /{tenantId}/productos/{id}` (solo admin)
- `DELETE /{tenantId}/vehiculos/{id}` (solo admin)

**Nota:** toda consulta debe filtrar por `tenant_id` y respetar permisos por rol.

## Ejemplos de consultas con scoping por tenant:

```sql
-- Productos por tenant
SELECT * FROM productos WHERE tenant_id = $1;

-- Vehículos por tenant  
SELECT * FROM vehiculos WHERE tenant_id = $1;

-- Nunca hacer consultas sin WHERE tenant_id
```

## Middleware de tenant (planificado):
```javascript
const requireTenant = (req, res, next) => {
  const { tenantId } = req.params;
  const userRole = req.user.role;
  const userTenantId = req.user.tenant_id;
  
  // CRÍTICO: Verificar que el usuario solo acceda a SU tenant
  if (userRole === 'automotora_admin' || userRole === 'vendedor_automotora' || userRole === 'vendedor_particular') {
    if (userTenantId !== tenantId) {
      return res.status(403).json({ error: 'Acceso denegado: No puedes acceder a otros tenants' });
    }
  }
  
  // Los compradores pueden ver todos los tenants (solo lectura)
  req.tenant_id = tenantId;
  next();
};

// Ejemplo de uso:
// app.get('/:tenantId/vehiculos', requireTenant, getVehiculos);
```

## Ejemplos de Aislamiento en Acción:

### Roberto García (Admin Toyota Centro) intenta acceder:
- ✅ `GET /11111111-1111-1111-1111-111111111111/vehiculos` → Sus 3 Toyota
- ❌ `GET /22222222-2222-2222-2222-222222222222/vehiculos` → 403 Forbidden
- ❌ `GET /33333333-3333-3333-3333-333333333333/vehiculos` → 403 Forbidden

### Carlos Pérez (Admin Carlos Pérez Motors) intenta acceder:
- ❌ `GET /11111111-1111-1111-1111-111111111111/vehiculos` → 403 Forbidden  
- ✅ `GET /22222222-2222-2222-2222-222222222222/vehiculos` → Sus 2 vehículos
- ❌ `GET /33333333-3333-3333-3333-333333333333/vehiculos` → 403 Forbidden

### Juan Rodríguez (Comprador) puede acceder:
- ✅ `GET /11111111-1111-1111-1111-111111111111/vehiculos` → Toyota (solo lectura)
- ✅ `GET /22222222-2222-2222-2222-222222222222/vehiculos` → Carlos Pérez (solo lectura)
- ✅ `GET /33333333-3333-3333-3333-333333333333/vehiculos` → María González (solo lectura)
  const tenantId = req.params.tenantId;
  // Validar tenant existe
  // Inyectar en todas las queries: WHERE tenant_id = tenantId
  req.tenantId = tenantId;
  next();
};
```
