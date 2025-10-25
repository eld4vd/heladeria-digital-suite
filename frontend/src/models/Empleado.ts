import type { Venta } from './Venta';

// Entidad completa que retorna la API de empleados
export interface Empleado {
  id: number;
  nombre: string;
  email: string;
  activo: boolean;
  fechaCreacion: string;
  fechaModificacion: string;
  fechaEliminacion: string | null;
  ventas?: Venta[];
}

// DTO para crear un empleado
export interface CreateEmpleadoDto {
  nombre: string;
  email: string;
  password: string;
  activo?: boolean;
}

// DTO para actualizar un empleado existente
export type UpdateEmpleadoDto = Partial<CreateEmpleadoDto>;
