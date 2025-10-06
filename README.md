# 🚗 AutoMarket MultiTenant

Sistema corporativo de marketplace de vehículos con arquitectura multi-tenant que permite a automotoras gestionar múltiples sedes, leads, favoritos y mensajería de forma independiente y segura.

## ✨ Características Principales

### 🏢 **Gestión Corporativa Multi-Sede**
- **Sedes/Sucursales**: Gestión de múltiples ubicaciones por tenant
- **Sistema de Leads**: Gestión completa de consultas de clientes
- **Favoritos de Usuarios**: Sistema de marcado de vehículos preferidos
- **Mensajería Integrada**: Comunicación entre vendedores y clientes

### 👥 **Roles y Permisos**
- **🏢 Administrador Corporativo**: Control total de la organización
- **🏪 Gerente de Sede**: Administración de sucursal específica
- **💼 Vendedor**: Gestión de leads y vehículos asignados
- **🛒 Comprador**: Navegación, favoritos y consultas

### 🛡️ **Arquitectura Multi-Tenant Segura**
- Aislamiento completo de datos por tenant
- Row Level Security (RLS) en todas las tablas
- Políticas de seguridad automatizadas
- Gestión de roles granular

## 🚀 Inicio Rápido

### 1. **Configuración del Entorno**
```bash
# Clonar repositorio
git clone [repository-url]
cd automarket-multitenant

# Configurar variables de entorno
cp app/.env.example app/.env
# Configurar credenciales de Supabase en app/.env
```

### 2. **Configurar Base de Datos**
```bash
# Ejecutar migración corporativa en Supabase SQL Editor
# Usar: database/migrations/migration_simple.sql (versión limpia y funcional)
# Ver: database/README.md para más detalles
```

### 3. **Iniciar la Aplicación**
```bash
cd app
npm install
npm run dev
```

### 4. **Acceder a la Aplicación**
- **Frontend**: http://localhost:5173
- **Dashboards**: Corporativo, Gerente de Sede, Vendedor

## 📁 **Estructura del Proyecto (Organizada)**

```
automarket-multitenant/
├── 📱 app/                           # 🎯 APLICACIÓN PRINCIPAL
│   ├── src/
│   │   ├── components/              # React Components
│   │   │   ├── BranchList.tsx      # Gestión de sedes
│   │   │   ├── LeadList.tsx        # Sistema de leads
│   │   │   ├── dashboards/         # Dashboards por rol
│   │   │   └── ...
│   │   ├── services/               # Servicios de API
│   │   │   ├── branchService.ts    # Gestión de sucursales
│   │   │   ├── leadService.ts      # Sistema de leads
│   │   │   ├── favoriteService.ts  # Favoritos
│   │   │   └── messageService.ts   # Mensajería
│   │   ├── models/                 # Tipos TypeScript
│   │   ├── lib/                    # Configuración
│   │   │   └── supabase.ts        # Cliente Supabase
│   │   └── hooks/                  # React Hooks
│   ├── package.json
│   └── .env                        # Variables de entorno
├── 🗄️ database/                      # BASE DE DATOS
│   ├── migrations/                 # Scripts de migración
│   │   ├── migration_simple.sql    # ✅ Migración principal
│   │   └── migration_corporate_fixed.sql # ✅ Migración completa
│   ├── schemas/                    # Esquemas base
│   │   ├── schema.sql             # Esquema inicial
│   │   └── setup_ultra_safe.sql   # Configuración RLS
│   └── README.md                   # Documentación BD
├── ⚙️ config/                        # CONFIGURACIÓN
│   ├── docker-compose.yml         # Contenedores Docker
│   └── README.md                   # Guía de configuración
├── � docs/                          # DOCUMENTACIÓN
│   ├── setup/                      # Guías de instalación
│   ├── github/                     # Templates GitHub
│   ├── manual-tests/               # Pruebas manuales
│   └── README.md                   # Índice de documentación
├── 📊 db/init.sql                    # Datos iniciales (Docker)
├── 🔧 scripts/                       # Scripts de utilidad
└── 📖 README.md                      # Esta documentación
```

## 🎯 **Funcionalidades Implementadas**

### ✅ **Sistema Corporativo Multi-Sede**
- [x] **4 Nuevas Tablas**: branches, leads, favorites, messages
- [x] **Roles Avanzados**: corporate_admin, branch_manager, sales_person, buyer
- [x] **Dashboards por Rol**: 3 interfaces especializadas
- [x] **Gestión de Sucursales**: CRUD completo con estadísticas
- [x] **Sistema de Leads**: Gestión completa de consultas
- [x] **Favoritos**: Sistema de marcado de vehículos
- [x] **Mensajería**: Comunicación integrada

### ✅ **Base Multi-Tenant Segura**
- [x] **Aislamiento por Tenant**: RLS en todas las tablas
- [x] **2 Tenants de Ejemplo**: Toyota Centro, Carlos Pérez Motors
- [x] **PK Compuesta**: tenant_id + id para máxima seguridad
- [x] **Políticas RLS**: Automáticas y granulares
- [x] **Supabase**: Base de datos en la nube completamente funcional

## 🛠️ **Stack Tecnológico**

### **Frontend**
- **React 18** con TypeScript
- **Vite** para desarrollo y build
- **CSS Modules** para estilos
- **Supabase** cliente JavaScript

### **Backend**
- **Supabase** (PostgreSQL + Auth + API)
- **Row Level Security (RLS)**
- **PostgreSQL 16** con extensiones

### **Desarrollo**
- **Git** control de versiones
- **npm** gestión de dependencias
- **Estructura modular** con servicios

## 🔐 **Seguridad y Aislamiento**

### **Multi-Tenant por Diseño**
- ✅ **Row Level Security (RLS)**: Aislamiento automático por tenant
- ✅ **Políticas Granulares**: Control de acceso por rol y recurso
- ✅ **Tenant ID**: Todas las tablas incluyen identificador de organización
- ✅ **Supabase Auth**: Autenticación y autorización integrada

### **Roles y Permisos**
```typescript
type UserRole = 
  | 'corporate_admin'   // Acceso total a la organización
  | 'branch_manager'    // Gestión de sucursal específica  
  | 'sales_person'      // Leads y vehículos asignados
  | 'buyer'             // Solo lectura y favoritos
```

## 📊 **Datos de Ejemplo Incluidos**

### **🏢 Sucursales Corporativas**
- **AutoMarket Las Condes** (Santiago, Metropolitana)
- **AutoMarket Providencia** (Santiago, Metropolitana)  
- **AutoMarket Valparaíso** (Valparaíso, Valparaíso)

### **👥 Usuarios por Tenant**
- **Administradores Corporativos**: Control total
- **Gerentes de Sede**: Gestión local
- **Vendedores**: Leads asignados
- **Compradores**: Navegación y favoritos

## 🧪 **Testing y Verificación**

### **Verificar Base de Datos**
```bash
# Conectar a PostgreSQL local
./scripts/psql.sh

# Verificar datos multi-tenant
\i scripts/verify_tenant.sql
```

### **Verificar Migración**
```sql
-- Ejecutar en Supabase SQL Editor para verificar
SELECT tablename, column_count 
FROM (
  SELECT tablename, 
         (SELECT count(*) FROM information_schema.columns 
          WHERE table_name = t.tablename) as column_count
  FROM pg_tables t
  WHERE schemaname = 'public' 
  AND tablename IN ('branches', 'leads', 'favorites', 'messages')
) ORDER BY tablename;
```

## 🚀 **Próximos Pasos**

### **Desarrollo Inmediato**
- [ ] **Autenticación**: Integrar Supabase Auth con roles
- [ ] **API Endpoints**: CRUD REST para todas las entidades
- [ ] **Filtros Avanzados**: Búsqueda y filtrado en dashboards
- [ ] **Notificaciones**: Sistema de alertas y mensajes

### **Funcionalidades Avanzadas**
- [ ] **Reportes**: Analytics por sede y vendedor
- [ ] **Sistema de Citas**: Programación de visitas
- [ ] **Workflow de Leads**: Estados automáticos
- [ ] **Integración WhatsApp**: Mensajería externa

## 📝 **Configuración Recomendada**

### **Variables de Entorno (`app/.env`)**
```bash
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_SUPABASE_PROJECT_ID=your_project_id
```

### **Estructura de Desarrollo**
```bash
# Desarrollo local
npm run dev          # Frontend en localhost:5173
npm run build        # Build para producción
npm run preview      # Preview del build
```

---

## 📄 **Información del Proyecto**

**📧 Autor**: EstebanSalgad0  
**🎓 Contexto**: Desarrollo de Aplicaciones Web Multi-Tenant  
**📅 Versión**: v2.0 - Sistema Corporativo Multi-Sede  
**🏗️ Arquitectura**: React + Supabase + PostgreSQL  
**🔄 Última Actualización**: Octubre 2025

### **🎯 Estado del Proyecto**
✅ **Base de Datos**: Completamente funcional  
✅ **Frontend**: Dashboards implementados  
✅ **Servicios**: CRUD completo para todas las entidades  
✅ **Migración**: Scripts validados y ejecutados  
🔄 **Autenticación**: En desarrollo  
🔄 **API**: Próxima implementación
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
=======
[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/qAF66khh)
# saas-multitenant-docker
>>>>>>> 8417d8caa84daeed5da87c1d308f71769c4bc701
