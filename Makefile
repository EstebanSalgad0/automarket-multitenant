# =====================================
# MAKEFILE - AUTOMARKET MULTITENANT
# =====================================

.PHONY: help install dev build test clean docker-dev docker-prod docker-build docker-clean

# Variables
COMPOSE_FILE = docker-compose.yml
API_DIR = api
APP_DIR = app

# Colors
GREEN = \033[0;32m
YELLOW = \033[1;33m
NC = \033[0m

# Default target
help: ## Mostrar ayuda
	@echo "$(GREEN)AutoMarket MultiTenant - Comandos disponibles:$(NC)"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(YELLOW)%-20s$(NC) %s\n", $$1, $$2}'

# Development
install: ## Instalar todas las dependencias
	@echo "$(GREEN)Instalando dependencias...$(NC)"
	npm install
	cd $(API_DIR) && npm install
	cd $(APP_DIR) && npm install

dev: ## Iniciar desarrollo con hot reload
	@echo "$(GREEN)Iniciando desarrollo...$(NC)"
	npm run dev

dev-api: ## Iniciar solo API en desarrollo
	@echo "$(GREEN)Iniciando API...$(NC)"
	cd $(API_DIR) && npm run dev

dev-app: ## Iniciar solo Frontend en desarrollo
	@echo "$(GREEN)Iniciando Frontend...$(NC)"
	cd $(APP_DIR) && npm run dev

# Build
build: ## Build de producción
	@echo "$(GREEN)Construyendo aplicación...$(NC)"
	npm run build

build-api: ## Build API
	@echo "$(GREEN)Construyendo API...$(NC)"
	cd $(API_DIR) && npm run build

build-app: ## Build Frontend
	@echo "$(GREEN)Construyendo Frontend...$(NC)"
	cd $(APP_DIR) && npm run build

# Testing
test: ## Ejecutar todos los tests
	@echo "$(GREEN)Ejecutando tests...$(NC)"
	npm run test

test-api: ## Ejecutar tests de API
	@echo "$(GREEN)Ejecutando tests API...$(NC)"
	cd $(API_DIR) && npm test

test-app: ## Ejecutar tests de Frontend
	@echo "$(GREEN)Ejecutando tests Frontend...$(NC)"
	cd $(APP_DIR) && npm test

# Linting
lint: ## Ejecutar linter en todo el proyecto
	@echo "$(GREEN)Ejecutando linter...$(NC)"
	npm run lint

lint-fix: ## Ejecutar linter con auto-fix
	@echo "$(GREEN)Ejecutando linter con auto-fix...$(NC)"
	cd $(API_DIR) && npm run lint:fix
	cd $(APP_DIR) && npm run lint:fix

# Database
db-migrate: ## Ejecutar migraciones de base de datos
	@echo "$(GREEN)Ejecutando migraciones...$(NC)"
	cd $(API_DIR) && npm run db:migrate

db-seed: ## Ejecutar seeders de base de datos
	@echo "$(GREEN)Ejecutando seeders...$(NC)"
	cd $(API_DIR) && npm run db:seed

db-reset: ## Reset completo de base de datos
	@echo "$(YELLOW)¡ADVERTENCIA! Esto eliminará todos los datos.$(NC)"
	@read -p "¿Continuar? [y/N] " -n 1 -r; \
	if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
		echo ""; \
		echo "$(GREEN)Reseteando base de datos...$(NC)"; \
		cd $(API_DIR) && npm run db:reset; \
	else \
		echo ""; \
		echo "Operación cancelada."; \
	fi

# Docker
docker-dev: ## Iniciar servicios Docker para desarrollo
	@echo "$(GREEN)Iniciando Docker en modo desarrollo...$(NC)"
	docker-compose --profile development up -d

docker-prod: ## Iniciar servicios Docker para producción
	@echo "$(GREEN)Iniciando Docker en modo producción...$(NC)"
	docker-compose up -d

docker-build: ## Construir imágenes Docker
	@echo "$(GREEN)Construyendo imágenes Docker...$(NC)"
	docker-compose build --no-cache

docker-clean: ## Limpiar contenedores y volúmenes Docker
	@echo "$(GREEN)Limpiando Docker...$(NC)"
	docker-compose down -v
	docker system prune -f

docker-logs: ## Mostrar logs de Docker
	docker-compose logs -f

docker-status: ## Mostrar estado de contenedores
	docker-compose ps

# Utilities
clean: ## Limpiar node_modules y archivos temporales
	@echo "$(GREEN)Limpiando archivos temporales...$(NC)"
	rm -rf node_modules
	rm -rf $(API_DIR)/node_modules
	rm -rf $(APP_DIR)/node_modules
	rm -rf $(API_DIR)/dist
	rm -rf $(APP_DIR)/dist
	rm -rf $(API_DIR)/logs
	rm -rf .env.local

reset: ## Reset completo del proyecto
	@echo "$(YELLOW)¡ADVERTENCIA! Esto eliminará node_modules, builds y Docker.$(NC)"
	@read -p "¿Continuar? [y/N] " -n 1 -r; \
	if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
		echo ""; \
		make clean; \
		make docker-clean; \
		echo "$(GREEN)Reset completo realizado.$(NC)"; \
	else \
		echo ""; \
		echo "Operación cancelada."; \
	fi

# Quick start
start: docker-dev ## Inicio rápido con Docker (alias para docker-dev)

stop: ## Detener todos los servicios
	@echo "$(GREEN)Deteniendo servicios...$(NC)"
	docker-compose down

restart: ## Reiniciar servicios Docker
	@echo "$(GREEN)Reiniciando servicios...$(NC)"
	docker-compose restart

# Environment
setup-env: ## Configurar archivo .env desde ejemplo
	@if [ ! -f .env ]; then \
		echo "$(GREEN)Creando archivo .env desde .env.example...$(NC)"; \
		cp .env.example .env; \
		echo "$(YELLOW)Por favor, configura las variables en .env$(NC)"; \
	else \
		echo "$(YELLOW)El archivo .env ya existe.$(NC)"; \
	fi

# Health checks
health: ## Verificar estado de servicios
	@echo "$(GREEN)Verificando estado de servicios...$(NC)"
	@curl -f http://localhost:3001/health || echo "API no disponible"
	@curl -f http://localhost:5173 || echo "Frontend no disponible"