#!/bin/bash
# =====================================
# Script de Producción - AutoMarket
# =====================================
# Despliega el entorno de producción

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para logging
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

success() {
    echo -e "${GREEN}✅ $1${NC}"
}

warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

error() {
    echo -e "${RED}❌ $1${NC}"
}

# Banner
echo -e "${GREEN}"
echo "================================="
echo "🚀 AutoMarket - Despliegue Producción"
echo "================================="
echo -e "${NC}"

# Verificaciones de seguridad
ENV_FILE=".env.production"
if [ ! -f "$ENV_FILE" ]; then
    error "Archivo $ENV_FILE no encontrado"
    error "Copie .env.production.example y configure las variables"
    exit 1
fi

# Cargar variables
export $(grep -v '^#' $ENV_FILE | xargs)

# Verificar variables críticas
REQUIRED_VARS=(
    "POSTGRES_PASSWORD"
    "REDIS_PASSWORD"
    "VITE_SUPABASE_URL"
    "VITE_SUPABASE_ANON_KEY"
)

for var in "${REQUIRED_VARS[@]}"; do
    if [ -z "${!var}" ]; then
        error "Variable requerida $var no está configurada"
        exit 1
    fi
done

# Verificar contraseñas por defecto
if [[ "$POSTGRES_PASSWORD" == *"CHANGE_THIS"* ]]; then
    error "Debe cambiar la contraseña por defecto de PostgreSQL"
    exit 1
fi

if [[ "$REDIS_PASSWORD" == *"CHANGE_THIS"* ]]; then
    error "Debe cambiar la contraseña por defecto de Redis"
    exit 1
fi

log "✅ Verificaciones de seguridad pasadas"

# Crear backup antes de despliegue
if [ "$1" = "--backup" ]; then
    log "Creando backup de la base de datos..."
    ./scripts/backup.sh
fi

# Construir imágenes de producción
log "Construyendo imágenes de producción..."
docker-compose --profile production build --no-cache

# Detener servicios existentes
log "Deteniendo servicios existentes..."
docker-compose down

# Iniciar servicios de producción
log "Iniciando servicios de producción..."
docker-compose --profile production up -d

# Esperar a que los servicios estén listos
log "Esperando a que los servicios estén listos..."
sleep 30

# Verificar salud de los servicios
log "Verificando salud de los servicios..."
if ! docker-compose exec -T frontend curl -f http://localhost/health &> /dev/null; then
    warning "El frontend no responde al health check"
fi

if ! docker-compose exec -T database pg_isready -U $POSTGRES_USER -d $POSTGRES_DB &> /dev/null; then
    error "La base de datos no está lista"
    exit 1
fi

# Mostrar status
echo ""
log "Estado de los servicios:"
docker-compose --profile production ps

echo ""
success "¡Despliegue de producción completado!"
echo ""
echo -e "${YELLOW}📋 Servicios de producción:${NC}"
echo "   🌐 Frontend:          http://localhost:${FRONTEND_PORT:-80}"
echo "   📊 Database:          localhost:${POSTGRES_PORT:-5432}"
echo "   🗃️  Redis:            localhost:${REDIS_PORT:-6379}"
echo ""

if docker-compose --profile monitoring ps | grep -q "Up"; then
    echo -e "${YELLOW}📊 Monitoring:${NC}"
    echo "   📈 Prometheus:        http://localhost:${PROMETHEUS_PORT:-9090}"
    echo "   📊 Grafana:           http://localhost:${GRAFANA_PORT:-3000}"
    echo ""
fi

echo -e "${BLUE}💡 Comandos de mantenimiento:${NC}"
echo "   📋 Ver logs:          docker-compose logs -f"
echo "   🔄 Reiniciar:         docker-compose restart"
echo "   🛑 Detener:           docker-compose down"
echo "   💾 Backup:            ./scripts/backup.sh"
echo "   🔄 Actualizar:        ./scripts/update.sh"
echo ""

log "✅ Despliegue finalizado exitosamente"