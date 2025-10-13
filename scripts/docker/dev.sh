#!/bin/bash
# =====================================
# Script de Desarrollo - AutoMarket
# =====================================
# Inicia el entorno completo de desarrollo

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
echo "=================================="
echo "🚀 AutoMarket - Entorno Desarrollo"
echo "=================================="
echo -e "${NC}"

# Verificar Docker
if ! command -v docker &> /dev/null; then
    error "Docker no está instalado"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    error "Docker Compose no está instalado"
    exit 1
fi

# Verificar archivo de entorno
ENV_FILE=".env.development"
if [ ! -f "$ENV_FILE" ]; then
    warning "Archivo $ENV_FILE no encontrado, copiando desde ejemplo..."
    cp ".env.example" "$ENV_FILE" 2>/dev/null || true
fi

log "Cargando variables de entorno desde $ENV_FILE"
export $(grep -v '^#' $ENV_FILE | xargs)

# Construir imágenes si es necesario
log "Construyendo imágenes de Docker..."
docker-compose --profile development build --parallel

# Iniciar servicios base
log "Iniciando servicios base (base de datos, Redis)..."
docker-compose --profile development up -d database redis

# Esperar a que la base de datos esté lista
log "Esperando a que la base de datos esté lista..."
timeout=60
counter=0
while ! docker-compose exec -T database pg_isready -U $POSTGRES_USER -d $POSTGRES_DB &> /dev/null; do
    if [ $counter -eq $timeout ]; then
        error "Timeout esperando la base de datos"
        exit 1
    fi
    sleep 1
    counter=$((counter + 1))
    echo -n "."
done
echo ""
success "Base de datos lista"

# Ejecutar migraciones si es necesario
log "Verificando migraciones de base de datos..."
# Aquí podrías agregar lógica para ejecutar migraciones

# Iniciar servicios de desarrollo
log "Iniciando servicios de desarrollo..."
docker-compose --profile development --profile tools up -d

# Mostrar status
echo ""
log "Estado de los servicios:"
docker-compose --profile development ps

echo ""
success "¡Entorno de desarrollo listo!"
echo ""
echo -e "${YELLOW}📋 Servicios disponibles:${NC}"
echo "   🌐 Frontend (Dev):     http://localhost:${FRONTEND_DEV_PORT:-5173}"
echo "   🗄️  Adminer:          http://localhost:${ADMINER_PORT:-8080}"
echo "   🔧 PgAdmin:           http://localhost:${PGADMIN_PORT:-8081}"
echo "   📊 Database:          localhost:${POSTGRES_PORT:-5432}"
echo "   🗃️  Redis:            localhost:${REDIS_PORT:-6379}"
echo ""
echo -e "${BLUE}💡 Comandos útiles:${NC}"
echo "   📋 Ver logs:          docker-compose logs -f"
echo "   🔄 Reiniciar:         docker-compose restart"
echo "   🛑 Detener:           docker-compose down"
echo "   🧹 Limpiar:           docker-compose down -v --remove-orphans"
echo ""

# Seguir logs si se solicita
if [ "$1" = "--logs" ] || [ "$1" = "-l" ]; then
    log "Siguiendo logs de todos los servicios..."
    docker-compose --profile development logs -f
fi