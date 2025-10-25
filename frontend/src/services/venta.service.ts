// src/services/venta.service.ts
import apiService from './api.service';
import type { Venta, CreateVentaDto, UpdateVentaDto } from '../models/Venta';

export const ventaService = {
  // Obtener todas las ventas
  async getVentas(): Promise<Venta[]> {
    return apiService.get<Venta[]>('/ventas');
  },
  // Obtener una venta por ID
  async getVenta(id: number): Promise<Venta> {
    return apiService.get<Venta>(`/ventas/${id}`);
  },
  // Crear una nueva venta
  async createVenta(data: CreateVentaDto): Promise<Venta> {
    const payload: CreateVentaDto = {
      empleadoId: Number(data.empleadoId),
      fechaVenta: data.fechaVenta ?? null,
      total: Number(Number(data.total).toFixed(2)),
      metodoPago: data.metodoPago,
      clienteNombre: data.clienteNombre?.trim() ?? null,
      notas: data.notas?.trim() ?? null,
    };
    return apiService.post<Venta>('/ventas', payload);
  },
  // Actualizar una venta existente
  async updateVenta(id: number, data: UpdateVentaDto): Promise<Venta> {
    const payload: UpdateVentaDto = {
      ...data,
      empleadoId: data.empleadoId === undefined ? undefined : Number(data.empleadoId),
      fechaVenta: data.fechaVenta ?? null,
      total: data.total === undefined ? undefined : Number(Number(data.total).toFixed(2)),
      clienteNombre:
        data.clienteNombre === undefined ? undefined : data.clienteNombre?.trim() ?? null,
      notas: data.notas === undefined ? undefined : data.notas?.trim() ?? null,
    };
    return apiService.patch<Venta>(`/ventas/${id}`, payload);
  },
  // Eliminar una venta
  async deleteVenta(id: number): Promise<void> {
    await apiService.delete<void>(`/ventas/${id}`);
  },
};

export default ventaService;
