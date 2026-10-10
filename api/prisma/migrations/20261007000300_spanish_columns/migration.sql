-- Nombres fisicos en espanol sin recrear tablas ni perder registros.
-- Requiere las migraciones anteriores. Detener la API antes de aplicar.
-- El schema y las consultas Prisma usan espanol; los contratos REST no cambian.
BEGIN;
SET LOCAL lock_timeout = '15s';

-- Tipos y valores enumerados: RENAME mantiene los valores existentes y sus referencias.
ALTER TYPE "Role" RENAME VALUE 'ADMIN' TO 'ADMINISTRADOR';
ALTER TYPE "Role" RENAME VALUE 'OPERATOR' TO 'OPERADOR';
ALTER TYPE "Role" RENAME VALUE 'CUSTOMER' TO 'CLIENTE';
ALTER TYPE "Role" RENAME TO "rol_usuario";

ALTER TYPE "OrderStatus" RENAME VALUE 'PENDING_PAYMENT' TO 'PENDIENTE_PAGO';
ALTER TYPE "OrderStatus" RENAME VALUE 'CONFIRMED' TO 'CONFIRMADO';
ALTER TYPE "OrderStatus" RENAME VALUE 'PREPARING' TO 'EN_PREPARACION';
ALTER TYPE "OrderStatus" RENAME VALUE 'OUT_FOR_DELIVERY' TO 'EN_REPARTO';
ALTER TYPE "OrderStatus" RENAME VALUE 'DELIVERED' TO 'ENTREGADO';
ALTER TYPE "OrderStatus" RENAME VALUE 'CANCELED' TO 'CANCELADO';
ALTER TYPE "OrderStatus" RENAME TO "estado_pedido";

ALTER TYPE "PaymentMethod" RENAME VALUE 'DEMO_CARD' TO 'TARJETA_DEMOSTRACION';
ALTER TYPE "PaymentMethod" RENAME VALUE 'DEMO_QR' TO 'QR_DEMOSTRACION';
ALTER TYPE "PaymentMethod" RENAME TO "medio_pago";

ALTER TYPE "PaymentStatus" RENAME VALUE 'APPROVED' TO 'APROBADO';
ALTER TYPE "PaymentStatus" RENAME VALUE 'REJECTED' TO 'RECHAZADO';
ALTER TYPE "PaymentStatus" RENAME VALUE 'REFUNDED' TO 'REVERTIDO';
ALTER TYPE "PaymentStatus" RENAME TO "estado_pago";

ALTER TYPE "MovementType" RENAME VALUE 'ADJUSTMENT' TO 'AJUSTE';
ALTER TYPE "MovementType" RENAME VALUE 'SALE' TO 'VENTA';
ALTER TYPE "MovementType" RENAME VALUE 'RESTOCK' TO 'REPOSICION';
ALTER TYPE "MovementType" RENAME TO "tipo_movimiento_inventario";

-- usuarios
ALTER TABLE "usuarios" RENAME COLUMN "name" TO "nombre";
ALTER TABLE "usuarios" RENAME COLUMN "email" TO "correo";
ALTER TABLE "usuarios" RENAME COLUMN "passwordHash" TO "huella_contrasena";
ALTER TABLE "usuarios" RENAME COLUMN "phone" TO "telefono";
ALTER TABLE "usuarios" RENAME COLUMN "role" TO "rol";
ALTER TABLE "usuarios" RENAME COLUMN "active" TO "activo";
ALTER TABLE "usuarios" RENAME COLUMN "createdAt" TO "creado_en";
ALTER TABLE "usuarios" RENAME COLUMN "updatedAt" TO "actualizado_en";

-- sesiones
ALTER TABLE "sesiones" RENAME COLUMN "tokenHash" TO "huella_token";
ALTER TABLE "sesiones" RENAME COLUMN "csrfToken" TO "token_csrf";
ALTER TABLE "sesiones" RENAME COLUMN "userId" TO "usuario_id";
ALTER TABLE "sesiones" RENAME COLUMN "expiresAt" TO "expira_en";
ALTER TABLE "sesiones" RENAME COLUMN "createdAt" TO "creado_en";

-- direcciones
ALTER TABLE "direcciones" RENAME COLUMN "userId" TO "usuario_id";
ALTER TABLE "direcciones" RENAME COLUMN "label" TO "etiqueta";
ALTER TABLE "direcciones" RENAME COLUMN "address" TO "direccion";
ALTER TABLE "direcciones" RENAME COLUMN "city" TO "ciudad";
ALTER TABLE "direcciones" RENAME COLUMN "reference" TO "referencia";
ALTER TABLE "direcciones" RENAME COLUMN "createdAt" TO "creado_en";
ALTER TABLE "direcciones" RENAME COLUMN "updatedAt" TO "actualizado_en";

-- categorias
ALTER TABLE "categorias" RENAME COLUMN "name" TO "nombre";
ALTER TABLE "categorias" RENAME COLUMN "slug" TO "identificador_url";
ALTER TABLE "categorias" RENAME COLUMN "description" TO "descripcion";
ALTER TABLE "categorias" RENAME COLUMN "active" TO "activo";

-- productos
ALTER TABLE "productos" RENAME COLUMN "slug" TO "identificador_url";
ALTER TABLE "productos" RENAME COLUMN "name" TO "nombre";
ALTER TABLE "productos" RENAME COLUMN "description" TO "descripcion";
ALTER TABLE "productos" RENAME COLUMN "imageUrl" TO "url_imagen";
ALTER TABLE "productos" RENAME COLUMN "featured" TO "destacado";
ALTER TABLE "productos" RENAME COLUMN "active" TO "activo";
ALTER TABLE "productos" RENAME COLUMN "categoryId" TO "categoria_id";
ALTER TABLE "productos" RENAME COLUMN "createdAt" TO "creado_en";
ALTER TABLE "productos" RENAME COLUMN "updatedAt" TO "actualizado_en";

-- presentaciones
ALTER TABLE "presentaciones" RENAME COLUMN "productId" TO "producto_id";
ALTER TABLE "presentaciones" RENAME COLUMN "name" TO "nombre";
ALTER TABLE "presentaciones" RENAME COLUMN "priceMinor" TO "precio_unidades_menores";
ALTER TABLE "presentaciones" RENAME COLUMN "stock" TO "existencias";
ALTER TABLE "presentaciones" RENAME COLUMN "maxFlavors" TO "maximo_sabores";
ALTER TABLE "presentaciones" RENAME COLUMN "active" TO "activo";

-- sabores
ALTER TABLE "sabores" RENAME COLUMN "name" TO "nombre";
ALTER TABLE "sabores" RENAME COLUMN "active" TO "activo";

-- extras
ALTER TABLE "extras" RENAME COLUMN "name" TO "nombre";
ALTER TABLE "extras" RENAME COLUMN "imageUrl" TO "url_imagen";
ALTER TABLE "extras" RENAME COLUMN "priceMinor" TO "precio_unidades_menores";
ALTER TABLE "extras" RENAME COLUMN "active" TO "activo";

-- pedidos
ALTER TABLE "pedidos" RENAME COLUMN "code" TO "codigo";
ALTER TABLE "pedidos" RENAME COLUMN "sessionId" TO "sesion_id";
ALTER TABLE "pedidos" RENAME COLUMN "userId" TO "usuario_id";
ALTER TABLE "pedidos" RENAME COLUMN "idempotencyKey" TO "clave_idempotencia";
ALTER TABLE "pedidos" RENAME COLUMN "requestHash" TO "huella_solicitud";
ALTER TABLE "pedidos" RENAME COLUMN "status" TO "estado";
ALTER TABLE "pedidos" RENAME COLUMN "customerName" TO "nombre_cliente";
ALTER TABLE "pedidos" RENAME COLUMN "email" TO "correo";
ALTER TABLE "pedidos" RENAME COLUMN "phone" TO "telefono";
ALTER TABLE "pedidos" RENAME COLUMN "deliveryAddress" TO "direccion_entrega";
ALTER TABLE "pedidos" RENAME COLUMN "city" TO "ciudad";
ALTER TABLE "pedidos" RENAME COLUMN "reference" TO "referencia";
ALTER TABLE "pedidos" RENAME COLUMN "subtotalMinor" TO "subtotal_unidades_menores";
ALTER TABLE "pedidos" RENAME COLUMN "deliveryFeeMinor" TO "costo_envio_unidades_menores";
ALTER TABLE "pedidos" RENAME COLUMN "totalMinor" TO "total_unidades_menores";
ALTER TABLE "pedidos" RENAME COLUMN "currency" TO "moneda";
ALTER TABLE "pedidos" RENAME COLUMN "createdAt" TO "creado_en";
ALTER TABLE "pedidos" RENAME COLUMN "updatedAt" TO "actualizado_en";

-- detalles_pedido
ALTER TABLE "detalles_pedido" RENAME COLUMN "orderId" TO "pedido_id";
ALTER TABLE "detalles_pedido" RENAME COLUMN "presentationId" TO "presentacion_id";
ALTER TABLE "detalles_pedido" RENAME COLUMN "productName" TO "nombre_producto";
ALTER TABLE "detalles_pedido" RENAME COLUMN "presentationName" TO "nombre_presentacion";
ALTER TABLE "detalles_pedido" RENAME COLUMN "quantity" TO "cantidad";
ALTER TABLE "detalles_pedido" RENAME COLUMN "unitPriceMinor" TO "precio_unitario_unidades_menores";
ALTER TABLE "detalles_pedido" RENAME COLUMN "totalMinor" TO "total_unidades_menores";
ALTER TABLE "detalles_pedido" RENAME COLUMN "flavorIds" TO "identificadores_sabores";
ALTER TABLE "detalles_pedido" RENAME COLUMN "extraIds" TO "identificadores_extras";
ALTER TABLE "detalles_pedido" RENAME COLUMN "flavors" TO "sabores";

-- intentos_pago
ALTER TABLE "intentos_pago" RENAME COLUMN "orderId" TO "pedido_id";
ALTER TABLE "intentos_pago" RENAME COLUMN "idempotencyKey" TO "clave_idempotencia";
ALTER TABLE "intentos_pago" RENAME COLUMN "requestHash" TO "huella_solicitud";
ALTER TABLE "intentos_pago" RENAME COLUMN "method" TO "medio";
ALTER TABLE "intentos_pago" RENAME COLUMN "status" TO "estado";
ALTER TABLE "intentos_pago" RENAME COLUMN "amountMinor" TO "importe_unidades_menores";
ALTER TABLE "intentos_pago" RENAME COLUMN "createdAt" TO "creado_en";

-- historial_pedidos
ALTER TABLE "historial_pedidos" RENAME COLUMN "orderId" TO "pedido_id";
ALTER TABLE "historial_pedidos" RENAME COLUMN "fromStatus" TO "estado_anterior";
ALTER TABLE "historial_pedidos" RENAME COLUMN "toStatus" TO "estado_nuevo";
ALTER TABLE "historial_pedidos" RENAME COLUMN "note" TO "nota";
ALTER TABLE "historial_pedidos" RENAME COLUMN "actorId" TO "actor_id";
ALTER TABLE "historial_pedidos" RENAME COLUMN "createdAt" TO "creado_en";

-- movimientos_inventario
ALTER TABLE "movimientos_inventario" RENAME COLUMN "presentationId" TO "presentacion_id";
ALTER TABLE "movimientos_inventario" RENAME COLUMN "orderId" TO "pedido_id";
ALTER TABLE "movimientos_inventario" RENAME COLUMN "type" TO "tipo";
ALTER TABLE "movimientos_inventario" RENAME COLUMN "delta" TO "variacion";
ALTER TABLE "movimientos_inventario" RENAME COLUMN "stockAfter" TO "existencias_resultantes";
ALTER TABLE "movimientos_inventario" RENAME COLUMN "reason" TO "motivo";
ALTER TABLE "movimientos_inventario" RENAME COLUMN "actorId" TO "actor_id";
ALTER TABLE "movimientos_inventario" RENAME COLUMN "createdAt" TO "creado_en";

-- configuracion_negocio
ALTER TABLE "configuracion_negocio" RENAME COLUMN "name" TO "nombre";
ALTER TABLE "configuracion_negocio" RENAME COLUMN "description" TO "descripcion";
ALTER TABLE "configuracion_negocio" RENAME COLUMN "currency" TO "moneda";
ALTER TABLE "configuracion_negocio" RENAME COLUMN "locale" TO "idioma";
ALTER TABLE "configuracion_negocio" RENAME COLUMN "timezone" TO "zona_horaria";
ALTER TABLE "configuracion_negocio" RENAME COLUMN "address" TO "direccion";
ALTER TABLE "configuracion_negocio" RENAME COLUMN "city" TO "ciudad";
ALTER TABLE "configuracion_negocio" RENAME COLUMN "phone" TO "telefono";
ALTER TABLE "configuracion_negocio" RENAME COLUMN "email" TO "correo";
ALTER TABLE "configuracion_negocio" RENAME COLUMN "hours" TO "horarios";
ALTER TABLE "configuracion_negocio" RENAME COLUMN "coverageText" TO "descripcion_cobertura";
ALTER TABLE "configuracion_negocio" RENAME COLUMN "deliveryFeeMinor" TO "costo_envio_unidades_menores";
ALTER TABLE "configuracion_negocio" RENAME COLUMN "deliveryEnabled" TO "envio_habilitado";
ALTER TABLE "configuracion_negocio" RENAME COLUMN "updatedAt" TO "actualizado_en";

-- Relacion de sabores: se conserva la tabla existente y todas sus asociaciones.
ALTER TABLE "_productos_sabores" RENAME TO "productos_sabores";
ALTER TABLE "productos_sabores" RENAME COLUMN "A" TO "sabor_id";
ALTER TABLE "productos_sabores" RENAME COLUMN "B" TO "producto_id";
ALTER TABLE "productos_sabores" RENAME CONSTRAINT "_productos_sabores_AB_pkey" TO "productos_sabores_pkey";
ALTER TABLE "productos_sabores" RENAME CONSTRAINT "_productos_sabores_A_fkey" TO "productos_sabores_sabor_id_fkey";
ALTER TABLE "productos_sabores" RENAME CONSTRAINT "_productos_sabores_B_fkey" TO "productos_sabores_producto_id_fkey";
ALTER INDEX "_productos_sabores_B_index" RENAME TO "productos_sabores_producto_id_idx";

-- Mantener los nombres de claves foraneas e indices alineados con Prisma.
ALTER TABLE "sesiones" RENAME CONSTRAINT "sesiones_userId_fkey" TO "sesiones_usuario_id_fkey";
ALTER TABLE "direcciones" RENAME CONSTRAINT "direcciones_userId_fkey" TO "direcciones_usuario_id_fkey";
ALTER TABLE "productos" RENAME CONSTRAINT "productos_categoryId_fkey" TO "productos_categoria_id_fkey";
ALTER TABLE "presentaciones" RENAME CONSTRAINT "presentaciones_productId_fkey" TO "presentaciones_producto_id_fkey";
ALTER TABLE "pedidos" RENAME CONSTRAINT "pedidos_sessionId_fkey" TO "pedidos_sesion_id_fkey";
ALTER TABLE "pedidos" RENAME CONSTRAINT "pedidos_userId_fkey" TO "pedidos_usuario_id_fkey";
ALTER TABLE "detalles_pedido" RENAME CONSTRAINT "detalles_pedido_orderId_fkey" TO "detalles_pedido_pedido_id_fkey";
ALTER TABLE "detalles_pedido" RENAME CONSTRAINT "detalles_pedido_presentationId_fkey" TO "detalles_pedido_presentacion_id_fkey";
ALTER TABLE "intentos_pago" RENAME CONSTRAINT "intentos_pago_orderId_fkey" TO "intentos_pago_pedido_id_fkey";
ALTER TABLE "historial_pedidos" RENAME CONSTRAINT "historial_pedidos_orderId_fkey" TO "historial_pedidos_pedido_id_fkey";
ALTER TABLE "movimientos_inventario" RENAME CONSTRAINT "movimientos_inventario_presentationId_fkey" TO "movimientos_inventario_presentacion_id_fkey";
ALTER TABLE "movimientos_inventario" RENAME CONSTRAINT "movimientos_inventario_orderId_fkey" TO "movimientos_inventario_pedido_id_fkey";
ALTER INDEX "usuarios_email_key" RENAME TO "usuarios_correo_key";
ALTER INDEX "sesiones_tokenHash_key" RENAME TO "sesiones_huella_token_key";
ALTER INDEX "sesiones_expiresAt_idx" RENAME TO "sesiones_expira_en_idx";
ALTER INDEX "direcciones_userId_idx" RENAME TO "direcciones_usuario_id_idx";
ALTER INDEX "categorias_slug_key" RENAME TO "categorias_identificador_url_key";
ALTER INDEX "productos_slug_key" RENAME TO "productos_identificador_url_key";
ALTER INDEX "productos_categoryId_active_idx" RENAME TO "productos_categoria_id_activo_idx";
ALTER INDEX "presentaciones_productId_idx" RENAME TO "presentaciones_producto_id_idx";
ALTER INDEX "sabores_name_key" RENAME TO "sabores_nombre_key";
ALTER INDEX "extras_name_key" RENAME TO "extras_nombre_key";
ALTER INDEX "pedidos_code_key" RENAME TO "pedidos_codigo_key";
ALTER INDEX "pedidos_userId_createdAt_idx" RENAME TO "pedidos_usuario_id_creado_en_idx";
ALTER INDEX "pedidos_status_createdAt_idx" RENAME TO "pedidos_estado_creado_en_idx";
ALTER INDEX "pedidos_sessionId_idempotencyKey_key" RENAME TO "pedidos_sesion_id_clave_idempotencia_key";
ALTER INDEX "detalles_pedido_orderId_idx" RENAME TO "detalles_pedido_pedido_id_idx";
ALTER INDEX "intentos_pago_createdAt_idx" RENAME TO "intentos_pago_creado_en_idx";
ALTER INDEX "intentos_pago_orderId_idempotencyKey_key" RENAME TO "intentos_pago_pedido_id_clave_idempotencia_key";
ALTER INDEX "historial_pedidos_orderId_createdAt_idx" RENAME TO "historial_pedidos_pedido_id_creado_en_idx";
ALTER INDEX "movimientos_inventario_presentationId_createdAt_idx" RENAME TO "movimientos_inventario_presentacion_id_creado_en_idx";

COMMIT;

