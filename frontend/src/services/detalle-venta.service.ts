// src/services/detalle-venta.service.ts
import apiService from './api.service';
import type {
  DetalleVenta,
  CreateDetalleVentaDto,
  UpdateDetalleVentaDto,
} from '../models/detalle-venta.model';

export const detalleVentaService = {
  async getDetalles(): Promise<DetalleVenta[]> {
    return apiService.get<DetalleVenta[]>(`/detalles-ventas`);
  },
  async getDetalle(id: number): Promise<DetalleVenta> {
    return apiService.get<DetalleVenta>(`/detalles-ventas/${id}`);
  },
  async createDetalle(data: CreateDetalleVentaDto): Promise<DetalleVenta> {
    const payload: CreateDetalleVentaDto = {
      ventaId: Number(data.ventaId),
      productoId: Number(data.productoId),
      cantidad: Number(data.cantidad),
      precioUnitario: Number(Number(data.precioUnitario).toFixed(2)),
      subtotal: Number(Number(data.subtotal).toFixed(2)),
    };
    return apiService.post<DetalleVenta>(`/detalles-ventas`, payload);
  },
  async updateDetalle(id: number, data: UpdateDetalleVentaDto): Promise<DetalleVenta> {
    const payload: UpdateDetalleVentaDto = {
      ...data,
      ventaId: data.ventaId === undefined ? undefined : Number(data.ventaId),
      productoId: data.productoId === undefined ? undefined : Number(data.productoId),
      cantidad: data.cantidad === undefined ? undefined : Number(data.cantidad),
      precioUnitario:
        data.precioUnitario === undefined
          ? undefined
          : Number(Number(data.precioUnitario).toFixed(2)),
      subtotal:
        data.subtotal === undefined
          ? undefined
          : Number(Number(data.subtotal).toFixed(2)),
    };
    return apiService.patch<DetalleVenta>(`/detalles-ventas/${id}`, payload);
  },
  async deleteDetalle(id: number): Promise<void> {
    await apiService.delete<void>(`/detalles-ventas/${id}`);
  },
};

export default detalleVentaService;
