-- Multitenant schema (PostgreSQL)
-- Extensiones
create extension if not exists pgcrypto;

-- Tenants
create table if not exists tenants (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  created_at timestamptz not null default now()
);

-- Usuarios globales
create table if not exists usuarios (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  nombre text not null,
  created_at timestamptz not null default now()
);

-- Membresía de usuarios por tenant
create table if not exists tenant_usuarios (
  tenant_id uuid not null references tenants(id) on delete cascade,
  usuario_id uuid not null references usuarios(id) on delete cascade,
  rol text not null check (rol in ('automotora_admin','vendedor_automotora','vendedor_particular','comprador')),
  primary key (tenant_id, usuario_id)
);

-- Tabla de dominio: vehículos (siguiendo patrón de productos)
create table if not exists vehiculos (
  tenant_id uuid not null references tenants(id) on delete cascade,
  id uuid not null default gen_random_uuid(),
  marca text not null,
  modelo text not null,
  año integer not null,
  precio numeric(12,2) not null default 0,
  kilometraje integer default 0,
  color text,
  combustible text,
  transmision text,
  descripcion text,
  estado text not null default 'disponible' check (estado in ('disponible','vendido','reservado')),
  created_at timestamptz not null default now(),
  primary key (tenant_id, id)
);

-- Tabla de dominio de ejemplo (mantenemos productos como pide el profesor)
create table if not exists productos (
  tenant_id uuid not null references tenants(id) on delete cascade,
  id uuid not null default gen_random_uuid(),
  nombre text not null,
  precio numeric(12,2) not null default 0,
  stock integer not null default 0,
  created_at timestamptz not null default now(),
  primary key (tenant_id, id)
);

-- Índices
create index if not exists idx_productos_tenant_nombre on productos (tenant_id, nombre);
create index if not exists idx_vehiculos_tenant_marca on vehiculos (tenant_id, marca);
create index if not exists idx_vehiculos_tenant_precio on vehiculos (tenant_id, precio);

-- Datos de ejemplo (3 tenants para AutoMarket: 2 automotoras + 1 vendedor particular)
insert into tenants (id, nombre) values
  ('11111111-1111-1111-1111-111111111111', 'Toyota Centro')
  on conflict (id) do nothing;

insert into tenants (id, nombre) values
  ('22222222-2222-2222-2222-222222222222', 'Carlos Pérez Motors')
  on conflict (id) do nothing;

-- Tenant individual para vendedor particular
insert into tenants (id, nombre) values
  ('33333333-3333-3333-3333-333333333333', 'María González (Vendedor Individual)')
  on conflict (id) do nothing;

-- Usuarios del sistema
insert into usuarios (id, email, nombre) values
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'admin@toyota-centro.com', 'Roberto García'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'carlos@perez-motors.com', 'Carlos Pérez'),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'vendedor@toyota-centro.com', 'Ana López'),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'vendedor2@perez-motors.com', 'Luis Mendoza'),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'maria.gonzalez@gmail.com', 'María González'),
  ('ffffffff-ffff-ffff-ffff-ffffffffffff', 'comprador1@email.com', 'Juan Rodríguez'),
  ('44444444-4444-4444-4444-444444444444', 'comprador2@email.com', 'Patricia Silva')
  on conflict (id) do nothing;

-- Asignación de roles por tenant
-- Toyota Centro: Admin + Vendedor
insert into tenant_usuarios (tenant_id, usuario_id, rol) values
  ('11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'automotora_admin'),
  ('11111111-1111-1111-1111-111111111111', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'vendedor_automotora')
  on conflict do nothing;

-- Carlos Pérez Motors: Admin + Vendedor  
insert into tenant_usuarios (tenant_id, usuario_id, rol) values
  ('22222222-2222-2222-2222-222222222222', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'automotora_admin'),
  ('22222222-2222-2222-2222-222222222222', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'vendedor_automotora')
  on conflict do nothing;

-- Vendedor Particular (tenant individual)
insert into tenant_usuarios (tenant_id, usuario_id, rol) values
  ('33333333-3333-3333-3333-333333333333', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'vendedor_particular')
  on conflict do nothing;

-- Compradores (pueden acceder a todos los tenants para consultas)
insert into tenant_usuarios (tenant_id, usuario_id, rol) values
  ('11111111-1111-1111-1111-111111111111', 'ffffffff-ffff-ffff-ffff-ffffffffffff', 'comprador'),
  ('22222222-2222-2222-2222-222222222222', 'ffffffff-ffff-ffff-ffff-ffffffffffff', 'comprador'),
  ('33333333-3333-3333-3333-333333333333', 'ffffffff-ffff-ffff-ffff-ffffffffffff', 'comprador'),
  ('11111111-1111-1111-1111-111111111111', '44444444-4444-4444-4444-444444444444', 'comprador'),
  ('22222222-2222-2222-2222-222222222222', '44444444-4444-4444-4444-444444444444', 'comprador'),
  ('33333333-3333-3333-3333-333333333333', '44444444-4444-4444-4444-444444444444', 'comprador')
  on conflict do nothing;

insert into productos (tenant_id, nombre, precio, stock) values
  ('11111111-1111-1111-1111-111111111111', 'Producto A1', 1000, 10),
  ('11111111-1111-1111-1111-111111111111', 'Producto A2', 2500, 5),
  ('22222222-2222-2222-2222-222222222222', 'Producto B1', 1500, 7),
  ('22222222-2222-2222-2222-222222222222', 'Producto B2', 3800, 3);

-- Datos de vehículos de ejemplo
insert into vehiculos (tenant_id, marca, modelo, año, precio, kilometraje, color, combustible, transmision, descripcion, estado) values
  -- Vehículos Toyota Centro
  ('11111111-1111-1111-1111-111111111111', 'Toyota', 'Corolla', 2023, 379900.00, 0, 'Blanco', 'Gasolina', 'Automática', 'Toyota Corolla 2023 nuevo, excelente rendimiento de combustible', 'disponible'),
  ('11111111-1111-1111-1111-111111111111', 'Toyota', 'RAV4', 2022, 519900.00, 15000, 'Rojo', 'Gasolina', 'Automática', 'RAV4 2022 seminueva en excelentes condiciones', 'disponible'),
  ('11111111-1111-1111-1111-111111111111', 'Toyota', 'Camry', 2022, 469900.00, 10000, 'Azul', 'Híbrido', 'CVT', 'Camry Híbrido con excelente rendimiento', 'disponible'),
  -- Vehículos Carlos Pérez Motors
  ('22222222-2222-2222-2222-222222222222', 'Honda', 'Civic', 2020, 325000.00, 35000, 'Negro', 'Gasolina', 'CVT', 'Honda Civic 2020 en excelentes condiciones, único dueño', 'disponible'),
  ('22222222-2222-2222-2222-222222222222', 'Volkswagen', 'Jetta', 2019, 285000.00, 42000, 'Blanco', 'Gasolina', 'Automática', 'Jetta Comfortline 2019, muy económico', 'disponible'),
  -- Vehículos del vendedor particular María González
  ('33333333-3333-3333-3333-333333333333', 'Nissan', 'Sentra', 2018, 195000.00, 68000, 'Gris', 'Gasolina', 'Manual', 'Nissan Sentra 2018, único dueño, excelente mantenimiento', 'disponible'),
  ('33333333-3333-3333-3333-333333333333', 'Ford', 'Focus', 2017, 178000.00, 75000, 'Azul', 'Gasolina', 'Manual', 'Ford Focus 2017, ideal para ciudad, bajo consumo', 'disponible');

-- (Opcional) Bosquejo RLS para siguientes sprints
-- alter table productos enable row level security;
-- create policy productos_por_tenant on productos
--   using (tenant_id = current_setting('app.tenant_id')::uuid);
