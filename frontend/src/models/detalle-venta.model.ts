import type { Venta } from './Venta';
import type { Producto } from './Producto';

// Entidad completa que retorna la API de detalles de venta
export interface DetalleVenta {
  id: number;
  ventaId: number;
  productoId: number;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
  fechaCreacion: string;
  fechaModificacion: string;
  fechaEliminacion: string | null;
  venta?: Venta;
  producto?: Producto;
}

// DTO para crear un detalle de venta
export interface CreateDetalleVentaDto {
  ventaId: number;
  productoId: number;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

// DTO para actualizar un detalle de venta existente
export type UpdateDetalleVentaDto = Partial<CreateDetalleVentaDto>;
