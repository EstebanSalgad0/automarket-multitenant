# 🚧 Implementación Faltante - AutoMarket Corporativo

## 📋 **RESUMEN EJECUTIVO**

Para que AutoMarket funcione según la **Arquitectura Corporativa** definida, faltan implementar **componentes críticos** que actualmente impiden el funcionamiento real del sistema.

### **📊 Estado Actual vs Requerido**
- **Funcionalidad Actual:** 15% ⚠️
- **Funcionalidad Requerida:** 100% ✅
- **Componentes Faltantes:** 32 elementos críticos
- **Tiempo Estimado:** 2-3 semanas de desarrollo

---

## 🎯 **FUNCIONALIDADES POR ROL - ESTADO ACTUAL**

### **🏢 Corporate Admin: 0% Funcional**
| Funcionalidad | Estado | Componente Faltante |
|---------------|--------|-------------------|
| ✅ Crear/editar/eliminar sedes | ❌ **NO FUNCIONA** | Tabla `branches`, CRUD, UI |
| ✅ Asignar encargados de sede | ❌ **NO FUNCIONA** | Relación user-branch, UI |
| ✅ Ver vehículos de todas las sedes | ❌ **NO FUNCIONA** | Filtrado por tenant, agregación |
| ✅ Reportes consolidados | ❌ **NO FUNCIONA** | Servicios de reporting |
| ✅ Gestionar configuración | ❌ **NO FUNCIONA** | Sistema de configuración |

### **👨‍💼 Branch Manager: 0% Funcional**
| Funcionalidad | Estado | Componente Faltante |
|---------------|--------|-------------------|
| ✅ Gestionar vendedores de sede | ❌ **NO FUNCIONA** | Relación user-branch, permisos |
| ✅ Ver/editar inventario de sede | ❌ **NO FUNCIONA** | Filtrado por branch_id |
| ✅ Asignar leads a vendedores | ❌ **NO FUNCIONA** | Sistema de leads completo |
| ✅ Reportes de sede | ❌ **NO FUNCIONA** | Métricas por sede |

### **👤 Sales Person: 5% Funcional**
| Funcionalidad | Estado | Componente Faltante |
|---------------|--------|-------------------|
| ✅ Gestionar vehículos asignados | ❌ **NO FUNCIONA** | Campo `assigned_to`, filtrado |
| ✅ Atender leads/consultas | ❌ **NO FUNCIONA** | Sistema de leads |
| ✅ Ver estadísticas personales | ❌ **NO FUNCIONA** | Métricas por vendedor |

### **🛒 Buyer: 5% Funcional**
| Funcionalidad | Estado | Componente Faltante |
|---------------|--------|-------------------|
| ✅ Buscar vehículos cross-tenant | ❌ **NO FUNCIONA** | Catálogo público |
| ✅ Contactar vendedores | ❌ **NO FUNCIONA** | Sistema de mensajería |
| ✅ Guardar favoritos | ❌ **NO FUNCIONA** | Sistema de favoritos |

---

## 🗄️ **FASE 1: BASE DE DATOS CRÍTICA**

### **1.1 Nuevas Tablas Requeridas**

#### **📍 Tabla: `branches` (Sedes/Sucursales)**
```sql
CREATE TABLE branches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,           -- "Toyota Las Condes"
    slug VARCHAR(50) NOT NULL,            -- "las-condes"
    address TEXT,
    city VARCHAR(50),
    region VARCHAR(50),
    phone VARCHAR(20),
    email VARCHAR(100),
    manager_id UUID REFERENCES users(id), -- Encargado de sede
    status TEXT CHECK (status IN ('active', 'inactive', 'maintenance')) DEFAULT 'active',
    settings JSONB,                       -- Configuración de la sede
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(tenant_id, slug)
);
```

#### **📧 Tabla: `leads` (Sistema de Consultas)**
```sql
CREATE TABLE leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    branch_id UUID NOT NULL REFERENCES branches(id),
    vehicle_id UUID NOT NULL REFERENCES vehicles(id),
    assigned_to UUID REFERENCES users(id),        -- Vendedor asignado
    customer_name VARCHAR(100) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(20),
    message TEXT NOT NULL,
    status TEXT CHECK (status IN ('new', 'contacted', 'qualified', 'lost', 'sold')) DEFAULT 'new',
    priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'urgent')) DEFAULT 'medium',
    source VARCHAR(50),                           -- 'web', 'phone', 'whatsapp', etc.
    scheduled_date TIMESTAMP WITH TIME ZONE,     -- Cita programada
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### **⭐ Tabla: `favorites` (Favoritos de Compradores)**
```sql
CREATE TABLE favorites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, vehicle_id)
);
```

#### **💬 Tabla: `messages` (Sistema de Mensajería)**
```sql
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES users(id),
    message TEXT NOT NULL,
    message_type TEXT CHECK (message_type IN ('text', 'image', 'document')) DEFAULT 'text',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### **1.2 Modificaciones a Tablas Existentes**

#### **👥 Actualizar Tabla: `users`**
```sql
-- Agregar nuevos campos
ALTER TABLE users ADD COLUMN branch_id UUID REFERENCES branches(id);
ALTER TABLE users ADD COLUMN role TEXT CHECK (role IN ('corporate_admin', 'branch_manager', 'sales_person', 'buyer')) NOT NULL;
ALTER TABLE users ADD COLUMN full_name VARCHAR(200);
ALTER TABLE users ADD COLUMN avatar_url VARCHAR(500);

-- Eliminar campo obsoleto
ALTER TABLE users DROP COLUMN user_type;

-- Índices para performance
CREATE INDEX idx_users_tenant_branch ON users(tenant_id, branch_id);
CREATE INDEX idx_users_role ON users(role);
```

#### **🚗 Actualizar Tabla: `vehicles`**
```sql
-- Agregar nuevos campos
ALTER TABLE vehicles ADD COLUMN branch_id UUID NOT NULL REFERENCES branches(id);
ALTER TABLE vehicles ADD COLUMN assigned_to UUID REFERENCES users(id);
ALTER TABLE vehicles ADD COLUMN description TEXT;
ALTER TABLE vehicles ADD COLUMN mileage INTEGER;
ALTER TABLE vehicles ADD COLUMN condition_type TEXT CHECK (condition_type IN ('new', 'used', 'certified')) DEFAULT 'used';
ALTER TABLE vehicles ADD COLUMN transmission TEXT CHECK (transmission IN ('manual', 'automatic', 'cvt'));
ALTER TABLE vehicles ADD COLUMN fuel_type TEXT CHECK (fuel_type IN ('gasoline', 'diesel', 'hybrid', 'electric'));
ALTER TABLE vehicles ADD COLUMN color VARCHAR(50);
ALTER TABLE vehicles ADD COLUMN images JSONB;              -- Array de URLs de imágenes
ALTER TABLE vehicles ADD COLUMN features JSONB;           -- Características del vehículo
ALTER TABLE vehicles ADD COLUMN views_count INTEGER DEFAULT 0;
ALTER TABLE vehicles ADD COLUMN favorites_count INTEGER DEFAULT 0;

-- Índices para filtrado jerárquico
CREATE INDEX idx_vehicles_tenant_branch ON vehicles(tenant_id, branch_id);
CREATE INDEX idx_vehicles_assigned_to ON vehicles(assigned_to);
CREATE INDEX idx_vehicles_status ON vehicles(status);
```

#### **🏢 Actualizar Tabla: `tenants`**
```sql
-- Agregar campos para corporación
ALTER TABLE tenants ADD COLUMN brand VARCHAR(50) NOT NULL;           -- "Toyota", "Chevrolet"
ALTER TABLE tenants ADD COLUMN logo_url VARCHAR(500);
ALTER TABLE tenants ADD COLUMN website VARCHAR(255);
ALTER TABLE tenants ADD COLUMN contact_email VARCHAR(255);
ALTER TABLE tenants ADD COLUMN contact_phone VARCHAR(20);
```

---

## 🔐 **FASE 2: AUTENTICACIÓN Y AUTORIZACIÓN**

### **2.1 Context de Usuario**
```typescript
// app/src/contexts/AuthContext.tsx
interface AuthUser {
  id: string;
  email: string;
  full_name: string;
  role: 'corporate_admin' | 'branch_manager' | 'sales_person' | 'buyer';
  tenant_id?: string;
  branch_id?: string;
  tenant?: {
    id: string;
    name: string;
    brand: string;
    slug: string;
  };
  branch?: {
    id: string;
    name: string;
    slug: string;
  };
}
```

### **2.2 Guards de Autorización**
```typescript
// app/src/guards/RoleGuard.tsx
interface RoleGuardProps {
  allowedRoles: UserRole[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}
```

### **2.3 Row Level Security (RLS)**
```sql
-- Políticas para Corporate Admin
CREATE POLICY corporate_admin_vehicles ON vehicles
  FOR ALL USING (
    tenant_id IN (
      SELECT tenant_id FROM users 
      WHERE id = auth.uid() AND role = 'corporate_admin'
    )
  );

-- Políticas para Branch Manager
CREATE POLICY branch_manager_vehicles ON vehicles
  FOR ALL USING (
    branch_id IN (
      SELECT branch_id FROM users 
      WHERE id = auth.uid() AND role = 'branch_manager'
    )
  );

-- Políticas para Sales Person
CREATE POLICY sales_person_vehicles ON vehicles
  FOR ALL USING (
    assigned_to = auth.uid() OR 
    (assigned_to IS NULL AND branch_id IN (
      SELECT branch_id FROM users WHERE id = auth.uid()
    ))
  );
```

---

## 🏗️ **FASE 3: SERVICIOS Y LÓGICA DE NEGOCIO**

### **3.1 Servicios Críticos Faltantes**

#### **🏢 BranchService**
```typescript
// app/src/services/branchService.ts
interface BranchService {
  // CRUD básico
  getBranches(tenantId: string): Promise<Branch[]>;
  getBranch(id: string): Promise<Branch>;
  createBranch(data: CreateBranchData): Promise<Branch>;
  updateBranch(id: string, data: UpdateBranchData): Promise<Branch>;
  deleteBranch(id: string): Promise<void>;
  
  // Gestión de personal
  assignManager(branchId: string, userId: string): Promise<void>;
  getBranchEmployees(branchId: string): Promise<User[]>;
  
  // Métricas
  getBranchStats(branchId: string): Promise<BranchStats>;
}
```

#### **🚗 VehicleService (Actualizado)**
```typescript
// app/src/services/vehicleService.ts
interface VehicleService {
  // Filtrado jerárquico
  getVehiclesByTenant(tenantId: string): Promise<Vehicle[]>;
  getVehiclesByBranch(branchId: string): Promise<Vehicle[]>;
  getVehiclesBySalesperson(userId: string): Promise<Vehicle[]>;
  
  // Asignación
  assignVehicleToSalesperson(vehicleId: string, userId: string): Promise<void>;
  unassignVehicle(vehicleId: string): Promise<void>;
  
  // Público (cross-tenant)
  getPublicCatalog(filters: VehicleFilters): Promise<VehicleCatalog>;
}
```

#### **📧 LeadService**
```typescript
// app/src/services/leadService.ts
interface LeadService {
  // CRUD
  createLead(data: CreateLeadData): Promise<Lead>;
  getLeads(filters: LeadFilters): Promise<Lead[]>;
  updateLead(id: string, data: UpdateLeadData): Promise<Lead>;
  
  // Asignación
  assignLead(leadId: string, salespersonId: string): Promise<void>;
  
  // Mensajería
  getLeadMessages(leadId: string): Promise<Message[]>;
  sendMessage(leadId: string, message: string): Promise<Message>;
  
  // Estados
  updateLeadStatus(leadId: string, status: LeadStatus): Promise<void>;
}
```

#### **📊 ReportingService**
```typescript
// app/src/services/reportingService.ts
interface ReportingService {
  // Corporate Admin
  getCorporateStats(tenantId: string): Promise<CorporateStats>;
  getBranchesPerformance(tenantId: string): Promise<BranchPerformance[]>;
  
  // Branch Manager
  getBranchStats(branchId: string): Promise<BranchStats>;
  getSalespersonPerformance(branchId: string): Promise<SalespersonStats[]>;
  
  // Sales Person
  getSalespersonStats(userId: string): Promise<PersonalStats>;
}
```

### **3.2 Hooks Personalizados**
```typescript
// app/src/hooks/useAuth.ts
export const useAuth = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  
  const hasRole = (roles: UserRole[]) => user && roles.includes(user.role);
  const canAccessBranch = (branchId: string) => {
    if (!user) return false;
    if (user.role === 'corporate_admin') return true;
    return user.branch_id === branchId;
  };
  
  return { user, loading, hasRole, canAccessBranch };
};

// app/src/hooks/usePermissions.ts
export const usePermissions = () => {
  const { user } = useAuth();
  
  return {
    canCreateBranch: user?.role === 'corporate_admin',
    canManageUsers: ['corporate_admin', 'branch_manager'].includes(user?.role || ''),
    canAssignVehicles: ['corporate_admin', 'branch_manager'].includes(user?.role || ''),
    canViewAllVehicles: user?.role === 'corporate_admin',
    canContactSellers: user?.role === 'buyer'
  };
};
```

---

## 🎯 **FASE 4: COMPONENTES UI FALTANTES**

### **4.1 Gestión de Sedes**
```typescript
// app/src/components/branches/BranchManagement.tsx
- BranchList: Lista de sedes con filtros
- BranchForm: Formulario crear/editar sede
- BranchCard: Tarjeta de sede con métricas
- BranchAssignment: Asignar encargado de sede
```

### **4.2 Gestión de Personal**
```typescript
// app/src/components/users/UserManagement.tsx
- UserList: Lista filtrada por sede/rol
- UserForm: Formulario con rol y sede
- UserAssignment: Asignar usuarios a sedes
- RoleSelector: Selector de roles jerárquicos
```

### **4.3 Sistema de Leads**
```typescript
// app/src/components/leads/LeadManagement.tsx
- LeadList: Lista de consultas por filtros
- LeadDetail: Detalle con historial de mensajes
- LeadForm: Formulario de nueva consulta
- LeadAssignment: Asignar lead a vendedor
- MessageThread: Hilo de conversación
```

### **4.4 Catálogo Público**
```typescript
// app/src/components/catalog/PublicCatalog.tsx
- VehicleGrid: Grid de vehículos cross-tenant
- VehicleFilters: Filtros avanzados
- VehicleCard: Tarjeta con información de contacto
- ContactForm: Formulario de consulta
- FavoritesList: Lista de favoritos del usuario
```

### **4.5 Dashboards Específicos**
```typescript
// app/src/components/dashboards/CorporateAdminDashboard.tsx
- BranchesOverview: Vista general de sedes
- ConsolidatedReports: Reportes consolidados
- BranchPerformance: Performance por sede
- UserManagement: Gestión de personal

// app/src/components/dashboards/BranchManagerDashboard.tsx
- BranchStats: Estadísticas de la sede
- TeamManagement: Gestión del equipo
- InventoryManagement: Gestión de inventario
- LeadAssignment: Asignación de leads

// app/src/components/dashboards/SalesPersonDashboard.tsx
- PersonalStats: Estadísticas personales
- MyVehicles: Vehículos asignados
- MyLeads: Consultas asignadas
- Calendar: Citas programadas
```

---

## 📱 **FASE 5: ROUTING Y NAVEGACIÓN**

### **5.1 Estructura de Rutas**
```typescript
// app/src/router/AppRouter.tsx
const routes = [
  // Públicas
  { path: '/', component: PublicCatalog },
  { path: '/vehicle/:id', component: VehicleDetail },
  
  // Autenticación
  { path: '/login', component: LoginPage },
  { path: '/register', component: RegisterPage },
  
  // Corporate Admin
  { 
    path: '/corporate/*', 
    component: CorporateAdminRoutes,
    guard: RoleGuard(['corporate_admin'])
  },
  
  // Branch Manager
  { 
    path: '/branch/*', 
    component: BranchManagerRoutes,
    guard: RoleGuard(['branch_manager'])
  },
  
  // Sales Person
  { 
    path: '/sales/*', 
    component: SalesPersonRoutes,
    guard: RoleGuard(['sales_person'])
  },
  
  // Buyer
  { 
    path: '/buyer/*', 
    component: BuyerRoutes,
    guard: RoleGuard(['buyer'])
  }
];
```

### **5.2 Guards de Rutas**
```typescript
// app/src/guards/AuthGuard.tsx
export const AuthGuard: React.FC<{children: React.ReactNode}> = ({children}) => {
  const { user, loading } = useAuth();
  
  if (loading) return <LoadingSpinner />;
  if (!user) return <Navigate to="/login" />;
  
  return <>{children}</>;
};

// app/src/guards/RoleGuard.tsx
export const RoleGuard: React.FC<RoleGuardProps> = ({allowedRoles, children, fallback}) => {
  const { user } = useAuth();
  
  if (!user || !allowedRoles.includes(user.role)) {
    return fallback || <Navigate to="/unauthorized" />;
  }
  
  return <>{children}</>;
};
```

---

## 🔧 **FASE 6: CONFIGURACIÓN Y DEPLOYMENT**

### **6.1 Variables de Entorno**
```env
# .env.local
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_APP_NAME=AutoMarket
VITE_DEFAULT_TENANT=chile
VITE_ENABLE_MULTITENANCY=true
```

### **6.2 Configuración de Supabase**
```sql
-- Habilitar RLS en todas las tablas
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
```

---

## 📅 **CRONOGRAMA DE IMPLEMENTACIÓN**

### **Semana 1: Fundamentos**
- [ ] **Día 1-2:** Actualizar esquema de BD completo
- [ ] **Día 3-4:** Implementar autenticación y context
- [ ] **Día 5:** Configurar RLS básico

### **Semana 2: Servicios Core**
- [ ] **Día 1-2:** BranchService y VehicleService
- [ ] **Día 3-4:** LeadService y ReportingService
- [ ] **Día 5:** Testing de servicios

### **Semana 3: UI y UX**
- [ ] **Día 1-2:** Componentes de gestión de sedes
- [ ] **Día 3-4:** Sistema de leads y mensajería
- [ ] **Día 5:** Catálogo público y favoritos

### **Semana 4: Integración**
- [ ] **Día 1-2:** Dashboards específicos por rol
- [ ] **Día 3-4:** Routing y guards
- [ ] **Día 5:** Testing y deployment

---

## 🧪 **DATOS DE PRUEBA**

### **Tenants Corporativos**
```sql
INSERT INTO tenants (name, slug, brand, country_code) VALUES
('Toyota Chile', 'toyota-chile', 'Toyota', 'CHL'),
('Chevrolet Chile', 'chevrolet-chile', 'Chevrolet', 'CHL'),
('Ford Chile', 'ford-chile', 'Ford', 'CHL');
```

### **Sedes de Ejemplo**
```sql
INSERT INTO branches (tenant_id, name, slug, city, region) VALUES
-- Toyota
((SELECT id FROM tenants WHERE slug = 'toyota-chile'), 'Toyota Las Condes', 'las-condes', 'Las Condes', 'Metropolitana'),
((SELECT id FROM tenants WHERE slug = 'toyota-chile'), 'Toyota Providencia', 'providencia', 'Providencia', 'Metropolitana'),
-- Chevrolet
((SELECT id FROM tenants WHERE slug = 'chevrolet-chile'), 'Chevrolet Santiago Centro', 'santiago-centro', 'Santiago', 'Metropolitana');
```

### **Usuarios de Prueba**
```sql
-- Corporate Admin Toyota
INSERT INTO users (tenant_id, role, email, full_name) VALUES
((SELECT id FROM tenants WHERE slug = 'toyota-chile'), 'corporate_admin', 'admin@toyota-chile.com', 'Juan Pérez Admin');

-- Branch Manager Las Condes
INSERT INTO users (tenant_id, branch_id, role, email, full_name) VALUES
((SELECT id FROM tenants WHERE slug = 'toyota-chile'), 
 (SELECT id FROM branches WHERE slug = 'las-condes'), 
 'branch_manager', 'manager.lascondes@toyota-chile.com', 'María González Manager');

-- Sales Person
INSERT INTO users (tenant_id, branch_id, role, email, full_name) VALUES
((SELECT id FROM tenants WHERE slug = 'toyota-chile'), 
 (SELECT id FROM branches WHERE slug = 'las-condes'), 
 'sales_person', 'vendedor1@toyota-chile.com', 'Carlos Rodríguez Vendedor');
```

---

## ✅ **CHECKLIST DE IMPLEMENTACIÓN**

### **Base de Datos**
- [ ] Crear tabla `branches`
- [ ] Crear tabla `leads`
- [ ] Crear tabla `favorites`
- [ ] Crear tabla `messages`
- [ ] Actualizar tabla `users`
- [ ] Actualizar tabla `vehicles`
- [ ] Actualizar tabla `tenants`
- [ ] Configurar RLS completo
- [ ] Crear índices de performance
- [ ] Insertar datos de prueba

### **Autenticación**
- [ ] AuthContext con información completa
- [ ] Hooks useAuth y usePermissions
- [ ] Guards para rutas protegidas
- [ ] Middleware de autorización
- [ ] Manejo de sesiones por tenant

### **Servicios**
- [ ] BranchService completo
- [ ] VehicleService con filtrado jerárquico
- [ ] LeadService con mensajería
- [ ] ReportingService con métricas
- [ ] FavoriteService
- [ ] Integration tests

### **Componentes UI**
- [ ] BranchManagement (CRUD sedes)
- [ ] UserManagement (gestión por roles)
- [ ] LeadManagement (sistema de consultas)
- [ ] PublicCatalog (catálogo cross-tenant)
- [ ] Dashboards específicos por rol
- [ ] Sistema de favoritos

### **Routing**
- [ ] Rutas protegidas por rol
- [ ] Guards de autorización
- [ ] Navegación jerárquica
- [ ] Redirecciones automáticas
- [ ] Manejo de errores 404/403

### **Testing**
- [ ] Tests unitarios de servicios
- [ ] Tests de integración
- [ ] Tests de componentes
- [ ] Tests de autorización
- [ ] Tests end-to-end por rol

---

## 🚀 **PARA EMPEZAR HOY**

### **Comando de Inicio Rápido**
```bash
# 1. Backup de la BD actual
pg_dump automarket > backup_before_corporate.sql

# 2. Ejecutar nuevo schema
psql -d automarket -f supabase/schema_corporativo.sql

# 3. Instalar dependencias adicionales
npm install @tanstack/react-query react-hook-form zod

# 4. Crear estructura de carpetas
mkdir -p app/src/{contexts,guards,hooks,services,types}
```

### **Primer Paso Recomendado**
**Actualizar el esquema de base de datos** es crítico y debe hacerse primero. Sin esto, nada más funcionará.

¿Quieres que empecemos creando el script SQL completo para la nueva estructura de base de datos?

---

*📝 Documento creado el $(date) - AutoMarket Corporativo v2.0*