@echo off
setlocal enabledelayedexpansion

REM =====================================
REM SCRIPT DE DESARROLLO - AUTOMARKET (WINDOWS)
REM =====================================

set "RED=[91m"
set "GREEN=[92m"
set "YELLOW=[93m"
set "BLUE=[94m"
set "NC=[0m"

:print_info
echo %BLUE%[INFO]%NC% %~1
goto :eof

:print_success
echo %GREEN%[SUCCESS]%NC% %~1
goto :eof

:print_warning
echo %YELLOW%[WARNING]%NC% %~1
goto :eof

:print_error
echo %RED%[ERROR]%NC% %~1
goto :eof

:check_docker
docker info >nul 2>&1
if errorlevel 1 (
    call :print_error "Docker no está ejecutándose. Por favor, inicie Docker Desktop."
    exit /b 1
)
call :print_success "Docker está ejecutándose correctamente."
goto :eof

:check_compose_file
if not exist "docker-compose.yml" (
    call :print_error "No se encontró docker-compose.yml en el directorio actual."
    exit /b 1
)
call :print_success "Archivo docker-compose.yml encontrado."
goto :eof

:setup_env
if not exist ".env" (
    call :print_warning "No se encontró archivo .env. Creando desde .env.example..."
    if exist ".env.example" (
        copy ".env.example" ".env" >nul
        call :print_info "Por favor, configura las variables en .env antes de continuar."
        exit /b 0
    ) else (
        call :print_error "No se encontró .env.example. Creando .env básico..."
        (
            echo # Configuración básica para desarrollo
            echo POSTGRES_DB=automarket
            echo POSTGRES_USER=postgres
            echo POSTGRES_PASSWORD=postgres
            echo POSTGRES_PORT=5432
            echo.
            echo REDIS_PASSWORD=redis123
            echo REDIS_PORT=6379
            echo.
            echo FRONTEND_DEV_PORT=5173
            echo VITE_SUPABASE_URL=your_supabase_url
            echo VITE_SUPABASE_ANON_KEY=your_supabase_key
            echo VITE_DEFAULT_TENANT=demo
        ) > .env
        call :print_warning "Se creó un archivo .env básico. Por favor, configúralo antes de continuar."
        exit /b 0
    )
)
call :print_success "Configuración de entorno lista."
goto :eof

:main
call :print_info "=== AUTOMARKET DEVELOPMENT SETUP ==="

call :check_docker
if errorlevel 1 exit /b 1

call :check_compose_file
if errorlevel 1 exit /b 1

call :setup_env
if errorlevel 1 exit /b 1

call :print_info "Construyendo imágenes Docker..."
docker-compose build --no-cache

call :print_info "Iniciando servicios en modo desarrollo..."
docker-compose --profile development up -d

call :print_info "Esperando que los servicios estén listos..."
timeout /t 10 /nobreak >nul

call :print_info "Estado de los servicios:"
docker-compose ps

call :print_success "=== SETUP COMPLETADO ==="
call :print_info "Servicios disponibles:"
call :print_info "  - Frontend: http://localhost:5173"
call :print_info "  - Base de datos: localhost:5432"
call :print_info "  - Redis: localhost:6379"
call :print_info ""
call :print_info "Para ver logs: docker-compose logs -f"
call :print_info "Para detener: docker-compose down"
goto :eof

:cleanup
call :print_info "Limpiando contenedores y volúmenes..."
docker-compose down -v
docker system prune -f
call :print_success "Limpieza completada."
goto :eof

:reset
call :print_warning "¡ADVERTENCIA! Esto eliminará todos los datos."
set /p "confirm=¿Estás seguro? (y/N): "
if /i "!confirm!"=="y" (
    call :cleanup
    docker-compose down --rmi all -v --remove-orphans
    call :print_success "Reset completo realizado."
) else (
    call :print_info "Operación cancelada."
)
goto :eof

REM Manejo de argumentos
if "%1"=="start" goto main
if "%1"=="" goto main
if "%1"=="stop" (
    call :print_info "Deteniendo servicios..."
    docker-compose down
    call :print_success "Servicios detenidos."
    goto :eof
)
if "%1"=="restart" (
    call :print_info "Reiniciando servicios..."
    docker-compose restart
    call :print_success "Servicios reiniciados."
    goto :eof
)
if "%1"=="logs" (
    docker-compose logs -f
    goto :eof
)
if "%1"=="clean" (
    call :cleanup
    goto :eof
)
if "%1"=="reset" (
    call :reset
    goto :eof
)
if "%1"=="status" (
    docker-compose ps
    goto :eof
)

echo Uso: %0 {start^|stop^|restart^|logs^|clean^|reset^|status}
echo.
echo Comandos:
echo   start   - Iniciar servicios de desarrollo (por defecto)
echo   stop    - Detener servicios
echo   restart - Reiniciar servicios
echo   logs    - Mostrar logs en tiempo real
echo   clean   - Limpiar contenedores y volúmenes
echo   reset   - Reset completo (¡elimina todos los datos!)
echo   status  - Mostrar estado de servicios