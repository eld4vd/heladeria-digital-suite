import api from './api.service';

export interface CarritoResumen {
  id: string;
  createdAt: string;
  total: number;
  itemsCount: number;
  mesa?: string | null;
  estado?: string;
}

export interface CarritoDetalle extends CarritoResumen {
  items: Array<{ producto_id: number; nombre?: string; cantidad: number; precio_unitario: number; subtotal: number }>;
}

export const cajaCarritosService = {
  async getEnviados(): Promise<CarritoResumen[]> {
  // Ruta actualizada según backend: ahora está bajo /caja/carritos/enviados y requiere JWT
  return api.get<CarritoResumen[]>(`/caja/carritos/enviados`);
  },
  async convertir(id: string, payload: { empleado_id: number; metodo_pago: string; cliente_nombre?: string; notas?: string }) {
    return api.post<{ venta_id: number; total: number }>(`/caja/carritos/${id}/convertir`, payload);
  },
  async getDetalle(id: string): Promise<CarritoDetalle> {
    return api.get<CarritoDetalle>(`/caja/carritos/${id}`);
  },
  async eliminar(id: string) {
    return api.delete<{ ok: boolean }>(`/caja/carritos/${id}`);
  }
};
