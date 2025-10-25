# ============================================
# Dockerfile Frontend - Heladería React App
# Multi-stage build con Nginx optimizado
# ============================================

# Etapa 1: Build de la app
FROM node:22-alpine AS build
WORKDIR /app

# Copiar los archivos de dependencias primero (mejor cache)
COPY package*.json ./

# Instalar dependencias (npm ci = reproducible y rápido)
RUN npm ci

# Copiar el resto del código
COPY . .

# Build de producción
RUN npm run build

# Etapa 2: Servir con Nginx optimizado
FROM nginx:alpine

# Copiar los archivos generados al directorio público de Nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Copiar configuración personalizada de Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Crear usuario nginx si no existe y ajustar permisos
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chmod -R 755 /usr/share/nginx/html

# Exponer puertos HTTP y HTTPS
EXPOSE 80 443

# Healthcheck para verificar que Nginx está respondiendo
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost:80/ || exit 1

# Mantener Nginx corriendo en primer plano
CMD ["nginx", "-g", "daemon off;"]

