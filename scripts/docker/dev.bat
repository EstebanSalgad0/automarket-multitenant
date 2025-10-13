@echo off
REM =====================================
REM Script de Desarrollo - AutoMarket (Windows)
REM =====================================
REM Inicia el entorno completo de desarrollo

setlocal EnableDelayedExpansion

echo ==================================
echo 🚀 AutoMarket - Entorno Desarrollo
echo ==================================

REM Verificar Docker
docker --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker no está instalado
    exit /b 1
)

docker-compose --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker Compose no está instalado
    exit /b 1
)

REM Verificar archivo de entorno
set ENV_FILE=.env.development
if not exist "%ENV_FILE%" (
    echo ⚠️  Archivo %ENV_FILE% no encontrado, copiando desde ejemplo...
    copy ".env.example" "%ENV_FILE%" >nul 2>&1
)

echo 📋 Cargando variables de entorno desde %ENV_FILE%

REM Construir imágenes
echo 🔨 Construyendo imágenes de Docker...
docker-compose --profile development build --parallel

REM Iniciar servicios base
echo 🗄️  Iniciando servicios base...
docker-compose --profile development up -d database redis

REM Esperar base de datos
echo ⏳ Esperando a que la base de datos esté lista...
timeout /t 10 /nobreak >nul

REM Iniciar servicios de desarrollo
echo 🚀 Iniciando servicios de desarrollo...
docker-compose --profile development --profile tools up -d

REM Mostrar status
echo.
echo 📊 Estado de los servicios:
docker-compose --profile development ps

echo.
echo ✅ ¡Entorno de desarrollo listo!
echo.
echo 📋 Servicios disponibles:
echo    🌐 Frontend (Dev):     http://localhost:5173
echo    🗄️  Adminer:          http://localhost:8080
echo    🔧 PgAdmin:           http://localhost:8081
echo    📊 Database:          localhost:5432
echo    🗃️  Redis:            localhost:6379
echo.
echo 💡 Comandos útiles:
echo    📋 Ver logs:          docker-compose logs -f
echo    🔄 Reiniciar:         docker-compose restart
echo    🛑 Detener:           docker-compose down
echo    🧹 Limpiar:           docker-compose down -v --remove-orphans
echo.

if "%1"=="--logs" (
    echo 📄 Siguiendo logs de todos los servicios...
    docker-compose --profile development logs -f
)

pause