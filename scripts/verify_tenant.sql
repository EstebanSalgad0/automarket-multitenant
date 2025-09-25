-- Verificar scoping por tenant (AutoMarket - Sistema Multi-tenant)
-- IMPORTANTE: Cada usuario solo puede ver/gestionar SU PROPIO TENANT

-- Verificar usuarios por tenant y rol
select t.nombre as tenant, u.nombre as usuario, tu.rol 
from tenant_usuarios tu
join tenants t on t.id = tu.tenant_id
join usuarios u on u.id = tu.usuario_id
where tu.tenant_id = :tenant_id
order by tu.rol, u.nombre;

-- Verificar productos por tenant (AISLAMIENTO: solo del tenant especificado)
select * from productos where tenant_id = :tenant_id order by nombre;

-- Verificar vehículos por tenant (AISLAMIENTO: solo del tenant especificado)
select * from vehiculos where tenant_id = :tenant_id order by marca, modelo;

-- Ejemplos con UUIDs específicos:
-- Tenant Toyota Centro: 11111111-1111-1111-1111-111111111111
-- Tenant Carlos Pérez: 22222222-2222-2222-2222-222222222222
-- Tenant María González (Vendedor Particular): 33333333-3333-3333-3333-333333333333

-- EJEMPLO DE AISLAMIENTO POR ROLES:

-- 1. Roberto García (automotora_admin de Toyota Centro) SOLO puede ver:
-- select marca, modelo, año, precio from vehiculos where tenant_id = '11111111-1111-1111-1111-111111111111';
-- RESULTADO: Solo vehículos Toyota (Corolla, RAV4, Camry)

-- 2. Carlos Pérez (automotora_admin de Carlos Pérez Motors) SOLO puede ver:
-- select marca, modelo, año, precio from vehiculos where tenant_id = '22222222-2222-2222-2222-222222222222';
-- RESULTADO: Solo vehículos de su automotora (Honda Civic, Volkswagen Jetta)

-- 3. María González (vendedor_particular) SOLO puede ver:
-- select marca, modelo, año, precio from vehiculos where tenant_id = '33333333-3333-3333-3333-333333333333';
-- RESULTADO: Solo sus vehículos personales (Nissan Sentra, Ford Focus)

-- 4. Compradores pueden ver vehículos de TODOS los tenants (pero sin permisos de edición):
-- select t.nombre as automotora, v.marca, v.modelo, v.precio 
-- from vehiculos v join tenants t on t.id = v.tenant_id 
-- order by t.nombre, v.marca;

-- CRÍTICO: Nunca hacer consultas sin WHERE tenant_id = :tenant_id 
-- (excepto para rol 'comprador' en consultas de solo lectura)
