#!/bin/bash

# =====================================
# AUTOMARKET MULTITENANT - INSTALLER
# =====================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

# Función para imprimir con colores
print_header() {
    echo -e "\n${PURPLE}════════════════════════════════════${NC}"
    echo -e "${PURPLE} $1${NC}"
    echo -e "${PURPLE}════════════════════════════════════${NC}\n"
}

print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Verificar requisitos del sistema
check_requirements() {
    print_header "VERIFICANDO REQUISITOS DEL SISTEMA"
    
    # Node.js
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node -v)
        print_success "Node.js encontrado: $NODE_VERSION"
        
        # Verificar versión mínima
        NODE_MAJOR=$(echo $NODE_VERSION | cut -d'.' -f1 | sed 's/v//')
        if [ "$NODE_MAJOR" -lt 18 ]; then
            print_error "Node.js 18+ requerido. Versión actual: $NODE_VERSION"
            exit 1
        fi
    else
        print_error "Node.js no encontrado. Por favor, instale Node.js 18+"
        exit 1
    fi
    
    # NPM
    if command -v npm &> /dev/null; then
        NPM_VERSION=$(npm -v)
        print_success "NPM encontrado: $NPM_VERSION"
    else
        print_error "NPM no encontrado"
        exit 1
    fi
    
    # Docker
    if command -v docker &> /dev/null; then
        DOCKER_VERSION=$(docker --version)
        print_success "Docker encontrado: $DOCKER_VERSION"
        
        # Verificar que Docker esté ejecutándose
        if ! docker info &> /dev/null; then
            print_warning "Docker no está ejecutándose. Iniciando..."
            sudo systemctl start docker || print_warning "No se pudo iniciar Docker automáticamente"
        fi
    else
        print_warning "Docker no encontrado. Se instalará solo el entorno de desarrollo local."
        SKIP_DOCKER=true
    fi
    
    # Docker Compose
    if command -v docker-compose &> /dev/null; then
        COMPOSE_VERSION=$(docker-compose --version)
        print_success "Docker Compose encontrado: $COMPOSE_VERSION"
    elif command -v docker &> /dev/null && docker compose version &> /dev/null; then
        print_success "Docker Compose (integrado) encontrado"
    else
        print_warning "Docker Compose no encontrado"
        SKIP_DOCKER=true
    fi
    
    # Git
    if command -v git &> /dev/null; then
        GIT_VERSION=$(git --version)
        print_success "Git encontrado: $GIT_VERSION"
    else
        print_warning "Git no encontrado"
    fi
}

# Configurar variables de entorno
setup_environment() {
    print_header "CONFIGURANDO VARIABLES DE ENTORNO"
    
    if [ ! -f ".env" ]; then
        if [ -f ".env.example" ]; then
            print_info "Creando archivo .env desde .env.example..."
            cp .env.example .env
            print_success "Archivo .env creado"
        else
            print_info "Creando archivo .env básico..."
            cat > .env << EOL
# AutoMarket MultiTenant - Configuración de desarrollo
POSTGRES_DB=automarket_dev
POSTGRES_USER=automarket_user
POSTGRES_PASSWORD=dev_password_123
POSTGRES_PORT=5432

REDIS_PASSWORD=dev_redis_123
REDIS_PORT=6379

VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_DEFAULT_TENANT=demo

API_PORT=3001
FRONTEND_DEV_PORT=5173

NODE_ENV=development
EOL
            print_success "Archivo .env básico creado"
        fi
        
        print_warning "IMPORTANTE: Configura las variables de Supabase en .env antes de continuar"
        echo -e "${CYAN}Variables requeridas:${NC}"
        echo -e "  - VITE_SUPABASE_URL"
        echo -e "  - VITE_SUPABASE_ANON_KEY"
        echo -e "  - SUPABASE_SERVICE_ROLE_KEY (para API)"
        
        read -p "¿Continuar con valores por defecto? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            print_info "Por favor, configura .env y ejecuta el instalador nuevamente"
            exit 0
        fi
    else
        print_success "Archivo .env encontrado"
    fi
}

# Instalar dependencias
install_dependencies() {
    print_header "INSTALANDO DEPENDENCIAS"
    
    # Root dependencies
    print_info "Instalando dependencias del workspace..."
    npm install
    
    # API dependencies
    if [ -d "api" ]; then
        print_info "Instalando dependencias de la API..."
        cd api && npm install && cd ..
        print_success "Dependencias de API instaladas"
    fi
    
    # Frontend dependencies
    if [ -d "app" ]; then
        print_info "Instalando dependencias del Frontend..."
        cd app && npm install && cd ..
        print_success "Dependencias de Frontend instaladas"
    fi
    
    print_success "Todas las dependencias instaladas correctamente"
}

# Configurar base de datos
setup_database() {
    print_header "CONFIGURANDO BASE DE DATOS"
    
    if [ "$SKIP_DOCKER" != "true" ]; then
        print_info "Iniciando PostgreSQL con Docker..."
        docker-compose up -d database
        
        print_info "Esperando que PostgreSQL esté listo..."
        sleep 10
        
        # Verificar conexión
        if docker-compose exec database pg_isready -U automarket_user -d automarket_dev; then
            print_success "PostgreSQL está ejecutándose correctamente"
        else
            print_warning "PostgreSQL no está respondiendo. Continuando..."
        fi
        
        print_info "Iniciando Redis..."
        docker-compose up -d redis
        print_success "Redis iniciado"
    else
        print_warning "Docker no disponible. Por favor, configura PostgreSQL y Redis manualmente"
        echo -e "${CYAN}Configuración manual requerida:${NC}"
        echo -e "  - PostgreSQL 16+ en puerto 5432"
        echo -e "  - Redis 7+ en puerto 6379"
        echo -e "  - Base de datos 'automarket_dev'"
        echo -e "  - Usuario 'automarket_user'"
    fi
}

# Ejecutar migraciones
run_migrations() {
    print_header "EJECUTANDO MIGRACIONES DE BASE DE DATOS"
    
    if [ -f "db/schema_complete.sql" ]; then
        print_info "Aplicando esquema completo de base de datos..."
        if [ "$SKIP_DOCKER" != "true" ]; then
            docker-compose exec database psql -U automarket_user -d automarket_dev -f /docker-entrypoint-initdb.d/schema_complete.sql || print_warning "Error aplicando esquema (puede ser normal si ya existe)"
        else
            print_warning "Aplica manualmente el archivo db/schema_complete.sql a tu base de datos"
        fi
        print_success "Esquema de base de datos aplicado"
    fi
}

# Ejecutar tests
run_tests() {
    print_header "EJECUTANDO TESTS"
    
    print_info "Ejecutando tests de API..."
    if [ -d "api" ]; then
        cd api && npm test && cd .. || print_warning "Tests de API fallaron"
    fi
    
    print_info "Ejecutando tests de Frontend..."
    if [ -d "app" ]; then
        cd app && npm test -- --run && cd .. || print_warning "Tests de Frontend fallaron"
    fi
    
    print_success "Tests completados"
}

# Verificar instalación
verify_installation() {
    print_header "VERIFICANDO INSTALACIÓN"
    
    # Verificar archivos importantes
    local files=(
        "package.json"
        "docker-compose.yml"
        ".env"
        "api/package.json"
        "api/src/server.js"
        "app/package.json"
        "app/src/main.tsx"
    )
    
    for file in "${files[@]}"; do
        if [ -f "$file" ]; then
            print_success "✓ $file"
        else
            print_error "✗ $file (faltante)"
        fi
    done
    
    # Verificar servicios Docker
    if [ "$SKIP_DOCKER" != "true" ]; then
        print_info "Verificando servicios Docker..."
        docker-compose ps
    fi
}

# Función principal
main() {
    print_header "AUTOMARKET MULTITENANT - INSTALADOR AUTOMÁTICO"
    echo -e "${CYAN}Este script instalará y configurará AutoMarket MultiTenant${NC}"
    echo -e "${CYAN}Versión: 1.0.0${NC}\n"
    
    read -p "¿Continuar con la instalación? (Y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Nn]$ ]]; then
        print_info "Instalación cancelada"
        exit 0
    fi
    
    # Ejecutar pasos de instalación
    check_requirements
    setup_environment
    install_dependencies
    setup_database
    run_migrations
    verify_installation
    
    print_header "INSTALACIÓN COMPLETADA"
    print_success "¡AutoMarket MultiTenant ha sido instalado exitosamente!"
    
    echo -e "\n${GREEN}Próximos pasos:${NC}"
    echo -e "1. Configura tus variables de Supabase en .env"
    echo -e "2. Ejecuta: ${YELLOW}npm run dev${NC} (desarrollo local)"
    echo -e "3. O ejecuta: ${YELLOW}make docker-dev${NC} (con Docker)"
    echo -e "4. Visita: ${CYAN}http://localhost:5173${NC} (Frontend)"
    echo -e "5. API disponible en: ${CYAN}http://localhost:3001${NC}"
    echo -e "6. Documentación: ${CYAN}http://localhost:3001/api-docs${NC}"
    
    print_info "¡Disfruta desarrollando con AutoMarket MultiTenant!"
}

# Función de ayuda
show_help() {
    echo "AutoMarket MultiTenant - Instalador"
    echo ""
    echo "Uso: $0 [opciones]"
    echo ""
    echo "Opciones:"
    echo "  --help, -h          Mostrar esta ayuda"
    echo "  --skip-docker       Saltar configuración de Docker"
    echo "  --skip-tests        Saltar ejecución de tests"
    echo "  --only-deps         Solo instalar dependencias"
    echo ""
}

# Manejo de argumentos
case "${1:-}" in
    "--help"|"-h")
        show_help
        exit 0
        ;;
    "--skip-docker")
        SKIP_DOCKER=true
        main
        ;;
    "--skip-tests")
        SKIP_TESTS=true
        main
        ;;
    "--only-deps")
        check_requirements
        install_dependencies
        print_success "Solo dependencias instaladas"
        ;;
    *)
        main
        ;;
esac