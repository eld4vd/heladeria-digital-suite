import type { CarritoItem } from './CarritoItem';

export type EstadoCarrito = 'activo' | 'pagado' | 'cancelado';

// Entidad completa que retorna la API de carritos
export interface Carrito {
  id: number;
  clienteId: number | null;
  clienteTempId: string | null;
  estado: EstadoCarrito;
  total: number;
  fechaCreacion: string;
  fechaModificacion: string;
  items?: CarritoItem[];
}

// DTO para crear un carrito
export interface CreateCarritoDto {
  clienteTempId: string;
  clienteId?: number | null;
}

// DTO para actualizar un carrito existente
export type UpdateCarritoDto = Partial<{
  estado: EstadoCarrito;
  total: number;
}>;
