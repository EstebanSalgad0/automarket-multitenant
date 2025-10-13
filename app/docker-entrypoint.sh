#!/bin/sh
# =====================================
# Docker Entry Point para AutoMarket
# =====================================
# Script de inicialización para contenedor de producción

set -e

# Función para logging
log() {
    echo "[$(date +'%Y-%m-d %H:%M:%S')] $1"
}

log "🚀 Iniciando AutoMarket Frontend..."

# Verificar variables de entorno críticas
if [ -z "$VITE_SUPABASE_URL" ]; then
    log "⚠️  ADVERTENCIA: VITE_SUPABASE_URL no está configurada"
fi

if [ -z "$VITE_SUPABASE_ANON_KEY" ]; then
    log "⚠️  ADVERTENCIA: VITE_SUPABASE_ANON_KEY no está configurada"
fi

# Crear directorio de logs si no existe
mkdir -p /var/log/nginx

# Verificar archivos compilados
if [ ! -f "/usr/share/nginx/html/index.html" ]; then
    log "❌ ERROR: Archivos compilados no encontrados"
    exit 1
fi

log "✅ Archivos verificados correctamente"

# Mostrar información del contenedor
log "📋 Información del contenedor:"
log "   - Node Environment: ${NODE_ENV:-production}"
log "   - Nginx Version: $(nginx -v 2>&1)"
log "   - User: $(whoami)"

# Verificar configuración de Nginx
nginx -t
if [ $? -eq 0 ]; then
    log "✅ Configuración de Nginx válida"
else
    log "❌ ERROR: Configuración de Nginx inválida"
    exit 1
fi

log "🌐 Frontend listo en puerto 80"
log "🔍 Health check disponible en /health"

# Ejecutar comando pasado como argumentos
exec "$@"