# Arquitectura Multitenant Corporativa - AutoMarket

## 🏗️ Estructura Jerárquica por Corporación Automotriz

### Concepto Principal
Cada **Corporación Automotriz** es un TENANT independiente que gestiona sus propias sedes, usuarios y vehículos.

```
TENANT: Toyota Chile (tenant_id: toyota-chile)
├── 👔 Admin Corporativo (corporate_admin)
│   ├── 📊 Dashboard corporativo
│   ├── 🏢 Gestión de todas las sedes
│   ├── 👥 Gestión de encargados y vendedores
│   └── 📈 Reportes consolidados
├── 🏢 Sede Las Condes (branch_id: las-condes)
│   ├── 👨‍💼 Encargado de Sede (branch_manager)
│   ├── 👤 Vendedor 1 (sales_person)
│   ├── 👤 Vendedor 2 (sales_person)
│   └── 🚗 Inventario de la sede
├── 🏢 Sede Providencia (branch_id: providencia)
│   ├── 👨‍💼 Encargado de Sede (branch_manager)
│   ├── 👤 Vendedor 1 (sales_person)
│   └── 🚗 Inventario de la sede
└── 🏢 Sede Maipú (branch_id: maipu)
    ├── 👨‍💼 Encargado de Sede (branch_manager)
    ├── 👤 Vendedor 1 (sales_person)
    ├── 👤 Vendedor 2 (sales_person)
    └── 🚗 Inventario de la sede
```

```
TENANT: Chevrolet Chile (tenant_id: chevrolet-chile)
├── 👔 Admin Corporativo (corporate_admin)
├── 🏢 Sede Santiago Centro (branch_id: santiago-centro)
├── 🏢 Sede Valparaíso (branch_id: valparaiso)
└── 🏢 Sede Concepción (branch_id: concepcion)
```

## 👥 Sistema de Roles

### 1. **Corporate Admin (Administrador Corporativo)**
- **Scope**: Todo el tenant de su corporación
- **Permisos**:
  - ✅ Crear/editar/eliminar sedes
  - ✅ Asignar encargados de sede
  - ✅ Ver todos los vehículos de todas las sedes
  - ✅ Reportes consolidados de toda la corporación
  - ✅ Gestionar configuración corporativa
- **Dashboard**: Vista global de toda la corporación

### 2. **Branch Manager (Encargado de Sede)**
- **Scope**: Solo su sede específica dentro del tenant
- **Permisos**:
  - ✅ Gestionar vendedores de su sede
  - ✅ Ver/editar inventario de su sede
  - ✅ Asignar leads a vendedores
  - ✅ Reportes de su sede
  - ❌ No puede ver otras sedes
- **Dashboard**: Vista específica de su sede

### 3. **Sales Person (Vendedor)**
- **Scope**: Solo sus propios vehículos y leads
- **Permisos**:
  - ✅ Gestionar sus vehículos asignados
  - ✅ Atender sus leads/consultas
  - ✅ Ver estadísticas personales
  - ❌ No puede ver otros vendedores
- **Dashboard**: Vista personal de ventas

### 4. **Buyer (Comprador)**
- **Scope**: Cross-tenant (puede ver vehículos de todas las corporaciones)
- **Permisos**:
  - ✅ Buscar vehículos en todas las corporaciones
  - ✅ Contactar vendedores
  - ✅ Guardar favoritos
  - ❌ Sin acceso administrativo
- **Dashboard**: Vista de comprador

## 🗄️ Modelo de Datos

### Tabla: `tenants` (Corporaciones)
```sql
CREATE TABLE tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,           -- "Toyota Chile"
    slug VARCHAR(50) UNIQUE NOT NULL,     -- "toyota-chile"
    brand VARCHAR(50) NOT NULL,           -- "Toyota"
    country_code VARCHAR(3) NOT NULL,     -- "CHL"
    currency VARCHAR(3) DEFAULT 'CLP',
    status tenant_status DEFAULT 'active',
    settings JSONB,                       -- Configuración corporativa
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Tabla: `branches` (Sedes/Sucursales)
```sql
CREATE TABLE branches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    name VARCHAR(100) NOT NULL,           -- "Toyota Las Condes"
    slug VARCHAR(50) NOT NULL,            -- "las-condes"
    address TEXT,
    city VARCHAR(50),
    region VARCHAR(50),
    phone VARCHAR(20),
    email VARCHAR(100),
    status branch_status DEFAULT 'active',
    settings JSONB,                       -- Configuración de la sede
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(tenant_id, slug)
);
```

### Tabla: `users` (Actualizada con jerarquía)
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id),     -- NULL para buyers
    branch_id UUID REFERENCES branches(id),    -- NULL para corporate_admin y buyers
    role user_role NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    status user_status DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Tabla: `vehicles` (Con filtrado jerárquico)
```sql
CREATE TABLE vehicles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    branch_id UUID NOT NULL REFERENCES branches(id),
    assigned_to UUID REFERENCES users(id),      -- Vendedor asignado
    brand VARCHAR(50) NOT NULL,
    model VARCHAR(100) NOT NULL,
    year INTEGER NOT NULL,
    price DECIMAL(12,2) NOT NULL,
    status vehicle_status DEFAULT 'available',
    -- ... otros campos del vehículo
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 🔐 Filtrado de Datos por Jerarquía

### Corporate Admin
```sql
-- Ve TODO de su corporación
SELECT * FROM vehicles WHERE tenant_id = 'toyota-chile';
SELECT * FROM branches WHERE tenant_id = 'toyota-chile';
SELECT * FROM users WHERE tenant_id = 'toyota-chile';
```

### Branch Manager
```sql
-- Solo ve su sede
SELECT * FROM vehicles WHERE tenant_id = 'toyota-chile' AND branch_id = 'las-condes';
SELECT * FROM users WHERE tenant_id = 'toyota-chile' AND branch_id = 'las-condes';
```

### Sales Person
```sql
-- Solo ve sus vehículos asignados
SELECT * FROM vehicles WHERE tenant_id = 'toyota-chile' AND branch_id = 'las-condes' AND assigned_to = user_id;
```

### Buyer
```sql
-- Ve vehículos de TODAS las corporaciones (cross-tenant)
SELECT v.*, t.name as corporation, b.name as branch 
FROM vehicles v 
JOIN tenants t ON t.id = v.tenant_id 
JOIN branches b ON b.id = v.branch_id 
WHERE v.status = 'available';
```

## 🌐 Estructura de URLs

### Por Corporación
- `toyota-chile.automarket.com` → Tenant Toyota Chile
- `chevrolet-chile.automarket.com` → Tenant Chevrolet Chile
- `ford-chile.automarket.com` → Tenant Ford Chile

### Por Rol
- `/corporate/dashboard` → Corporate Admin Dashboard
- `/branch/dashboard` → Branch Manager Dashboard  
- `/sales/dashboard` → Sales Person Dashboard
- `/catalog` → Public catalog (buyers)

## 📊 Dashboards por Jerarquía

### 1. Corporate Admin Dashboard
```
📊 Resumen Corporativo
├── 💰 Ventas totales de todas las sedes
├── 🚗 Inventario consolidado por sede
├── 👥 Performance de encargados de sede
├── 📈 Trends por región/sede
└── 🏢 Gestión de sedes

🏢 Gestión de Sedes
├── ➕ Crear nueva sede
├── 📝 Editar sedes existentes
├── 👨‍💼 Asignar/cambiar encargados
└── 📊 Ver métricas por sede

👥 Gestión de Personal
├── 👨‍💼 Encargados de sede
├── 👤 Vendedores por sede
├── 📈 Performance individual
└── 🎯 Asignación de objetivos
```

### 2. Branch Manager Dashboard
```
📊 Resumen de Mi Sede
├── 💰 Ventas de la sede
├── 🚗 Inventario de la sede
├── 👥 Performance de vendedores
└── 📈 Métricas específicas

👥 Gestión de Vendedores
├── ➕ Agregar vendedor
├── 📝 Editar información
├── 🚗 Asignar vehículos
└── 📊 Ver performance

🚗 Gestión de Inventario
├── ➕ Agregar vehículo
├── 📝 Editar vehículo
├── 👤 Asignar a vendedor
└── 📊 Estado del inventario
```

### 3. Sales Person Dashboard
```
📊 Mi Performance
├── 💰 Mis ventas
├── 🚗 Mis vehículos asignados
├── 👥 Mis leads/consultas
└── 📈 Mis estadísticas

🚗 Mis Vehículos
├── 📝 Editar información
├── 📸 Gestionar fotos
├── 💰 Actualizar precio
└── ✅ Marcar como vendido

👥 Mis Leads
├── 📞 Consultas pendientes
├── 💬 Chat con clientes
├── 📅 Citas programadas
└── ✅ Marcar como vendido
```

Esta arquitectura es mucho más robusta y realista para el mercado automotriz chileno. ¿Te parece bien esta estructura? ¿Quieres que empecemos implementando los modelos de datos?