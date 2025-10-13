#!/bin/bash
# =====================================
# Script de Backup - AutoMarket
# =====================================
# Realiza backup de base de datos y archivos importantes

set -e

# Configuración
BACKUP_DIR="./backups/$(date +%Y-%m-%d)"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Colores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

success() {
    echo -e "${GREEN}✅ $1${NC}"
}

warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Banner
echo -e "${GREEN}"
echo "================================="
echo "💾 AutoMarket - Backup"
echo "================================="
echo -e "${NC}"

# Crear directorio de backup
mkdir -p "$BACKUP_DIR"

# Cargar variables de entorno
if [ -f ".env.production" ]; then
    export $(grep -v '^#' .env.production | xargs)
elif [ -f ".env.development" ]; then
    export $(grep -v '^#' .env.development | xargs)
else
    warning "No se encontró archivo de configuración"
fi

# Backup de base de datos
log "Creando backup de PostgreSQL..."
DB_BACKUP_FILE="$BACKUP_DIR/database_$TIMESTAMP.sql"
docker-compose exec -T database pg_dump -U $POSTGRES_USER -d $POSTGRES_DB > "$DB_BACKUP_FILE"
success "Backup de base de datos guardado: $DB_BACKUP_FILE"

# Comprimir backup de BD
log "Comprimiendo backup de base de datos..."
gzip "$DB_BACKUP_FILE"
success "Backup comprimido: ${DB_BACKUP_FILE}.gz"

# Backup de archivos de configuración
log "Respaldando archivos de configuración..."
CONFIG_BACKUP="$BACKUP_DIR/config_$TIMESTAMP.tar.gz"
tar -czf "$CONFIG_BACKUP" \
    docker-compose.yml \
    .env.* \
    config/ \
    scripts/ \
    --exclude=node_modules \
    --exclude=dist \
    --exclude=.git
success "Configuración respaldada: $CONFIG_BACKUP"

# Backup de volúmenes de Docker (opcional)
if [ "$1" = "--full" ]; then
    log "Creando backup completo de volúmenes..."
    VOLUMES_BACKUP="$BACKUP_DIR/volumes_$TIMESTAMP.tar.gz"
    
    # Listar volúmenes
    VOLUMES=$(docker volume ls --format "{{.Name}}" | grep automarket)
    
    for volume in $VOLUMES; do
        log "Respaldando volumen: $volume"
        docker run --rm -v $volume:/data -v $(pwd)/$BACKUP_DIR:/backup alpine tar -czf /backup/${volume}_$TIMESTAMP.tar.gz -C /data .
    done
    
    success "Volúmenes respaldados en: $BACKUP_DIR"
fi

# Limpiar backups antiguos (mantener últimos 7 días)
log "Limpiando backups antiguos..."
find ./backups -type d -mtime +7 -exec rm -rf {} + 2>/dev/null || true
success "Backups antiguos eliminados"

# Resumen
echo ""
success "¡Backup completado exitosamente!"
echo ""
echo -e "${YELLOW}📋 Archivos creados:${NC}"
ls -la "$BACKUP_DIR"
echo ""
echo -e "${BLUE}💡 Para restaurar:${NC}"
echo "   Database: gunzip -c ${DB_BACKUP_FILE}.gz | docker-compose exec -T database psql -U \$POSTGRES_USER -d \$POSTGRES_DB"
echo "   Config:   tar -xzf $CONFIG_BACKUP"
echo ""