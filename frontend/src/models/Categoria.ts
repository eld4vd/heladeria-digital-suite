// Entidad completa que retorna la API
export interface Categoria {
  id: number;
  nombre: string;
  descripcion: string;
  activo: boolean;
  fechaCreacion: string;
  fechaModificacion: string;
  fechaEliminacion: string | null;
}

// DTO para crear una categoría
export interface CreateCategoriaDto {
  nombre: string;
  descripcion: string;
  activo?: boolean;
}

// DTO para actualizar una categoría existente
export type UpdateCategoriaDto = Partial<CreateCategoriaDto>;