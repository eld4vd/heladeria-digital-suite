import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { carritoService } from '../services/carrito.service';
import type { Carrito, CreateCarritoDto } from '../models/Carrito';
import type { CarritoItem, CreateCarritoItemDto } from '../models/CarritoItem';
import type { CheckoutCarritoDto } from '../models/PagoSimulado';
import { useCart } from '../context/CartContext';

// Query key factory
const carritoKeys = {
  all: ['carrito'] as const,
  detail: (id: number) => [...carritoKeys.all, id] as const,
  items: (carritoId: number) => [...carritoKeys.all, 'items', carritoId] as const,
};

// Hook para obtener el carrito actual
export function useCarritoActual() {
  const { carritoId } = useCart();

  return useQuery<Carrito, Error, Carrito & { itemCount: number }>({
    queryKey: carritoKeys.detail(carritoId ?? 0),
    queryFn: () => carritoService.obtenerCarrito(carritoId!),
    enabled: carritoId !== null,
    select: (data: Carrito) => ({
      ...data,
      itemCount: data.items?.reduce((sum, item) => sum + item.cantidad, 0) ?? 0,
    }),
  });
}

// Hook para obtener items del carrito
export function useCarritoItems() {
  const { carritoId } = useCart();

  return useQuery<CarritoItem[], Error, { items: CarritoItem[]; total: number; count: number }>({
    queryKey: carritoKeys.items(carritoId ?? 0),
    queryFn: () => carritoService.obtenerItems(carritoId!),
    enabled: carritoId !== null,
    select: (items: CarritoItem[]) => ({
      items,
      total: items.reduce((sum, item) => sum + item.subtotal, 0),
      count: items.reduce((sum, item) => sum + item.cantidad, 0),
    }),
  });
}

// Hook para crear carrito
export function useCrearCarrito() {
  const { setCarritoId } = useCart();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCarritoDto) => carritoService.crearCarrito(data),
    onSuccess: (carrito) => {
      setCarritoId(carrito.id);
      queryClient.setQueryData(carritoKeys.detail(carrito.id), carrito);
    },
  });
}

// Hook para agregar item al carrito
type AddItemInput = { carritoId?: number } & Omit<CreateCarritoItemDto, 'carritoId'>;

export function useAgregarItem() {
  const { carritoId, setItemCount, setTotal } = useCart();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: AddItemInput) => {
      const targetCarritoId = data.carritoId ?? carritoId;
      if (!targetCarritoId) {
        throw new Error('Carrito no disponible');
      }
      return carritoService.agregarItem({
        carritoId: targetCarritoId,
        productoId: data.productoId,
        cantidad: data.cantidad,
        subtotal: data.subtotal,
      });
    },
    onMutate: async (newItem) => {
      const targetCarritoId = newItem.carritoId ?? carritoId;
      if (!targetCarritoId) {
        return { previousItems: undefined, targetCarritoId: null };
      }
      // Cancelar queries pendientes
      await queryClient.cancelQueries({ queryKey: carritoKeys.items(targetCarritoId) });

      // Snapshot del estado anterior
      const previousItems = queryClient.getQueryData<CarritoItem[]>(carritoKeys.items(targetCarritoId));

      // Actualización optimista
      queryClient.setQueryData(
        carritoKeys.items(targetCarritoId),
        (old: CarritoItem[] | undefined) => {
          if (!old) {
            return [{
              ...newItem,
              id: Date.now(),
              carritoId: targetCarritoId,
            } as CarritoItem];
          }
          
          // Buscar si el producto ya existe
          const existingIndex = old.findIndex((item) => item.productoId === newItem.productoId);
          
          if (existingIndex >= 0) {
            // Incrementar cantidad
            const updated = [...old];
            updated[existingIndex] = {
              ...updated[existingIndex],
              cantidad: updated[existingIndex].cantidad + newItem.cantidad,
              subtotal: updated[existingIndex].subtotal + newItem.subtotal,
            };
            return updated;
          }
          
          // Agregar nuevo item (optimista, sin ID real)
          return [...old, { ...newItem, id: Date.now(), carritoId: targetCarritoId } as CarritoItem];
        },
      );

      return { previousItems, targetCarritoId };
    },
    onError: (_err, _newItem, context) => {
      // Revertir en caso de error
      if (context?.previousItems && context.targetCarritoId) {
        queryClient.setQueryData(carritoKeys.items(context.targetCarritoId), context.previousItems);
      }
    },
    onSuccess: (_data, _variables, context) => {
      // Invalidar para obtener datos reales del servidor
      const targetCarritoId = context?.targetCarritoId ?? carritoId;
      if (!targetCarritoId) return;
      queryClient.invalidateQueries({ queryKey: carritoKeys.items(targetCarritoId) });
      queryClient.invalidateQueries({ queryKey: carritoKeys.detail(targetCarritoId) });
    },
    onSettled: (_result, _error, _variables, context) => {
      // Actualizar contador y total desde los datos reales
      const targetCarritoId = context?.targetCarritoId ?? carritoId;
      if (!targetCarritoId) return;
      const items = queryClient.getQueryData<CarritoItem[]>(carritoKeys.items(targetCarritoId));
      if (items) {
        const newCount = items.reduce((sum, item) => sum + item.cantidad, 0);
        const newTotal = Number(items.reduce((sum, item) => sum + item.subtotal, 0).toFixed(2));
        setItemCount(newCount);
        setTotal(newTotal);
      }
    },
  });
}

// Hook para actualizar cantidad de item
export function useActualizarItem() {
  const { carritoId, setItemCount, setTotal } = useCart();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, cantidad }: { id: number; cantidad: number }) =>
      carritoService.actualizarItem(id, { cantidad }),
    onMutate: async ({ id, cantidad }) => {
      await queryClient.cancelQueries({ queryKey: carritoKeys.items(carritoId!) });

      const previousItems = queryClient.getQueryData(carritoKeys.items(carritoId!));

      // Actualización optimista
      queryClient.setQueryData(
        carritoKeys.items(carritoId!),
        (old: CarritoItem[] | undefined) => {
          if (!old) return [];
          return old.map((item) => {
            if (item.id === id) {
              // Calcular precio unitario y nuevo subtotal
              const precioUnitario = item.producto?.precio || (item.subtotal / item.cantidad);
              const nuevoSubtotal = Number((precioUnitario * cantidad).toFixed(2));
              return { 
                ...item, 
                cantidad, 
                subtotal: nuevoSubtotal
              };
            }
            return item;
          });
        },
      );

      return { previousItems };
    },
    onError: (_err, _vars, context) => {
      if (context?.previousItems) {
        queryClient.setQueryData(carritoKeys.items(carritoId!), context.previousItems);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: carritoKeys.items(carritoId!) });
      queryClient.invalidateQueries({ queryKey: carritoKeys.detail(carritoId!) });
    },
    onSettled: () => {
      const items = queryClient.getQueryData<CarritoItem[]>(carritoKeys.items(carritoId!));
      if (items) {
        const newCount = items.reduce((sum, item) => sum + item.cantidad, 0);
        const newTotal = Number(items.reduce((sum, item) => sum + item.subtotal, 0).toFixed(2));
        setItemCount(newCount);
        setTotal(newTotal);
      }
    },
  });
}

// Hook para eliminar item
export function useEliminarItem() {
  const { carritoId, setItemCount, setTotal } = useCart();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => carritoService.eliminarItem(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: carritoKeys.items(carritoId!) });

      const previousItems = queryClient.getQueryData(carritoKeys.items(carritoId!));

      // Actualización optimista
      queryClient.setQueryData(
        carritoKeys.items(carritoId!),
        (old: CarritoItem[] | undefined) => {
          if (!old) return [];
          return old.filter((item) => item.id !== id);
        },
      );

      return { previousItems };
    },
    onError: (_err, _vars, context) => {
      if (context?.previousItems) {
        queryClient.setQueryData(carritoKeys.items(carritoId!), context.previousItems);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: carritoKeys.items(carritoId!) });
      queryClient.invalidateQueries({ queryKey: carritoKeys.detail(carritoId!) });
    },
    onSettled: () => {
      const items = queryClient.getQueryData<CarritoItem[]>(carritoKeys.items(carritoId!));
      if (items) {
        const newCount = items.reduce((sum, item) => sum + item.cantidad, 0);
        const newTotal = Number(items.reduce((sum, item) => sum + item.subtotal, 0).toFixed(2));
        setItemCount(newCount);
        setTotal(newTotal);
      }
    },
  });
}

// Hook para checkout
export function useCheckout() {
  const { carritoId, clearCart } = useCart();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CheckoutCarritoDto) => carritoService.checkout(carritoId!, data),
    onSuccess: () => {
      // Limpiar carrito local
      clearCart();
      // Invalidar queries
      queryClient.invalidateQueries({ queryKey: carritoKeys.all });
    },
  });
}
