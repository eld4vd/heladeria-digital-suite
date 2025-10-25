import type { Categoria } from './Categoria';

// Entidad completa que retorna la API de productos
export interface Producto {
  id: number;
  nombre: string;
  descripcion: string | null;
  sabor: string;
  precio: number;
  stock: number;
  imagenUrl: string | null;
  categoriaId: number;
  activo: boolean;
  fechaCreacion: string;
  fechaModificacion: string;
  fechaEliminacion: string | null;
  categoria?: Categoria;
}

// DTO para crear un producto
export interface CreateProductoDto {
  nombre: string;
  descripcion?: string | null;
  sabor: string;
  precio: number;
  stock: number;
  imagenUrl?: string | null;
  categoriaId: number;
  activo?: boolean;
}

// DTO para actualizar un producto existente
export type UpdateProductoDto = Partial<CreateProductoDto>;