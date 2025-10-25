// src/hooks/useProducto.ts
import { useQuery } from '@tanstack/react-query';
import { productService } from '../services/producto.service';
import type { Producto } from '../models/Producto';

export interface ProductoDetalle {
  id: number;
  nombre: string;
  descripcion: string | null;
  sabor: string;
  precio: number;
  imagenUrl: string | null;
  categoria: {
    id: number | null;
    nombre: string | null;
  };
}

export const useProducto = (id?: number) => {
  return useQuery<Producto, Error, ProductoDetalle>({
    queryKey: ['producto', id],
    queryFn: () => {
      if (id == null || Number.isNaN(id)) throw new Error('ID inválido');
      return productService.getProducto(id);
    },
    enabled: id != null && !Number.isNaN(id),
    staleTime: 120_000,
    retry: 1,
    select: (producto) => ({
      id: producto.id,
      nombre: producto.nombre,
      descripcion: producto.descripcion,
      sabor: producto.sabor,
      precio: Number(producto.precio),
      imagenUrl: producto.imagenUrl,
      categoria: {
        id: producto.categoria?.id ?? producto.categoriaId ?? null,
        nombre: producto.categoria?.nombre ?? null,
      },
    }),
  });
};

/*
Este hook obtiene los detalles de un producto por ID usando React Query.
- La consulta solo se activa si el ID es válido.
- Configura tiempos de vida en caché y reintentos limitados.
- queryKey incluye el ID para diferenciar cachés.
- queryFn lanza error si el ID es inválido.
UTIL para detalles de producto en componentes.
*/
