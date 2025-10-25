// src/services/producto.service.ts
import type {
  Producto,
  CreateProductoDto,
  UpdateProductoDto,
} from '../models/Producto';
import apiService from './api.service';

// Listado público (por ejemplo, catálogo) de productos activos con stock
const fetchHelados = async (): Promise<Producto[]> => {
  const data = await apiService.get<Producto[]>(`/productos`);
  return data.filter((helado) => helado.activo && helado.stock > 0);
};

// CRUD para panel de empleado/administración
export const productService = {
  async getProductos(): Promise<Producto[]> {
    return apiService.get<Producto[]>(`/productos`);
  },

  async getProducto(id: number): Promise<Producto> {
    return apiService.get<Producto>(`/productos/${id}`);
  },

  async createProducto(producto: CreateProductoDto): Promise<Producto> {
    const payload: CreateProductoDto = {
      nombre: producto.nombre.trim(),
      descripcion: producto.descripcion?.trim() ?? null,
      sabor: producto.sabor.trim(),
      precio: Number(Number(producto.precio).toFixed(2)),
      stock: Number(producto.stock),
      imagenUrl: producto.imagenUrl?.trim() ?? null,
      categoriaId: Number(producto.categoriaId),
      activo: producto.activo ?? true,
    };
    return apiService.post<Producto>(`/productos`, payload);
  },

  async updateProducto(id: number, producto: UpdateProductoDto): Promise<Producto> {
    const payload: UpdateProductoDto = {
      ...producto,
      nombre: producto.nombre?.trim(),
      descripcion: producto.descripcion === undefined ? undefined : producto.descripcion?.trim() ?? null,
      sabor: producto.sabor?.trim(),
      precio: producto.precio === undefined ? undefined : Number(Number(producto.precio).toFixed(2)),
      stock: producto.stock === undefined ? undefined : Number(producto.stock),
      imagenUrl: producto.imagenUrl === undefined ? undefined : producto.imagenUrl?.trim() ?? null,
      categoriaId: producto.categoriaId === undefined ? undefined : Number(producto.categoriaId),
    };
    return apiService.patch<Producto>(`/productos/${id}`, payload);
  },

  async deleteProducto(id: number): Promise<void> {
    await apiService.delete<void>(`/productos/${id}`);
  },

  // Ajuste de stock delegando la operación al backend para evitar race conditions
  async adjustStock(productoId: number, delta: number): Promise<Producto> {
    return apiService.post<Producto>(`/productos/${productoId}/adjust-stock`, { delta });
  },
};

export { fetchHelados };

// Nota: mantenemos fetchHelados para vistas públicas, y productService para el panel de gestión.