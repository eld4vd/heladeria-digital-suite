import type { Empleado } from './Empleado';
import type { DetalleVenta } from './detalle-venta.model';

export type MetodoPago = 'efectivo' | 'tarjeta' | 'transferencia' | 'qr';
export type EstadoVenta = 'completada' | 'devolucion' | 'borrador' | 'anulada';

// Entidad completa que retorna la API de ventas
export interface Venta {
  id: number;
  fechaHora: string;
  fechaVenta: string | null;
  total: number;
  metodoPago: MetodoPago;
  clienteNombre: string | null;
  notas: string | null;
  empleadoId: number;
  empleadoNombreSnapshot: string;
  estado: EstadoVenta;
  fechaCreacion: string;
  fechaModificacion: string;
  fechaEliminacion: string | null;
  empleado?: Empleado;
  detallesVentas?: DetalleVenta[];
}

// DTO para crear una venta
export interface CreateVentaDto {
  empleadoId: number;
  fechaVenta?: string | Date | null;
  total: number;
  metodoPago: MetodoPago;
  clienteNombre?: string | null;
  notas?: string | null;
}

// DTO para actualizar una venta existente
export type UpdateVentaDto = Partial<CreateVentaDto>;
