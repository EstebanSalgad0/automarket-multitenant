# 🐳 Guía Completa de Docker - AutoMarket MultiTenant

Esta guía te ayudará a ejecutar AutoMarket MultiTenant usando Docker, tanto para desarrollo como para producción.

## 📋 Requisitos Previos

- **Docker**: Versión 20.10 o superior
- **Docker Compose**: Versión 2.0 o superior
- **Git**: Para clonar el repositorio
- **8GB RAM**: Mínimo recomendado
- **20GB espacio libre**: Para imágenes y volúmenes

### Verificar Instalación

```bash
docker --version
docker-compose --version
```

## 🚀 Inicio Rápido

### Desarrollo Local

```bash
# Clonar repositorio
git clone https://github.com/EstebanSalgad0/automarket-multitenant.git
cd automarket-multitenant

# Configurar variables de entorno
cp .env.development .env

# Iniciar entorno de desarrollo (Linux/Mac)
./scripts/docker/dev.sh

# Iniciar entorno de desarrollo (Windows)
scripts\docker\dev.bat
```

### Producción

```bash
# Configurar variables de producción
cp .env.production .env
# Editar .env con valores reales

# Desplegar en producción
./scripts/docker/prod.sh --backup
```

## 🏗️ Arquitectura Docker

### Servicios Incluidos

| Servicio | Descripción | Puerto | Perfil |
|----------|-------------|--------|--------|
| `database` | PostgreSQL 16 | 5432 | Siempre |
| `redis` | Cache y sesiones | 6379 | Siempre |
| `frontend-dev` | React + Vite (Dev) | 5173 | development |
| `frontend` | Nginx + React (Prod) | 80 | production |
| `adminer` | Gestor BD web | 8080 | tools |
| `pgadmin` | Gestor BD avanzado | 8081 | tools |
| `prometheus` | Monitoring | 9090 | monitoring |
| `grafana` | Dashboards | 3000 | monitoring |

### Perfiles de Docker Compose

- **development**: Entorno de desarrollo con hot-reload
- **production**: Entorno optimizado para producción
- **tools**: Herramientas de administración
- **monitoring**: Sistema de monitoreo

## 🔧 Configuración Detallada

### Variables de Entorno

#### Desarrollo (.env.development)
```env
# Base de datos
POSTGRES_DB=automarket_dev
POSTGRES_USER=automarket_user
POSTGRES_PASSWORD=dev_password_123

# Supabase
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Puertos
FRONTEND_DEV_PORT=5173
ADMINER_PORT=8080
PGADMIN_PORT=8081
```

#### Producción (.env.production)
```env
# Base de datos (¡Cambiar contraseñas!)
POSTGRES_DB=automarket_prod
POSTGRES_USER=automarket_prod_user
POSTGRES_PASSWORD=STRONG_PASSWORD_HERE

# Redis
REDIS_PASSWORD=STRONG_REDIS_PASSWORD

# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_production_key_here
```

### Dockerfile Multi-Stage

El `app/Dockerfile` usa construcción multi-stage:

1. **builder**: Instala dependencias y compila React
2. **production**: Nginx optimizado para servir archivos
3. **development**: Node.js con hot-reload

## 🛠️ Comandos Útiles

### Gestión de Servicios

```bash
# Iniciar todos los servicios de desarrollo
docker-compose --profile development up -d

# Iniciar solo servicios específicos
docker-compose up -d database redis

# Ver logs en tiempo real
docker-compose logs -f

# Ver logs de un servicio específico
docker-compose logs -f frontend-dev

# Reiniciar un servicio
docker-compose restart frontend-dev

# Detener todos los servicios
docker-compose down

# Detener y eliminar volúmenes
docker-compose down -v
```

### Construcción de Imágenes

```bash
# Construir todas las imágenes
docker-compose build

# Construir sin cache
docker-compose build --no-cache

# Construir imagen específica
docker-compose build frontend
```

### Base de Datos

```bash
# Ejecutar comando en PostgreSQL
docker-compose exec database psql -U $POSTGRES_USER -d $POSTGRES_DB

# Ejecutar script SQL
docker-compose exec -T database psql -U $POSTGRES_USER -d $POSTGRES_DB < script.sql

# Crear backup
docker-compose exec database pg_dump -U $POSTGRES_USER $POSTGRES_DB > backup.sql

# Restaurar backup
docker-compose exec -T database psql -U $POSTGRES_USER -d $POSTGRES_DB < backup.sql
```

## 🔍 Debugging y Troubleshooting

### Problemas Comunes

#### Puerto ya en uso
```bash
# Encontrar proceso usando el puerto
netstat -tulpn | grep :5173
lsof -i :5173

# Cambiar puerto en .env
FRONTEND_DEV_PORT=5174
```

#### Permisos de archivos
```bash
# Corregir permisos en Linux/Mac
sudo chown -R $USER:$USER ./app/node_modules
chmod +x scripts/docker/*.sh
```

#### Base de datos no responde
```bash
# Verificar logs de la base de datos
docker-compose logs database

# Recrear volumen de base de datos
docker-compose down -v
docker volume rm automarket-multitenant_postgres_data
docker-compose up -d database
```

### Logs y Monitoreo

```bash
# Ver logs de todos los servicios
docker-compose logs

# Seguir logs específicos
docker-compose logs -f --tail=100 frontend-dev

# Verificar recursos
docker stats

# Inspeccionar contenedor
docker inspect automarket-frontend-dev
```

## 🚀 Despliegue en Producción

### Pre-despliegue

1. **Configurar variables de entorno**:
   ```bash
   cp .env.production .env
   # Editar .env con valores reales
   ```

2. **Verificar configuración**:
   ```bash
   # El script verifica automáticamente
   ./scripts/docker/prod.sh
   ```

3. **Crear backup** (recomendado):
   ```bash
   ./scripts/docker/backup.sh --full
   ```

### Despliegue

```bash
# Despliegue completo con backup
./scripts/docker/prod.sh --backup

# Solo despliegue
./scripts/docker/prod.sh
```

### Post-despliegue

1. **Verificar servicios**:
   ```bash
   docker-compose --profile production ps
   curl http://localhost/health
   ```

2. **Configurar monitoreo** (opcional):
   ```bash
   docker-compose --profile production --profile monitoring up -d
   ```

3. **Configurar SSL** (recomendado):
   - Usar Let's Encrypt con Certbot
   - Configurar reverse proxy
   - Actualizar docker-compose para HTTPS

## 📊 Monitoreo y Mantenimiento

### Prometheus + Grafana

```bash
# Iniciar monitoreo
docker-compose --profile monitoring up -d

# Acceder a dashboards
open http://localhost:9090  # Prometheus
open http://localhost:3000  # Grafana (admin:admin123)
```

### Backups Automáticos

```bash
# Backup manual
./scripts/docker/backup.sh

# Backup completo con volúmenes
./scripts/docker/backup.sh --full

# Configurar cron para backups automáticos
crontab -e
# Agregar: 0 2 * * * /path/to/automarket/scripts/docker/backup.sh
```

### Actualizaciones

```bash
# Actualizar código
git pull origin main

# Reconstruir y redesplegar
docker-compose --profile production build --no-cache
docker-compose --profile production up -d
```

## 🔒 Seguridad

### Mejores Prácticas

1. **Contraseñas fuertes**: Cambiar contraseñas por defecto
2. **Variables de entorno**: No commitear archivos .env
3. **Usuario no-root**: Los contenedores usan usuarios no privilegiados
4. **Red privada**: Servicios en red Docker privada
5. **Health checks**: Monitoreo automático de servicios

### Firewall y Red

```bash
# Solo exponer puertos necesarios
ufw allow 80/tcp
ufw allow 443/tcp
ufw deny 5432/tcp  # PostgreSQL no debe ser público
```

## 📚 Scripts Disponibles

| Script | Descripción | Uso |
|--------|-------------|-----|
| `dev.sh` | Entorno desarrollo | `./scripts/docker/dev.sh` |
| `dev.bat` | Desarrollo Windows | `scripts\docker\dev.bat` |
| `prod.sh` | Despliegue producción | `./scripts/docker/prod.sh` |
| `backup.sh` | Backup de datos | `./scripts/docker/backup.sh` |

## 🆘 Soporte

### Logs Importantes

```bash
# Logs de aplicación
docker-compose logs frontend

# Logs de base de datos
docker-compose logs database

# Logs del sistema
journalctl -u docker
```

### Contacto

- **Issues**: GitHub Issues
- **Documentación**: [README.md](../README.md)
- **Wiki**: GitHub Wiki

---

## 🎉 ¡Listo!

Tu aplicación AutoMarket MultiTenant ahora está completamente dockerizada y lista para desarrollo y producción. 

### Próximos Pasos:

1. ✅ Configurar variables de entorno
2. ✅ Ejecutar entorno de desarrollo
3. ✅ Probar funcionalidad básica
4. ✅ Configurar Supabase
5. ✅ Desplegar en producción

**¡Happy coding! 🚀**