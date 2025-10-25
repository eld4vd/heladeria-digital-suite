#!/bin/sh
# ============================================
# Docker Entrypoint - Heladería Backend
# Espera a la BD antes de iniciar la app
# ============================================

set -e

# Esperar a que PostgreSQL esté listo (si WAIT_FOR_DB=true)
if [ "${WAIT_FOR_DB}" = "true" ]; then
  echo "⏳ Esperando a PostgreSQL en ${DB_HOST:-localhost}:${DB_PORT:-5432}..."
  until nc -z "${DB_HOST:-localhost}" "${DB_PORT:-5432}"; do
    echo "⏳ Base de datos no disponible, reintentando en 1s..."
    sleep 1
  done
  echo "✅ PostgreSQL está listo!"
fi

# Ejecutar migraciones (si RUN_MIGRATIONS=true)
if [ "${RUN_MIGRATIONS}" = "true" ]; then
  if [ -f ./dist/database/run-migrations.js ]; then
    echo "🔄 Ejecutando migraciones de base de datos..."
    node ./dist/database/run-migrations.js
    echo "✅ Migraciones completadas!"
  else
    echo "⚠️  RUN_MIGRATIONS=true pero no se encontró dist/database/run-migrations.js"
  fi
fi

# Ejecutar el comando principal
echo "🚀 Iniciando aplicación: $*"
exec "$@"
