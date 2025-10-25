import type { Producto } from './Producto';
import type { Carrito } from './Carrito';

// Entidad completa que retorna la API de carrito-items
export interface CarritoItem {
  id: number;
  carritoId: number;
  productoId: number;
  cantidad: number;
  subtotal: number;
  fechaCreacion: string;
  fechaModificacion: string;
  carrito?: Carrito;
  producto?: Producto;
}

// DTO para crear un item de carrito
export interface CreateCarritoItemDto {
  carritoId: number;
  productoId: number;
  cantidad: number;
  subtotal: number;
}

// DTO para actualizar un item de carrito existente
export type UpdateCarritoItemDto = Partial<{
  cantidad: number;
  subtotal: number;
}>;
