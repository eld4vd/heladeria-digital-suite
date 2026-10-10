-- Los extras activos son opciones globales que el cliente elige y paga por unidad.
-- Se elimina SOLO la antigua tabla de asociaciones entre productos y extras.
-- Sus asociaciones ya no se usan; no se eliminan productos, extras ni pedidos.
-- Las copias de extras y precios en detalles_pedido permanecen intactas.
-- Respaldar la base antes de aplicar si se necesitan recuperar estas asociaciones.
BEGIN;
SET LOCAL lock_timeout = '15s';

DROP TABLE "_productos_extras";

COMMIT;
