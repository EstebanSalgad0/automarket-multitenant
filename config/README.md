# ⚙️ Configuración - AutoMarket MultiTenant

Esta carpeta contiene archivos de configuración del sistema.

## 📁 Archivos de Configuración

### `docker-compose.yml`
Configuración de contenedores Docker para desarrollo local con PostgreSQL y Adminer.

**Servicios incluidos:**
- **PostgreSQL 16** - Base de datos principal
- **Adminer** - Cliente web de base de datos

**Puertos:**
- **5432** - PostgreSQL
- **8080** - Adminer Web Interface

### Uso con Docker
```bash
# Iniciar servicios
docker compose up -d

# Parar servicios
docker compose down

# Acceder a Adminer
http://localhost:8080
```

### Credenciales por Defecto
```
Sistema: PostgreSQL
Servidor: db
Usuario: saas_user
Contraseña: saas_pass
Base de datos: saas
```

## 🔧 Variables de Entorno

Las variables de entorno principales están en:
- `/app/.env` - Configuración de la aplicación React
- `/.env.example` - Plantilla de variables de entorno

### Variables Requeridas
```bash
# Supabase
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_SUPABASE_PROJECT_ID=your_project_id
```

---
**Nota**: Para desarrollo en la nube se recomienda usar Supabase directamente.