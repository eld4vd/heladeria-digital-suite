-- Rename existing tables without replacing them or losing their data.
-- Prisma models and API field names remain unchanged through @@map.
BEGIN;

ALTER TABLE "User" RENAME TO "usuarios";
ALTER TABLE "Session" RENAME TO "sesiones";
ALTER TABLE "Address" RENAME TO "direcciones";
ALTER TABLE "Category" RENAME TO "categorias";
ALTER TABLE "Product" RENAME TO "productos";
ALTER TABLE "Presentation" RENAME TO "presentaciones";
ALTER TABLE "Flavor" RENAME TO "sabores";
ALTER TABLE "Extra" RENAME TO "extras";
ALTER TABLE "Order" RENAME TO "pedidos";
ALTER TABLE "OrderItem" RENAME TO "detalles_pedido";
ALTER TABLE "PaymentAttempt" RENAME TO "intentos_pago";
ALTER TABLE "OrderHistory" RENAME TO "historial_pedidos";
ALTER TABLE "StockMovement" RENAME TO "movimientos_inventario";
ALTER TABLE "ShopSettings" RENAME TO "configuracion_negocio";
ALTER TABLE "_FlavorToProduct" RENAME TO "_productos_sabores";
ALTER TABLE "_ExtraToProduct" RENAME TO "_productos_extras";

-- Keep constraint and index names consistent with the mapped Prisma tables.
ALTER TABLE "usuarios" RENAME CONSTRAINT "User_pkey" TO "usuarios_pkey";
ALTER TABLE "sesiones" RENAME CONSTRAINT "Session_pkey" TO "sesiones_pkey";
ALTER TABLE "direcciones" RENAME CONSTRAINT "Address_pkey" TO "direcciones_pkey";
ALTER TABLE "categorias" RENAME CONSTRAINT "Category_pkey" TO "categorias_pkey";
ALTER TABLE "productos" RENAME CONSTRAINT "Product_pkey" TO "productos_pkey";
ALTER TABLE "presentaciones" RENAME CONSTRAINT "Presentation_pkey" TO "presentaciones_pkey";
ALTER TABLE "sabores" RENAME CONSTRAINT "Flavor_pkey" TO "sabores_pkey";
ALTER TABLE "extras" RENAME CONSTRAINT "Extra_pkey" TO "extras_pkey";
ALTER TABLE "pedidos" RENAME CONSTRAINT "Order_pkey" TO "pedidos_pkey";
ALTER TABLE "detalles_pedido" RENAME CONSTRAINT "OrderItem_pkey" TO "detalles_pedido_pkey";
ALTER TABLE "intentos_pago" RENAME CONSTRAINT "PaymentAttempt_pkey" TO "intentos_pago_pkey";
ALTER TABLE "historial_pedidos" RENAME CONSTRAINT "OrderHistory_pkey" TO "historial_pedidos_pkey";
ALTER TABLE "movimientos_inventario" RENAME CONSTRAINT "StockMovement_pkey" TO "movimientos_inventario_pkey";
ALTER TABLE "configuracion_negocio" RENAME CONSTRAINT "ShopSettings_pkey" TO "configuracion_negocio_pkey";
ALTER TABLE "_productos_sabores" RENAME CONSTRAINT "_FlavorToProduct_AB_pkey" TO "_productos_sabores_AB_pkey";
ALTER TABLE "_productos_extras" RENAME CONSTRAINT "_ExtraToProduct_AB_pkey" TO "_productos_extras_AB_pkey";
ALTER TABLE "sesiones" RENAME CONSTRAINT "Session_userId_fkey" TO "sesiones_userId_fkey";
ALTER TABLE "direcciones" RENAME CONSTRAINT "Address_userId_fkey" TO "direcciones_userId_fkey";
ALTER TABLE "productos" RENAME CONSTRAINT "Product_categoryId_fkey" TO "productos_categoryId_fkey";
ALTER TABLE "presentaciones" RENAME CONSTRAINT "Presentation_productId_fkey" TO "presentaciones_productId_fkey";
ALTER TABLE "pedidos" RENAME CONSTRAINT "Order_sessionId_fkey" TO "pedidos_sessionId_fkey";
ALTER TABLE "pedidos" RENAME CONSTRAINT "Order_userId_fkey" TO "pedidos_userId_fkey";
ALTER TABLE "detalles_pedido" RENAME CONSTRAINT "OrderItem_orderId_fkey" TO "detalles_pedido_orderId_fkey";
ALTER TABLE "detalles_pedido" RENAME CONSTRAINT "OrderItem_presentationId_fkey" TO "detalles_pedido_presentationId_fkey";
ALTER TABLE "intentos_pago" RENAME CONSTRAINT "PaymentAttempt_orderId_fkey" TO "intentos_pago_orderId_fkey";
ALTER TABLE "historial_pedidos" RENAME CONSTRAINT "OrderHistory_orderId_fkey" TO "historial_pedidos_orderId_fkey";
ALTER TABLE "movimientos_inventario" RENAME CONSTRAINT "StockMovement_presentationId_fkey" TO "movimientos_inventario_presentationId_fkey";
ALTER TABLE "movimientos_inventario" RENAME CONSTRAINT "StockMovement_orderId_fkey" TO "movimientos_inventario_orderId_fkey";
ALTER TABLE "_productos_sabores" RENAME CONSTRAINT "_FlavorToProduct_A_fkey" TO "_productos_sabores_A_fkey";
ALTER TABLE "_productos_sabores" RENAME CONSTRAINT "_FlavorToProduct_B_fkey" TO "_productos_sabores_B_fkey";
ALTER TABLE "_productos_extras" RENAME CONSTRAINT "_ExtraToProduct_A_fkey" TO "_productos_extras_A_fkey";
ALTER TABLE "_productos_extras" RENAME CONSTRAINT "_ExtraToProduct_B_fkey" TO "_productos_extras_B_fkey";
ALTER INDEX "User_email_key" RENAME TO "usuarios_email_key";
ALTER INDEX "Session_tokenHash_key" RENAME TO "sesiones_tokenHash_key";
ALTER INDEX "Session_expiresAt_idx" RENAME TO "sesiones_expiresAt_idx";
ALTER INDEX "Address_userId_idx" RENAME TO "direcciones_userId_idx";
ALTER INDEX "Category_slug_key" RENAME TO "categorias_slug_key";
ALTER INDEX "Product_slug_key" RENAME TO "productos_slug_key";
ALTER INDEX "Product_categoryId_active_idx" RENAME TO "productos_categoryId_active_idx";
ALTER INDEX "Presentation_productId_idx" RENAME TO "presentaciones_productId_idx";
ALTER INDEX "Flavor_name_key" RENAME TO "sabores_name_key";
ALTER INDEX "Extra_name_key" RENAME TO "extras_name_key";
ALTER INDEX "Order_code_key" RENAME TO "pedidos_code_key";
ALTER INDEX "Order_userId_createdAt_idx" RENAME TO "pedidos_userId_createdAt_idx";
ALTER INDEX "Order_status_createdAt_idx" RENAME TO "pedidos_status_createdAt_idx";
ALTER INDEX "Order_sessionId_idempotencyKey_key" RENAME TO "pedidos_sessionId_idempotencyKey_key";
ALTER INDEX "OrderItem_orderId_idx" RENAME TO "detalles_pedido_orderId_idx";
ALTER INDEX "PaymentAttempt_createdAt_idx" RENAME TO "intentos_pago_createdAt_idx";
ALTER INDEX "PaymentAttempt_orderId_idempotencyKey_key" RENAME TO "intentos_pago_orderId_idempotencyKey_key";
ALTER INDEX "OrderHistory_orderId_createdAt_idx" RENAME TO "historial_pedidos_orderId_createdAt_idx";
ALTER INDEX "StockMovement_presentationId_createdAt_idx" RENAME TO "movimientos_inventario_presentationId_createdAt_idx";
ALTER INDEX "_FlavorToProduct_B_index" RENAME TO "_productos_sabores_B_index";
ALTER INDEX "_ExtraToProduct_B_index" RENAME TO "_productos_extras_B_index";

-- Defaults for settings created explicitly by the administrator, not seed data.
ALTER TABLE "configuracion_negocio" ALTER COLUMN "deliveryFeeMinor" SET DEFAULT 0;
ALTER TABLE "configuracion_negocio" ALTER COLUMN "deliveryEnabled" SET DEFAULT false;

COMMIT;
