BEGIN;
SET LOCAL lock_timeout = '15s';
LOCK TABLE "productos", "sabores" IN ACCESS EXCLUSIVE MODE;

-- Mismo criterio que normalizeFlavorName: mayusculas y espacios, no erratas.
ALTER TABLE "sabores" ADD COLUMN "nombre_normalizado" TEXT;
UPDATE "sabores"
SET "nombre_normalizado" = lower(btrim(regexp_replace("nombre", E'[ \\t\\n\\r\\f\\v]+', ' ', 'g')));

-- Antes de crear la FK, unificar solo nombres equivalentes (ej. Vainilla/vainilla).
-- Se prefiere un registro activo. Los snapshots JSON de pedidos no se modifican.
WITH duplicados AS (
  SELECT "id", row_number() OVER (
    PARTITION BY "nombre_normalizado" ORDER BY "activo" DESC, "id"
  ) AS posicion FROM "sabores"
)
DELETE FROM "sabores" WHERE "id" IN (SELECT "id" FROM duplicados WHERE posicion > 1);

ALTER TABLE "sabores" ALTER COLUMN "nombre_normalizado" SET NOT NULL;
DROP INDEX "sabores_nombre_key";
CREATE UNIQUE INDEX "sabores_nombre_normalizado_key" ON "sabores"("nombre_normalizado");
ALTER TABLE "productos" ADD COLUMN "sabor_id" TEXT;

-- Reutilizar el vocabulario existente y conservar cada receta de texto sin inventar
-- sabores: una descripcion combinada sigue siendo un unico sabor de receta.
INSERT INTO "sabores" ("id", "nombre", "nombre_normalizado", "activo")
SELECT DISTINCT ON (nombre_normalizado)
  'migrado_' || md5(nombre_normalizado), nombre, nombre_normalizado, true
FROM (
  SELECT btrim(regexp_replace("sabor", E'[ \\t\\n\\r\\f\\v]+', ' ', 'g')) AS nombre,
    lower(btrim(regexp_replace("sabor", E'[ \\t\\n\\r\\f\\v]+', ' ', 'g'))) AS nombre_normalizado
  FROM "productos" WHERE "sabor" IS NOT NULL
) AS recetas
WHERE nombre_normalizado <> ''
ORDER BY nombre_normalizado, nombre
ON CONFLICT ("nombre_normalizado") DO NOTHING;

UPDATE "productos" AS producto SET "sabor_id" = sabor."id"
FROM "sabores" AS sabor
WHERE sabor."nombre_normalizado" = lower(btrim(regexp_replace(producto."sabor", E'[ \\t\\n\\r\\f\\v]+', ' ', 'g')))
  AND sabor."nombre_normalizado" <> '';

ALTER TABLE "productos" ADD CONSTRAINT "productos_sabor_id_fkey"
  FOREIGN KEY ("sabor_id") REFERENCES "sabores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
CREATE INDEX "productos_sabor_id_idx" ON "productos"("sabor_id");
-- Sin sabor anterior se conserva NULL; no se crean datos demo ni se tocan precios/stock.
ALTER TABLE "productos" DROP COLUMN "sabor";
COMMIT;
