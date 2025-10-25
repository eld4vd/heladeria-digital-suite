# ============================================
# Dockerfile Backend - Heladería API
# Multi-stage build para optimizar tamaño
# ============================================

# Etapa 1: Build
FROM node:22-alpine AS build
WORKDIR /usr/src/app

# Copiar solo los archivos necesarios para las dependencias
COPY package*.json ./

# Instalar dependencias (usa npm ci para builds más reproducibles)
RUN npm ci

# Copiar el resto del código y compilar
COPY . .
RUN npm run build

# Etapa 2: Producción (más liviana)
FROM node:22-alpine
WORKDIR /usr/src/app

# Copiar solo lo necesario
COPY package*.json ./
RUN npm ci --omit=dev

# Copiar el resultado del build
COPY --from=build /usr/src/app/dist ./dist

# Copiar script de entrypoint
COPY docker-entrypoint.sh ./docker-entrypoint.sh
RUN chmod +x docker-entrypoint.sh

# Herramientas necesarias para healthcheck/espera
RUN apk add --no-cache netcat-openbsd

# Crear usuario no-root para seguridad
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /usr/src/app

USER nodejs

# Configuración del servidor
EXPOSE 3000

# Variables de entorno por defecto (pueden ser sobreescritas)
ENV NODE_ENV=production \
    PORT=3000 \
    HOST=0.0.0.0

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
    CMD nc -z localhost 3000 || exit 1

ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["node", "dist/main.js"]



