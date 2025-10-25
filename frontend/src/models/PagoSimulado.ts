import type { Venta } from './Venta';

export type MetodoPagoSimulado = 'qr' | 'debito';
export type EstadoPago = 'pendiente' | 'aprobado' | 'rechazado';

// Entidad completa que retorna la API de pagos-simulados
export interface PagoSimulado {
  id: number;
  ventaId: number;
  metodoPago: MetodoPagoSimulado;
  monto: number;
  codigoQr: string | null;
  numeroTarjeta: string | null;
  nombreTitular: string | null;
  estadoPago: EstadoPago;
  fechaPago: string | null;
  fechaCreacion: string;
  fechaModificacion: string;
  clienteNombre?: string | null;
  direccionEntrega?: string | null;
  telefono?: string | null;
  venta?: Venta;
}

// Datos de tarjeta para checkout
export interface DatosTarjetaDto {
  numeroTarjeta: string;
  nombreTitular: string;
  cvv: string;
}

// DTO para crear un pago simulado (usado internamente en checkout)
export interface CreatePagoSimuladoDto {
  ventaId: number;
  metodoPago: MetodoPagoSimulado;
  monto: number;
  codigoQr?: string | null;
  numeroTarjeta?: string | null;
  nombreTitular?: string | null;
  estadoPago?: EstadoPago;
  clienteNombre?: string | null;
  direccionEntrega?: string | null;
  telefono?: string | null;
}

// DTO para checkout del carrito (carritoId se pasa por separado en el servicio)
export interface CheckoutCarritoDto {
  metodoPago: MetodoPagoSimulado;
  datosTarjeta?: DatosTarjetaDto;
  clienteNombre?: string;
  direccionEntrega?: string;
  telefono?: string;
}
