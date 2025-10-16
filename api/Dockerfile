# =====================================
# DOCKERFILE MULTI-STAGE - API NODE.JS
# =====================================

# =====================================
# STAGE 1: BASE
# =====================================
FROM node:18-alpine AS base
LABEL maintainer="AutoMarket Team"
LABEL description="AutoMarket MultiTenant API"

# Instalar dependencias del sistema
RUN apk add --no-cache \
    dumb-init \
    curl \
    && rm -rf /var/cache/apk/*

# Crear usuario no-root
RUN addgroup -g 1001 -S nodejs
RUN adduser -S automarket -u 1001

# Establecer directorio de trabajo
WORKDIR /app

# Configurar NODE_ENV
ENV NODE_ENV=production

# =====================================
# STAGE 2: DEPENDENCIES
# =====================================
FROM base AS deps

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias (solo production)
RUN npm ci --only=production && npm cache clean --force

# =====================================
# STAGE 3: DEVELOPMENT
# =====================================
FROM base AS development

# Instalar todas las dependencias para desarrollo
COPY package*.json ./
RUN npm ci

# Cambiar ownership a usuario nodejs
USER automarket

# Copiar código fuente
COPY --chown=automarket:nodejs . .

# Puerto de desarrollo
EXPOSE 3001

# Variables de entorno para desarrollo
ENV NODE_ENV=development
ENV PORT=3001

# Comando de desarrollo con nodemon
CMD ["dumb-init", "npm", "run", "dev"]

# =====================================
# STAGE 4: BUILDER
# =====================================
FROM base AS builder

# Copiar dependencias del stage anterior
COPY --from=deps /app/node_modules ./node_modules

# Copiar código fuente
COPY . .

# Ejecutar build si es necesario
RUN npm run build || echo "No build script found, skipping..."

# =====================================
# STAGE 5: PRODUCTION
# =====================================
FROM base AS production

# Copiar dependencias de producción
COPY --from=deps /app/node_modules ./node_modules

# Copiar código fuente
COPY --from=builder --chown=automarket:nodejs /app/src ./src
COPY --from=builder --chown=automarket:nodejs /app/package*.json ./

# Crear directorios necesarios
RUN mkdir -p logs uploads && chown -R automarket:nodejs logs uploads

# Cambiar a usuario no-root
USER automarket

# Puerto de producción
EXPOSE 3001

# Variables de entorno
ENV NODE_ENV=production
ENV PORT=3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3001/health || exit 1

# Comando de producción
CMD ["dumb-init", "node", "src/server.js"]