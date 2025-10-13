#!/bin/bash
# =====================================
# Setup Script para AutoMarket Docker
# =====================================
# Configura permisos y archivos iniciales

set -e

echo "🔧 Configurando AutoMarket MultiTenant para Docker..."

# Hacer scripts ejecutables
echo "📋 Configurando permisos de scripts..."
chmod +x scripts/docker/*.sh
chmod +x app/docker-entrypoint.sh

# Crear directorios necesarios
echo "📁 Creando directorios..."
mkdir -p backups
mkdir -p logs
mkdir -p config/nginx/ssl
mkdir -p config/prometheus
mkdir -p config/grafana/provisioning

# Copiar archivos de configuración si no existen
if [ ! -f ".env" ]; then
    echo "⚙️  Copiando configuración de desarrollo..."
    cp .env.development .env
fi

# Crear archivo de configuración para PgAdmin
echo "🔧 Creando configuración de PgAdmin..."
cat > config/pgadmin_servers.json << 'EOF'
{
    "Servers": {
        "1": {
            "Name": "AutoMarket Database",
            "Group": "Servers",
            "Host": "database",
            "Port": 5432,
            "MaintenanceDB": "automarket_dev",
            "Username": "automarket_user",
            "SSLMode": "prefer",
            "SSLCert": "",
            "SSLKey": "",
            "SSLRootCert": "",
            "SSLCrl": "",
            "SSLCompression": 0,
            "Timeout": 10,
            "UseSSHTunnel": 0,
            "TunnelHost": "",
            "TunnelPort": "22",
            "TunnelUsername": "",
            "TunnelAuthentication": 0
        }
    }
}
EOF

# Crear configuración básica de Prometheus
echo "📊 Creando configuración de Prometheus..."
cat > config/prometheus/prometheus.yml << 'EOF'
global:
  scrape_interval: 15s
  evaluation_interval: 15s

rule_files:
  # - "first_rules.yml"

scrape_configs:
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']

  - job_name: 'automarket-frontend'
    static_configs:
      - targets: ['frontend:80']
    metrics_path: '/metrics'
    scrape_interval: 30s

  - job_name: 'postgres'
    static_configs:
      - targets: ['database:5432']
    scrape_interval: 30s
EOF

echo "✅ Configuración completada!"
echo ""
echo "🚀 Para iniciar el entorno de desarrollo:"
echo "   ./scripts/docker/dev.sh"
echo ""
echo "🏭 Para desplegar en producción:"
echo "   1. Configurar .env.production"
echo "   2. ./scripts/docker/prod.sh"
echo ""
echo "📚 Consultar guía completa: DOCKER_GUIDE.md"