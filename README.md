# 🚗 AutoMarket MultiTenant# 🚗 AutoMarket MultiTenant



> **Sistema completo de marketplace de vehículos multitenant con autenticación, gestión de inventario y arquitectura escalable.**> **Sistema completo de marketplace de vehículos multitenant con autenticación, gestión de inventario y arquitectura escalable.**



[![Node.js](https://img.shields.io/badge/Node.js-18.x-green.svg)](https://nodejs.org/)[![Node.js](https://img.shields.io/badge/Node.js-18.x-green.svg)](https://nodejs.org/)

[![React](https://img.shields.io/badge/React-18.x-blue.svg)](https://reactjs.org/)[![React](https://img.shields.io/badge/React-18.x-blue.svg)](https://reactjs.org/)

[![Supabase](https://img.shields.io/badge/Supabase-Enabled-brightgreen.svg)](https://supabase.com/)[![Supabase](https://img.shields.io/badge/Supabase-Enabled-brightgreen.svg)](https://supabase.com/)

[![Docker](https://img.shields.io/badge/Docker-Ready-blue.svg)](https://docker.com/)[![Docker](https://img.shields.io/badge/Docker-Ready-blue.svg)](https://docker.com/)

[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)



## 📋 Tabla de Contenidos



- [🚀 Características](#-características)[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

- [🏗️ Arquitectura](#️-arquitectura)[![Docker](https://img.shields.io/badge/Docker-Ready-blue.svg)](docker-compose.yml)

- [⚡ Inicio Rápido](#-inicio-rápido)[![React](https://img.shields.io/badge/React-18+-61DAFB.svg)](app/package.json)

- [🔧 Configuración](#-configuración)[![TypeScript](https://img.shields.io/badge/TypeScript-5+-blue.svg)](app/tsconfig.json)

- [📚 Documentación](#-documentación)

- [🤝 Contribuir](#-contribuir)



## 🚀 Características## ✨ Características Principales## ✨ Características Principales



### 🏢 **Multi-tenancy**

- Aislamiento completo de datos por tenant

- Gestión de concesionarios y vendedores individuales- 🏢 **Multi-Tenancy**: Aislamiento completo de datos por tenant### 🏢 **Gestión Corporativa Multi-Sede**

- Configuración personalizable por tenant

- 🔐 **Seguridad RLS**: Row Level Security de PostgreSQL- **Sedes/Sucursales**: Gestión de múltiples ubicaciones por tenant

### 🚗 **Gestión de Vehículos**

- Catálogo completo con marcas y modelos- 📊 **Dashboards**: Interfaces específicas por rol (Admin, Seller, Buyer)- **Sistema de Leads**: Gestión completa de consultas de clientes

- Sistema de imágenes y características

- Filtros avanzados y búsqueda- 🚗 **Gestión de Vehículos**: Catálogo completo con imágenes y filtros- **Favoritos de Usuarios**: Sistema de marcado de vehículos preferidos

- Estados de vehículos (disponible, vendido, reservado)

- 📍 **Multi-Sede**: Gestión de múltiples sucursales por automotora- **Mensajería Integrada**: Comunicación entre vendedores y clientes

### 🔐 **Autenticación y Autorización**

- Integración con Supabase Auth- 💬 **Mensajería**: Sistema de comunicación cliente-vendedor

- Roles y permisos granulares

- Autenticación social (GitHub, Google)- ⭐ **Favoritos**: Sistema de marcado de vehículos preferidos### 👥 **Roles y Permisos**

- Row Level Security (RLS)

- 🎯 **Leads**: Gestión completa de leads y seguimiento- **🏢 Administrador Corporativo**: Control total de la organización

### 🎨 **Frontend Moderno**

- React 18 con TypeScript- **🏪 Gerente de Sede**: Administración de sucursal específica

- Vite para desarrollo rápido

- Componentes reutilizables## 🚀 Inicio Rápido- **💼 Vendedor**: Gestión de leads y vehículos asignados

- Responsive design

- **🛒 Comprador**: Navegación, favoritos y consultas

### 🛠️ **Backend Robusto**

- Node.js con Express### Prerequisitos

- API RESTful documentada

- Middleware de seguridad- Docker y Docker Compose### 🛡️ **Arquitectura Multi-Tenant Segura**

- Logging y monitoreo

- Node.js 18+- Aislamiento completo de datos por tenant

### 🐳 **Containerización**

- Docker Compose para desarrollo- Git- Row Level Security (RLS) en todas las tablas

- PostgreSQL y Redis incluidos

- Scripts de inicialización automática- Políticas de seguridad automatizadas



## 🏗️ Arquitectura### Instalación con Docker (Recomendado)- Gestión de roles granular



``````bash

┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐

│   Frontend      │    │   Backend API   │    │   Database      │# Clonar repositorio## 🚀 Inicio Rápido

│   React + TS    │◄──►│   Node.js       │◄──►│   PostgreSQL    │

│   Port: 5173    │    │   Port: 3001    │    │   Port: 5432    │git clone https://github.com/EstebanSalgad0/automarket-multitenant.git

└─────────────────┘    └─────────────────┘    └─────────────────┘

                                │cd automarket-multitenant### 1. **Configuración del Entorno**

                       ┌─────────────────┐

                       │   Supabase      │```bash

                       │   Auth + RLS    │

                       └─────────────────┘# Iniciar con Docker# Clonar repositorio

```

docker-compose up -dgit clone [repository-url]

### **Tecnologías Principales**

cd automarket-multitenant

- **Frontend**: React 18, TypeScript, Vite, TailwindCSS

- **Backend**: Node.js, Express, JWT, Bcrypt# Acceder a la aplicación

- **Base de Datos**: PostgreSQL 16, Supabase

- **Cache**: Redis 7open http://localhost:5173# Configurar variables de entorno

- **DevOps**: Docker, Docker Compose

- **Testing**: Jest, Cypress```cp app/.env.example app/.env



## ⚡ Inicio Rápido# Configurar credenciales de Supabase en app/.env



### **Prerequisitos**### Instalación Manual```



- Node.js 18.x o superior```bash

- Docker y Docker Compose

- Git# Instalar dependencias### 2. **Configurar Base de Datos**



### **1. Clonar el repositorio**cd app && npm install```bash



```bash# Ejecutar migración corporativa en Supabase SQL Editor

git clone https://github.com/EstebanSalgad0/automarket-multitenant.git

cd automarket-multitenant# Configurar variables de entorno# Usar: database/migrations/migration_simple.sql (versión limpia y funcional)

```

cp .env.example .env# Ver: database/README.md para más detalles

### **2. Instalar dependencias**

```

```bash

npm install# Iniciar desarrollo

```

npm run dev### 3. **Iniciar la Aplicación**

### **3. Configurar variables de entorno**

``````bash

```bash

# Copiar archivos de ejemplocd app

cp api/.env.example api/.env

cp app/.env.example app/.env## 📁 Estructura del Proyectonpm install



# Editar las variables necesariasnpm run dev

nano api/.env  # Configurar Supabase, DB, etc.

`````````



### **4. Iniciar servicios de desarrollo**automarket-multitenant/



```bash├── 📱 app/                    # Aplicación React + TypeScript### 4. **Acceder a la Aplicación**

# Opción 1: Con Docker (Recomendado)

docker-compose up -d│   ├── src/- **Frontend**: http://localhost:5173



# Opción 2: Desarrollo local│   │   ├── components/        # Componentes React- **Dashboards**: Corporativo, Gerente de Sede, Vendedor

npm run dev

```│   │   ├── services/          # Servicios API



### **5. Acceder a la aplicación**│   │   ├── hooks/            # React Hooks personalizados## 📁 **Estructura del Proyecto (Organizada)**



- **Frontend**: http://localhost:5173│   │   └── models/           # Tipos TypeScript

- **API**: http://localhost:3001

- **Documentación API**: http://localhost:3001/api-docs│   └── package.json```



## 🔧 Configuración├── 🗄️ database/              # Esquemas y migracionesautomarket-multitenant/



### **Variables de Entorno Principales**│   ├── migrations/           # Scripts de migración├── 📱 app/                           # 🎯 APLICACIÓN PRINCIPAL



#### **API (api/.env)**│   ├── schemas/              # Esquemas base│   ├── src/

```env

# Supabase│   └── seeds/                # Datos de prueba│   │   ├── components/              # React Components

SUPABASE_URL=https://tu-proyecto.supabase.co

SUPABASE_ANON_KEY=tu_anon_key├── ⚙️ config/                # Configuración del sistema│   │   │   ├── BranchList.tsx      # Gestión de sedes

SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key

├── 🐳 docker-compose.yml     # Orquestación de contenedores│   │   │   ├── LeadList.tsx        # Sistema de leads

# Base de Datos

POSTGRES_HOST=localhost├── 📚 docs/                  # Documentación completa│   │   │   ├── dashboards/         # Dashboards por rol

POSTGRES_PORT=5432

POSTGRES_DB=automarket│   ├── setup/               # Guías de instalación│   │   │   └── ...

POSTGRES_USER=postgres

POSTGRES_PASSWORD=postgres│   ├── docker/              # Documentación Docker│   │   ├── services/               # Servicios de API



# JWT│   ├── security/            # Documentación de seguridad│   │   │   ├── branchService.ts    # Gestión de sucursales

JWT_SECRET=tu_jwt_secret_super_seguro

```│   └── technical/           # Documentación técnica│   │   │   ├── leadService.ts      # Sistema de leads



#### **Frontend (app/.env)**└── 🔧 scripts/              # Scripts de utilidad│   │   │   ├── favoriteService.ts  # Favoritos

```env

VITE_API_URL=http://localhost:3001    └── docker/              # Scripts Docker│   │   │   └── messageService.ts   # Mensajería

VITE_SUPABASE_URL=https://tu-proyecto.supabase.co

VITE_SUPABASE_ANON_KEY=tu_anon_key```│   │   ├── models/                 # Tipos TypeScript

```

│   │   ├── lib/                    # Configuración

### **Estructura del Proyecto**

## 🛠️ Stack Tecnológico│   │   │   └── supabase.ts        # Cliente Supabase

```

automarket-multitenant/│   │   └── hooks/                  # React Hooks

├── api/                    # Backend API

│   ├── src/| Categoría | Tecnología | Descripción |│   ├── package.json

│   │   ├── controllers/    # Controladores

│   │   ├── middleware/     # Middleware personalizado|-----------|------------|-------------|│   └── .env                        # Variables de entorno

│   │   ├── routes/         # Rutas de la API

│   │   ├── services/       # Lógica de negocio| **Frontend** | React 18 + TypeScript | Interfaz moderna y tipada |├── 🗄️ database/                      # BASE DE DATOS

│   │   └── utils/          # Utilidades

│   ├── tests/              # Tests del backend| **Backend** | Supabase | Backend-as-a-Service |│   ├── migrations/                 # Scripts de migración

│   └── package.json

├── app/                    # Frontend React| **Base de Datos** | PostgreSQL 16 | Base de datos principal |│   │   ├── migration_simple.sql    # ✅ Migración principal

│   ├── src/

│   │   ├── components/     # Componentes React| **Cache** | Redis | Cache y sesiones |│   │   └── migration_corporate_fixed.sql # ✅ Migración completa

│   │   ├── hooks/          # Custom hooks

│   │   ├── services/       # Servicios API| **Containerización** | Docker + Compose | Entorno containerizado |│   ├── schemas/                    # Esquemas base

│   │   └── utils/          # Utilidades

│   └── package.json| **Styling** | CSS3 + Modules | Estilos modulares |│   │   ├── schema.sql             # Esquema inicial

├── db/                     # Scripts de base de datos

├── docs/                   # Documentación│   │   └── setup_ultra_safe.sql   # Configuración RLS

├── scripts/                # Scripts de utilidad

├── docker-compose.yml      # Configuración Docker## 🎯 Funcionalidades por Rol│   └── README.md                   # Documentación BD

└── README.md

```├── ⚙️ config/                        # CONFIGURACIÓN



## 📚 Documentación### 👤 Compradores (Buyers)│   ├── docker-compose.yml         # Contenedores Docker



- [📖 **API Documentation**](docs/api/README.md) - Endpoints y ejemplos- Explorar catálogo de vehículos│   └── README.md                   # Guía de configuración

- [🚀 **Deployment Guide**](docs/deployment/README.md) - Guía de despliegue

- [🔧 **Development Setup**](docs/development/README.md) - Configuración de desarrollo- Filtros avanzados de búsqueda├── � docs/                          # DOCUMENTACIÓN

- [🏗️ **Architecture Guide**](docs/architecture/README.md) - Arquitectura del sistema

- Sistema de favoritos│   ├── setup/                      # Guías de instalación

## 🧪 Testing

- Contacto directo con vendedores│   ├── github/                     # Templates GitHub

```bash

# Ejecutar todos los tests- Historial de consultas│   ├── manual-tests/               # Pruebas manuales

npm test

│   └── README.md                   # Índice de documentación

# Tests del backend

npm run test:api### 🏪 Vendedores (Sellers)├── 📊 db/init.sql                    # Datos iniciales (Docker)



# Tests del frontend- Gestión de inventario de vehículos├── 🔧 scripts/                       # Scripts de utilidad

npm run test:app

- Dashboard de leads y ventas└── 📖 README.md                      # Esta documentación

# Coverage

npm run test:coverage- Administración de sucursales```

```

- Sistema de mensajería

## 📦 Comandos Disponibles

- Reportes de actividad## 🎯 **Funcionalidades Implementadas**

```bash

# Desarrollo

npm run dev              # Iniciar frontend y backend

npm run dev:api          # Solo backend### 🏢 Administradores Corporativos### ✅ **Sistema Corporativo Multi-Sede**

npm run dev:app          # Solo frontend

- Vista global de todas las sedes- [x] **4 Nuevas Tablas**: branches, leads, favorites, messages

# Construcción

npm run build            # Build completo- Gestión de empleados- [x] **Roles Avanzados**: corporate_admin, branch_manager, sales_person, buyer

npm run build:api        # Build backend

npm run build:app        # Build frontend- Métricas y analytics- [x] **Dashboards por Rol**: 3 interfaces especializadas



# Linting y formateo- Configuración de permisos- [x] **Gestión de Sucursales**: CRUD completo con estadísticas

npm run lint             # Lint completo

npm run lint:fix         # Corregir lint automáticamente- Auditoría completa- [x] **Sistema de Leads**: Gestión completa de consultas

npm run format           # Formatear código

- [x] **Favoritos**: Sistema de marcado de vehículos

# Base de datos

npm run db:migrate       # Ejecutar migraciones## 🔐 Seguridad y Multi-Tenancy- [x] **Mensajería**: Comunicación integrada

npm run db:seed          # Poblar con datos de ejemplo

npm run db:reset         # Resetear base de datos

```

- **Row Level Security (RLS)**: Políticas a nivel de base de datos### ✅ **Base Multi-Tenant Segura**

## 🚀 Stack Tecnológico

- **Aislamiento de Tenants**: Separación completa de datos- [x] **Aislamiento por Tenant**: RLS en todas las tablas

| Categoría | Tecnología | Versión | Descripción |

|-----------|------------|---------|-------------|- **Autenticación**: JWT con Supabase Auth- [x] **2 Tenants de Ejemplo**: Toyota Centro, Carlos Pérez Motors

| **Frontend** | React | 18.x | Librería UI moderna |

| **Language** | TypeScript | 5.x | Tipado estático |- **Autorización**: Sistema de roles granular- [x] **PK Compuesta**: tenant_id + id para máxima seguridad

| **Build Tool** | Vite | 7.x | Build tool rápido |

| **Backend** | Node.js | 18.x | Runtime JavaScript |- **Auditoría**: Logs completos de actividad- [x] **Políticas RLS**: Automáticas y granulares

| **Framework** | Express | 4.x | Framework web |

| **Database** | PostgreSQL | 16.x | Base de datos relacional |- [x] **Supabase**: Base de datos en la nube completamente funcional

| **BaaS** | Supabase | Latest | Backend-as-a-Service |

| **Cache** | Redis | 7.x | Cache en memoria |## 📊 Casos de Uso

| **Container** | Docker | Latest | Containerización |

## 🛠️ **Stack Tecnológico**

## 🛡️ Seguridad

### Automotoras Multi-Sede

### **Multi-Tenancy**

- Aislamiento completo de datos por tenant- **Toyota Centro**: 3 sucursales en CDMX### **Frontend**

- Row Level Security (RLS) en PostgreSQL

- Políticas granulares por tabla- **Nissan Premium**: 2 ubicaciones metropolitanas- **React 18** con TypeScript



### **Autenticación**- **Ford Corporativo**: Red nacional de concesionarios- **Vite** para desarrollo y build

- JWT tokens seguros

- Supabase Auth integration- **CSS Modules** para estilos

- Rate limiting

- Validación de entrada### Usuarios Típicos- **Supabase** cliente JavaScript



### **Base de Datos**- **Compradores**: Personas buscando vehículos

- Conexiones cifradas

- Preparación de queries (SQL injection prevention)- **Vendedores**: Personal de ventas de concesionarios### **Backend**

- Auditoría de transacciones

- Backups automáticos- **Gerentes**: Administradores de sucursales- **Supabase** (PostgreSQL + Auth + API)



## 🤝 Contribuir- **Directivos**: Vista corporativa consolidada- **Row Level Security (RLS)**



1. Fork el proyecto- **PostgreSQL 16** con extensiones

2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)

3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)## 🚀 Desarrollo

4. Push a la rama (`git push origin feature/AmazingFeature`)

5. Abre un Pull Request### **Desarrollo**



Ver [CONTRIBUTING.md](CONTRIBUTING.md) para más detalles.### Comandos Útiles- **Git** control de versiones



## 📝 Roadmap```bash- **npm** gestión de dependencias



### **v1.1 - Q1 2026**# Desarrollo local- **Estructura modular** con servicios

- [ ] Sistema de notificaciones

- [ ] Dashboard analyticsnpm run dev

- [ ] Exportación de reportes

- [ ] API REST completa## 🔐 **Seguridad y Aislamiento**



### **v1.2 - Q2 2026**# Build de producción

- [ ] Aplicación móvil

- [ ] Integración con WhatsAppnpm run build### **Multi-Tenant por Diseño**

- [ ] Sistema de pagos

- [ ] Chat en tiempo real- ✅ **Row Level Security (RLS)**: Aislamiento automático por tenant



## 📄 Licencia# Ejecutar tests- ✅ **Políticas Granulares**: Control de acceso por rol y recurso



Este proyecto está bajo la Licencia MIT. Ver [LICENSE](LICENSE) para más detalles.npm run test- ✅ **Tenant ID**: Todas las tablas incluyen identificador de organización



## 👥 Autores- ✅ **Supabase Auth**: Autenticación y autorización integrada



- **Esteban Salgado** - *Desarrollo inicial* - [@EstebanSalgad0](https://github.com/EstebanSalgad0)# Docker desarrollo



## 🙏 Agradecimientosdocker-compose -f docker-compose.yml up --profile development### **Roles y Permisos**



- [Supabase](https://supabase.com/) por la infraestructura backend```typescript

- [React](https://reactjs.org/) por el framework frontend

- [Node.js](https://nodejs.org/) por el runtime backend# Docker produccióntype UserRole = 

- [PostgreSQL](https://postgresql.org/) por la base de datos

- [Docker](https://docker.com/) por la containerizacióndocker-compose -f docker-compose.yml up --profile production  | 'corporate_admin'   // Acceso total a la organización



## 📊 Estado del Proyecto```  | 'branch_manager'    // Gestión de sucursal específica  



```  | 'sales_person'      // Leads y vehículos asignados

Completado: ████████████████████████████████ 85%

```### Variables de Entorno  | 'buyer'             // Solo lectura y favoritos



### **✅ Completado**Consulta `.env.example` para las configuraciones requeridas.```

- Configuración inicial del proyecto

- Integración con Supabase

- Frontend React con TypeScript

- Backend API con Node.js## 📚 Documentación## 📊 **Datos de Ejemplo Incluidos**

- Base de datos PostgreSQL

- Docker configuration

- Documentación básica

| Documento | Descripción |### **🏢 Sucursales Corporativas**

### **🔄 En Desarrollo**

- Sistema de autenticación completo|-----------|-------------|- **AutoMarket Las Condes** (Santiago, Metropolitana)

- API REST endpoints

- Testing automatizado| [🚀 QUICK_START.md](QUICK_START.md) | Guía de inicio rápido |- **AutoMarket Providencia** (Santiago, Metropolitana)  

- CI/CD pipeline

| [📚 docs/README.md](docs/README.md) | Índice de documentación |- **AutoMarket Valparaíso** (Valparaíso, Valparaíso)

### **📋 Próximas Tareas**

- Deployment a producción| [🗄️ database/README.md](database/README.md) | Guía de base de datos |

- Mobile responsive improvements

- Performance optimization| [🐳 docs/docker/](docs/docker/) | Documentación Docker |### **👥 Usuarios por Tenant**

- Security audit

| [🔐 docs/security/](docs/security/) | Documentación de seguridad |- **Administradores Corporativos**: Control total

---

- **Gerentes de Sede**: Gestión local

<div align="center">

## 🧪 Testing y Verificación- **Vendedores**: Leads asignados

**[⬆ Volver arriba](#-automarket-multitenant)**

- **Compradores**: Navegación y favoritos

Made with ❤️ by [EstebanSalgad0](https://github.com/EstebanSalgad0)

### Tests Manuales

</div>
- [Pruebas Multi-Tenant](docs/manual-tests/)## 🧪 **Testing y Verificación**

- [Verificación RLS](database/RLS_TESTING.sql)

### **Verificar Base de Datos**

### Validación de Datos```bash

```sql# Conectar a PostgreSQL local

-- Verificar aislamiento de tenants./scripts/psql.sh

SELECT tenant_id, COUNT(*) FROM vehicles GROUP BY tenant_id;

```# Verificar datos multi-tenant

\i scripts/verify_tenant.sql

## 🤝 Contribución```



1. Fork el proyecto### **Verificar Migración**

2. Crea una rama feature (`git checkout -b feature/AmazingFeature`)```sql

3. Commit tus cambios (`git commit -m 'Add AmazingFeature'`)-- Ejecutar en Supabase SQL Editor para verificar

4. Push a la rama (`git push origin feature/AmazingFeature`)SELECT tablename, column_count 

5. Abre un Pull RequestFROM (

  SELECT tablename, 

## 📝 Licencia         (SELECT count(*) FROM information_schema.columns 

          WHERE table_name = t.tablename) as column_count

Este proyecto está bajo la Licencia MIT - consulta el archivo [LICENSE](LICENSE) para más detalles.  FROM pg_tables t

  WHERE schemaname = 'public' 

## 📧 Autor  AND tablename IN ('branches', 'leads', 'favorites', 'messages')

) ORDER BY tablename;

**EstebanSalgad0**  ```

📫 Contacto: [GitHub Profile](https://github.com/EstebanSalgad0)

## 🚀 **Próximos Pasos**

---

### **Desarrollo Inmediato**

⭐ **Si este proyecto te resulta útil, no olvides darle una estrella en GitHub**- [ ] **Autenticación**: Integrar Supabase Auth con roles
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
