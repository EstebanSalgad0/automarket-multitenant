# AutoMarket MultiTenant

Sistema de marketplace de vehículos multi-tenant que permite a automotoras y vendedores particulares gestionar sus inventarios de forma independiente y segura.

## 🚗 Descripción del Proyecto

AutoMarket es una plataforma que conecta compradores con vendedores de vehículos, soportando dos tipos de vendedores:
- **Automotoras**: Con múltiples vendedores y administración centralizada
- **Vendedores Particulares**: Usuarios independientes que venden sus propios vehículos

## 🏗️ Arquitectura Multi-Tenant

### Tipos de Usuarios
- **Automotora Admin**: Administrador de una automotora (tenant)
- **Vendedor de Automotora**: Empleado que publica vehículos para la automotora
- **Vendedor Particular**: Usuario independiente con su propio tenant
- **Comprador**: Visualiza vehículos y contacta vendedores

### Modelo de Datos
- Todas las tablas de dominio incluyen `tenant_id`
- PK compuesta (`tenant_id`, `id`) para aislamiento
- Row Level Security (RLS) para reforzar aislamiento
- Tablas principales: `tenants`, `users`, `tenant_users`, `vehicles`, `interactions`, `transactions`

## 🚀 Quick Start

### 1. Configuración inicial
```bash
# Copiar variables de entorno
cp .env.example .env
```

### 2. Levantar servicios
```bash
docker compose up -d
```

### 3. Acceder a Adminer (Cliente de BD)
- **URL**: http://localhost:8080
- **Sistema**: PostgreSQL
- **Servidor**: db
- **Usuario**: `saas_user`
- **Contraseña**: `saas_pass`
- **Base de datos**: `saas`

## 📁 Estructura del Proyecto

```
├── .github/workflows/ci.yml    # CI: valida init.sql contra Postgres
├── .gitignore
├── .env.example
├── README.md
├── docker-compose.yml
├── db/
│   ├── init.sql               # Esquema + datos de ejemplo (2 tenants)
│   └── seed/                  # Scripts adicionales
├── docs/
│   ├── one-pager.md          # Plantilla one-pager
│   ├── pitch-outline.md      # Guía pitch (8–12 slides)
│   ├── architecture-c4.md    # Esqueleto C4 L1–L2
│   ├── changelog.md          # Cambios por semana
│   └── weekly-deliverables/   # Entregas por semana
├── scripts/
│   ├── psql.sh               # Conectar a la DB
│   └── verify_tenant.sql     # Consultas de ejemplo
├── api/                      # Backend API
└── app/                      # Frontend React
```

## 🎯 Funcionalidades Implementadas

### ✅ Semana 2 - Modelo de Datos + Tenant
- [x] 2 tenants con datos de ejemplo (Toyota Centro, Carlos Pérez Motors)
- [x] Modelo multi-tenant con `tenant_id` en todas las tablas
- [x] PK compuesta para aislamiento
- [x] Row Level Security (RLS)
- [x] 4 tipos de usuarios diferenciados
- [x] Entidades: vehículos, interacciones, transacciones

### 🔄 Próximas Entregas
- **S3 (02/10)**: API Base CRUD con scoping por tenant
- **S4 (09/10)**: Auth + Roles por Tenant
- **S5 (16/10)**: MVP Navegable
- **Final (23/10)**: Proyecto completo + demo

## 🛠️ Tecnologías

- **Frontend**: React + Vite + TypeScript
- **Backend**: Node.js + Express (planificado)
- **Base de datos**: PostgreSQL 16
- **Contenedores**: Docker + Docker Compose
- **Cliente DB**: Adminer
- **CI/CD**: GitHub Actions

## 🔐 Seguridad

- Aislamiento completo entre tenants via RLS
- Autenticación JWT (planificado)
- Roles diferenciados por tipo de usuario
- Variables de entorno para secretos
- Validaciones de integridad en BD

## 📊 Datos de Ejemplo

### Tenants
1. **Toyota Centro** (automotora)
   - Admin: Roberto García
   - Vendedores: Ana López, Miguel Torres
   - 5 vehículos Toyota

2. **Carlos Pérez Motors** (particular)
   - Vendedor: Carlos Pérez
   - 2 vehículos (Honda, Volkswagen)

### Compradores
- María González, Juan Martínez, Luis Ramírez
- Interacciones activas con vendedores

## 🧪 Testing

```bash
# Conectar a la base de datos
./scripts/psql.sh

# Ejecutar consultas de verificación
\i scripts/verify_tenant.sql
```

## 📈 Roadmap

- [ ] API REST con endpoints CRUD
- [ ] Autenticación y autorización
- [ ] Frontend navegable
- [ ] Sistema de citas y contactos
- [ ] Notificaciones por email
- [ ] Documentación API (OpenAPI)

## 🤝 Contribución

Ver `docs/CONTRIBUTING.md` para guías de contribución.

## 📝 Licencia

Ver archivo `LICENSE` para detalles.

---

**Estudiante**: EstebanSalgad0  
**Curso**: Desarrollo de Aplicaciones Web Multi-Tenant  
**Versión**: v0.2 (Modelo de Datos + Tenant)

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
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

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
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
