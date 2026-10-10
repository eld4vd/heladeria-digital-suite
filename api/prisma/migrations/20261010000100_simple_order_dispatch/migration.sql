BEGIN;
SET LOCAL lock_timeout = '15s';
LOCK TABLE "pedidos", "historial_pedidos" IN ACCESS EXCLUSIVE MODE;

ALTER TABLE "pedidos" ADD COLUMN "despachado_en" TIMESTAMP(3);

-- Sólo se reutilizan fechas de eventos existentes. No se atribuye un despacho
-- a la fecha del pago, de creación ni de la última edición del pedido.
UPDATE "pedidos" AS pedido
SET "despachado_en" = eventos."primera_salida"
FROM (
  SELECT "pedido_id", MIN("creado_en") AS "primera_salida"
  FROM "historial_pedidos"
  WHERE "estado_nuevo"::text IN ('EN_REPARTO', 'ENTREGADO')
  GROUP BY "pedido_id"
) AS eventos
WHERE pedido."id" = eventos."pedido_id"
  AND pedido."estado"::text IN ('EN_REPARTO', 'ENTREGADO');

-- Conservar la transición original antes de agrupar estados. La nota previa
-- nunca se reemplaza: se amplía; una nota NULL recibe sólo la anotación.
UPDATE "historial_pedidos"
SET "nota" =
  CASE WHEN "nota" IS NULL THEN '' ELSE "nota" || E'\n' END
  || 'Flujo anterior: '
  || CASE WHEN "estado_anterior" IS NULL THEN 'NULL' ELSE "estado_anterior"::text END
  || ' -> ' || "estado_nuevo"::text
WHERE "estado_anterior"::text IN ('EN_PREPARACION', 'EN_REPARTO', 'ENTREGADO')
  OR "estado_nuevo"::text IN ('EN_PREPARACION', 'EN_REPARTO', 'ENTREGADO');

-- Preparación vuelve a la cola confirmada; reparto y entrega pasan al despacho
-- terminal. Se mantienen actores, fechas, filas y el texto de las notas previas.
ALTER TABLE "pedidos" ALTER COLUMN "estado" DROP DEFAULT;
ALTER TYPE "estado_pedido" RENAME TO "estado_pedido_anterior";
CREATE TYPE "estado_pedido" AS ENUM ('PENDIENTE_PAGO', 'CONFIRMADO', 'DESPACHADO', 'CANCELADO');

ALTER TABLE "pedidos" ALTER COLUMN "estado" TYPE "estado_pedido"
USING (
  CASE "estado"::text
    WHEN 'EN_PREPARACION' THEN 'CONFIRMADO'
    WHEN 'EN_REPARTO' THEN 'DESPACHADO'
    WHEN 'ENTREGADO' THEN 'DESPACHADO'
    ELSE "estado"::text
  END
)::"estado_pedido";

ALTER TABLE "historial_pedidos" ALTER COLUMN "estado_anterior" TYPE "estado_pedido"
USING (
  CASE "estado_anterior"::text
    WHEN 'EN_PREPARACION' THEN 'CONFIRMADO'
    WHEN 'EN_REPARTO' THEN 'DESPACHADO'
    WHEN 'ENTREGADO' THEN 'DESPACHADO'
    ELSE "estado_anterior"::text
  END
)::"estado_pedido";

ALTER TABLE "historial_pedidos" ALTER COLUMN "estado_nuevo" TYPE "estado_pedido"
USING (
  CASE "estado_nuevo"::text
    WHEN 'EN_PREPARACION' THEN 'CONFIRMADO'
    WHEN 'EN_REPARTO' THEN 'DESPACHADO'
    WHEN 'ENTREGADO' THEN 'DESPACHADO'
    ELSE "estado_nuevo"::text
  END
)::"estado_pedido";

ALTER TABLE "pedidos" ALTER COLUMN "estado" SET DEFAULT 'PENDIENTE_PAGO';
DROP TYPE "estado_pedido_anterior";
ALTER TYPE "tipo_movimiento_inventario" ADD VALUE 'RESERVA' BEFORE 'VENTA';
CREATE INDEX "pedidos_estado_despachado_en_idx" ON "pedidos"("estado", "despachado_en");

-- No se modifican existencias, pagos ni movimientos históricos. Sus ventas
-- anteriores reflejan la regla vigente entonces: descontar al aprobar el pago.
-- Si no existe un evento histórico de salida, despachado_en permanece NULL.
COMMIT;
