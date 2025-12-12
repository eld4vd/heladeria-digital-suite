-- Script para limpiar URLs de imágenes inválidas
-- Ejecutar en PostgreSQL

-- Ver cuántos productos tienen el problema
SELECT id, nombre, imagenUrl 
FROM producto 
WHERE imagenUrl IS NOT NULL 
  AND imagenUrl NOT LIKE 'http%';

-- Actualizar productos con URLs inválidas a NULL
UPDATE producto 
SET imagenUrl = NULL 
WHERE imagenUrl IS NOT NULL 
  AND imagenUrl NOT LIKE 'http%';

-- Verificar que se actualizaron
SELECT COUNT(*) as productos_sin_imagen 
FROM producto 
WHERE imagenUrl IS NULL;
