// src/services/categoria.service.ts
import { type Categoria, type CreateCategoriaDto, type UpdateCategoriaDto } from '../models/Categoria';
import apiService from './api.service';

export const categoriaService = {
  // Obtener todas las categorías
  async getCategorias(): Promise<Categoria[]> {
    return apiService.get<Categoria[]>('/categorias');
  },

  // Crear una nueva categoría
  async createCategoria(categoria: CreateCategoriaDto): Promise<Categoria> {
    const payload: CreateCategoriaDto = {
      nombre: categoria.nombre.trim(),
      descripcion: categoria.descripcion.trim(),
      activo: categoria.activo ?? true,
    };
    return apiService.post<Categoria>('/categorias', payload);
  },

  // Actualizar una categoría
  async updateCategoria(id: number, categoria: UpdateCategoriaDto): Promise<Categoria> {
    const payload: UpdateCategoriaDto = {
      ...categoria,
      nombre: categoria.nombre?.trim(),
      descripcion: categoria.descripcion?.trim(),
    };
    return apiService.patch<Categoria>(`/categorias/${id}`, payload);
  },

  // Eliminar una categoría
  async deleteCategoria(id: number): Promise<void> {
    await apiService.delete<void>(`/categorias/${id}`);
  },
};