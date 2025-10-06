# 🚀 AutoMarket MultiTenant - Navegación Rápida

## 📂 Accesos Directos

### 🎯 **Desarrollo**
- **Aplicación Principal**: [`/app`](./app/) - React + TypeScript + Vite
- **Iniciar Desarrollo**: `cd app && npm run dev`
- **Configurar Entorno**: [`/app/.env`](./app/.env)

### 🗄️ **Base de Datos**
- **Migraciones**: [`/database/migrations`](./database/migrations/)
- **Esquemas**: [`/database/schemas`](./database/schemas/)
- **Guía**: [`/database/README.md`](./database/README.md)

### ⚙️ **Configuración**
- **Docker**: [`/config/docker-compose.yml`](./config/docker-compose.yml)
- **Scripts**: [`/scripts`](./scripts/)
- **Guía**: [`/config/README.md`](./config/README.md)

### 📚 **Documentación**
- **Configuración**: [`/docs/setup`](./docs/setup/)
- **GitHub**: [`/docs/github`](./docs/github/)
- **Pruebas**: [`/docs/manual-tests`](./docs/manual-tests/)

## 🔗 **Enlaces Principales**

| Componente | Ubicación | Descripción |
|------------|-----------|-------------|
| **🎯 Frontend** | [`/app/src`](./app/src/) | Aplicación React principal |
| **🔧 Servicios** | [`/app/src/services`](./app/src/services/) | API services (Branch, Lead, etc.) |
| **📊 Componentes** | [`/app/src/components`](./app/src/components/) | React components |
| **🗄️ Migración** | [`/database/migrations/migration_simple.sql`](./database/migrations/migration_simple.sql) | Script de migración recomendado |
| **⚙️ Docker** | [`/config/docker-compose.yml`](./config/docker-compose.yml) | Configuración de contenedores |

## 🚀 **Comandos Rápidos**

```bash
# Desarrollo
cd app && npm install && npm run dev

# Docker (desarrollo local)
docker compose -f config/docker-compose.yml up -d

# Base de datos
# Ejecutar: database/migrations/migration_simple.sql en Supabase
```

---
**Ver documentación completa**: [README.md](./README.md)