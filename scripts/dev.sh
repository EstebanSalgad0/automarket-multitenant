#!/bin/bash

# =====================================
# SCRIPT DE DESARROLLO - AUTOMARKET
# =====================================

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Funciones de utilidad
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

# Verificar si Docker está ejecutándose
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        print_error "Docker no está ejecutándose. Por favor, inicie Docker Desktop."
        exit 1
    fi
    print_success "Docker está ejecutándose correctamente."
}

# Verificar si existe docker-compose.yml
check_compose_file() {
    if [ ! -f "docker-compose.yml" ]; then
        print_error "No se encontró docker-compose.yml en el directorio actual."
        exit 1
    fi
    print_success "Archivo docker-compose.yml encontrado."
}

# Configurar variables de entorno si no existen
setup_env() {
    if [ ! -f ".env" ]; then
        print_warning "No se encontró archivo .env. Creando desde .env.example..."
        if [ -f ".env.example" ]; then
            cp .env.example .env
            print_info "Por favor, configura las variables en .env antes de continuar."
            exit 0
        else
            print_error "No se encontró .env.example. Creando .env básico..."
            cat > .env << EOL
# Configuración básica para desarrollo
POSTGRES_DB=automarket
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_PORT=5432

REDIS_PASSWORD=redis123
REDIS_PORT=6379

FRONTEND_DEV_PORT=5173
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_key
VITE_DEFAULT_TENANT=demo
EOL
            print_warning "Se creó un archivo .env básico. Por favor, configúralo antes de continuar."
            exit 0
        fi
    fi
    print_success "Configuración de entorno lista."
}

# Función principal
main() {
    print_info "=== AUTOMARKET DEVELOPMENT SETUP ==="
    
    # Verificaciones iniciales
    check_docker
    check_compose_file
    setup_env
    
    # Construir y ejecutar servicios
    print_info "Construyendo imágenes Docker..."
    docker-compose build --no-cache
    
    print_info "Iniciando servicios en modo desarrollo..."
    docker-compose --profile development up -d
    
    print_info "Esperando que los servicios estén listos..."
    sleep 10
    
    # Verificar estado de servicios
    print_info "Estado de los servicios:"
    docker-compose ps
    
    print_success "=== SETUP COMPLETADO ==="
    print_info "Servicios disponibles:"
    print_info "  - Frontend: http://localhost:5173"
    print_info "  - Base de datos: localhost:5432"
    print_info "  - Redis: localhost:6379"
    
    print_info "Para ver logs: docker-compose logs -f"
    print_info "Para detener: docker-compose down"
}

# Función de limpieza
cleanup() {
    print_info "Limpiando contenedores y volúmenes..."
    docker-compose down -v
    docker system prune -f
    print_success "Limpieza completada."
}

# Función de reset completo
reset() {
    print_warning "¡ADVERTENCIA! Esto eliminará todos los datos."
    read -p "¿Estás seguro? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        cleanup
        docker-compose down --rmi all -v --remove-orphans
        print_success "Reset completo realizado."
    else
        print_info "Operación cancelada."
    fi
}

# Manejo de argumentos
case "${1:-}" in
    "start"|"")
        main
        ;;
    "stop")
        print_info "Deteniendo servicios..."
        docker-compose down
        print_success "Servicios detenidos."
        ;;
    "restart")
        print_info "Reiniciando servicios..."
        docker-compose restart
        print_success "Servicios reiniciados."
        ;;
    "logs")
        docker-compose logs -f
        ;;
    "clean")
        cleanup
        ;;
    "reset")
        reset
        ;;
    "status")
        docker-compose ps
        ;;
    *)
        echo "Uso: $0 {start|stop|restart|logs|clean|reset|status}"
        echo ""
        echo "Comandos:"
        echo "  start   - Iniciar servicios de desarrollo (por defecto)"
        echo "  stop    - Detener servicios"
        echo "  restart - Reiniciar servicios"
        echo "  logs    - Mostrar logs en tiempo real"
        echo "  clean   - Limpiar contenedores y volúmenes"
        echo "  reset   - Reset completo (¡elimina todos los datos!)"
        echo "  status  - Mostrar estado de servicios"
        exit 1
        ;;
esac