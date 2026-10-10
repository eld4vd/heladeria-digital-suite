-- El sabor pasa a ser un atributo de la receta, no una opcion del comprador.
-- Primero se conservan TODOS los nombres vinculados (tambien los inactivos).
-- Los pedidos, sus JSON historicos, precios, existencias y el vocabulario
-- de la tabla sabores no se modifican ni se eliminan.
BEGIN;
SET LOCAL lock_timeout = '15s';

ALTER TABLE "productos" ADD COLUMN "sabor" TEXT;

UPDATE "productos" AS producto
SET "sabor" = vinculados."descripcion_sabores"
FROM (
  SELECT enlace."producto_id",
         string_agg(sabor."nombre", ', ' ORDER BY sabor."nombre", sabor."id") AS "descripcion_sabores"
  FROM "productos_sabores" AS enlace
  INNER JOIN "sabores" AS sabor ON sabor."id" = enlace."sabor_id"
  GROUP BY enlace."producto_id"
) AS vinculados
WHERE producto."id" = vinculados."producto_id";

-- Se retiran solo la relacion configurable y su limite, ya sin consumidores.
DROP TABLE "productos_sabores";
ALTER TABLE "presentaciones" DROP COLUMN "maximo_sabores";

COMMIT;
