import { EstadoPago, EstadoPedido, MedioPago, RolUsuario } from './generated/prisma/client';
import type { Categoria, ConfiguracionNegocio, Direccion, Extra, Presentacion, Producto, Sabor } from './generated/prisma/client';

// Contratos REST estables para web/admin; la persistencia y el schema usan espanol.
export const Role = { ADMIN: 'ADMIN', OPERATOR: 'OPERATOR', CUSTOMER: 'CUSTOMER' } as const;
export type Role = typeof Role[keyof typeof Role];
export const OrderStatus = { PENDING_PAYMENT: 'PENDING_PAYMENT', CONFIRMED: 'CONFIRMED', DISPATCHED: 'DISPATCHED', CANCELED: 'CANCELED' } as const;
export type OrderStatus = typeof OrderStatus[keyof typeof OrderStatus];
export const PaymentMethod = { DEMO_CARD: 'DEMO_CARD', DEMO_QR: 'DEMO_QR' } as const;
export type PaymentMethod = typeof PaymentMethod[keyof typeof PaymentMethod];

const rolesApi = { ADMINISTRADOR: Role.ADMIN, OPERADOR: Role.OPERATOR, CLIENTE: Role.CUSTOMER } satisfies Record<RolUsuario, Role>;
const estadosApi = { PENDIENTE_PAGO: OrderStatus.PENDING_PAYMENT, CONFIRMADO: OrderStatus.CONFIRMED, DESPACHADO: OrderStatus.DISPATCHED, CANCELADO: OrderStatus.CANCELED } satisfies Record<EstadoPedido, OrderStatus>;
const estadosDatos = { PENDING_PAYMENT: EstadoPedido.PENDIENTE_PAGO, CONFIRMED: EstadoPedido.CONFIRMADO, DISPATCHED: EstadoPedido.DESPACHADO, CANCELED: EstadoPedido.CANCELADO } satisfies Record<OrderStatus, EstadoPedido>;
const mediosApi = { TARJETA_DEMOSTRACION: PaymentMethod.DEMO_CARD, QR_DEMOSTRACION: PaymentMethod.DEMO_QR } satisfies Record<MedioPago, PaymentMethod>;
const mediosDatos = { DEMO_CARD: MedioPago.TARJETA_DEMOSTRACION, DEMO_QR: MedioPago.QR_DEMOSTRACION } satisfies Record<PaymentMethod, MedioPago>;
const pagosApi = { APROBADO: 'APPROVED', RECHAZADO: 'REJECTED', REVERTIDO: 'REFUNDED' } as const satisfies Record<EstadoPago, string>;

export const rolApi = (rol: RolUsuario) => rolesApi[rol];
export const estadoPedidoApi = (estado: EstadoPedido) => estadosApi[estado];
export const estadoPedidoDatos = (estado: OrderStatus) => estadosDatos[estado];
export const medioPagoApi = (medio: MedioPago) => mediosApi[medio];
export const medioPagoDatos = (medio: PaymentMethod) => mediosDatos[medio];
export const estadoPagoApi = (estado: EstadoPago) => pagosApi[estado];

export function categoriaApi(valor: Categoria) {
  return { id: valor.id, name: valor.nombre, slug: valor.identificadorUrl, description: valor.descripcion, active: valor.activo };
}
export function saborApi(valor: Sabor) {
  return { id: valor.id, name: valor.nombre, active: valor.activo };
}
export function extraApi(valor: Extra) {
  return { id: valor.id, name: valor.nombre, imageUrl: valor.urlImagen, priceMinor: valor.precioUnidadesMenores, active: valor.activo };
}
export function productoBaseApi(valor: Producto & { sabor: Sabor | null }) {
  return { id: valor.id, slug: valor.identificadorUrl, name: valor.nombre, description: valor.descripcion, flavorId: valor.saborId, flavor: valor.sabor?.nombre ?? null, imageUrl: valor.urlImagen, featured: valor.destacado, active: valor.activo, categoryId: valor.categoriaId, createdAt: valor.creadoEn, updatedAt: valor.actualizadoEn };
}
export function presentacionApi(valor: Presentacion) {
  return { id: valor.id, productId: valor.productoId, name: valor.nombre, priceMinor: valor.precioUnidadesMenores, stock: valor.existencias, active: valor.activo };
}
export function presentacionConProductoApi(valor: Presentacion & { producto: Producto & { sabor: Sabor | null } }) {
  return { ...presentacionApi(valor), product: productoBaseApi(valor.producto) };
}
export function productoApi(valor: Producto & { sabor: Sabor | null; categoria: Categoria; presentaciones: Presentacion[] }, extras: Extra[]) {
  return { ...productoBaseApi(valor), category: categoriaApi(valor.categoria), presentations: valor.presentaciones.map(presentacionApi), extras: extras.map(extraApi) };
}
export function direccionApi(valor: Direccion) {
  return { id: valor.id, userId: valor.usuarioId, label: valor.etiqueta, address: valor.direccion, city: valor.ciudad, reference: valor.referencia, createdAt: valor.creadoEn, updatedAt: valor.actualizadoEn };
}
export function configuracionApi(valor: Omit<ConfiguracionNegocio, 'actualizadoEn'> & { actualizadoEn: Date | null }) {
  return { id: valor.id, name: valor.nombre, description: valor.descripcion, currency: valor.moneda, locale: valor.idioma, timezone: valor.zonaHoraria, address: valor.direccion, city: valor.ciudad, phone: valor.telefono, email: valor.correo, hours: valor.horarios, coverageText: valor.descripcionCobertura, deliveryFeeMinor: valor.costoEnvioUnidadesMenores, deliveryEnabled: valor.envioHabilitado, updatedAt: valor.actualizadoEn };
}
