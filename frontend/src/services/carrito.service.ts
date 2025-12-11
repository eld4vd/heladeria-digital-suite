import apiService from './api.service';
import type { Carrito, CreateCarritoDto } from '../models/Carrito';
import type { CarritoItem, CreateCarritoItemDto, UpdateCarritoItemDto } from '../models/CarritoItem';
import type { CheckoutCarritoDto } from '../models/PagoSimulado';
import type { Venta } from '../models/Venta';

// Exportar el tipo para que pueda ser importado
export type { CheckoutCarritoDto } from '../models/PagoSimulado';

class CarritoService {
  // Crear carrito
  async crearCarrito(data: CreateCarritoDto): Promise<Carrito> {
    return apiService.post<Carrito>('/carritos', data);
  }

  // Obtener carrito con items
  async obtenerCarrito(id: number): Promise<Carrito> {
    return apiService.get<Carrito>(`/carritos/${id}`);
  }

  // Agregar item al carrito
  async agregarItem(data: CreateCarritoItemDto): Promise<CarritoItem> {
    return apiService.post<CarritoItem>('/carrito-items', data);
  }

  // Listar items de un carrito
  async obtenerItems(carritoId: number): Promise<CarritoItem[]> {
    return apiService.get<CarritoItem[]>(`/carrito-items/carrito/${carritoId}`);
  }

  // Actualizar cantidad de un item
  async actualizarItem(id: number, data: UpdateCarritoItemDto): Promise<CarritoItem> {
    return apiService.patch<CarritoItem>(`/carrito-items/${id}`, data);
  }

  // Eliminar item del carrito
  async eliminarItem(id: number): Promise<void> {
    return apiService.delete<void>(`/carrito-items/${id}`);
  }

  // Checkout
  async checkout(carritoId: number, data: CheckoutCarritoDto): Promise<Venta> {
    return apiService.post<Venta>('/carritos/checkout', {
      ...data,
      carritoId,
    });
  }
}

export const carritoService = new CarritoService();
