// src/hooks/useProductos.ts
import { useQuery, type QueryKey } from "@tanstack/react-query";
import { fetchHelados } from "../services/producto.service";
import type { Producto } from "../models/Producto";

export interface ProductoResumen {
  id: number;
  nombre: string;
  descripcion: string | null;
  sabor: string;
  precio: number;
  stock: number;
  imagenUrl: string | null;
  categoria: {
    id: number | "sin";
    nombre: string;
  };
}

export interface ProductosPorCategoria {
  sections: Array<{
    id: number | "sin";
    nombre: string;
    items: ProductoResumen[];
  }>;
  flat: ProductoResumen[];
  countsByCategory: Record<string, number>;
  sectionsById: Record<string, { id: number | "sin"; nombre: string; items: ProductoResumen[] }>;
}

interface UseProductosOptions {
  refetchInterval?: number;
}

export const HELADOS_QUERY_KEY: QueryKey = ["helados"];

const useProductos = (options: UseProductosOptions = {}) => {
  return useQuery<Producto[], Error, ProductosPorCategoria>({
    queryKey: HELADOS_QUERY_KEY,
    queryFn: fetchHelados,
    staleTime: 120_000,
    gcTime: 300_000,
    refetchInterval: options.refetchInterval,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
    select: (data) => {
      const map = new Map<
        number | "sin",
        { id: number | "sin"; nombre: string; items: ProductoResumen[] }
      >();

      const normalizados: ProductoResumen[] = data
        .filter((producto) => producto.activo && Number(producto.stock) > 0)
        .map((producto) => {
          const categoriaId = producto.categoria?.id ?? producto.categoriaId ?? "sin";
          const categoriaNombre = producto.categoria?.nombre ?? "Otros";
          return {
            id: producto.id,
            nombre: producto.nombre,
            descripcion: producto.descripcion,
            sabor: producto.sabor,
            precio: Number(producto.precio),
            stock: Number(producto.stock),
            imagenUrl: producto.imagenUrl,
            categoria: {
              id: categoriaId,
              nombre: categoriaNombre,
            },
          } satisfies ProductoResumen;
        })
        .sort((a, b) => a.nombre.localeCompare(b.nombre));

      for (const producto of normalizados) {
        if (!map.has(producto.categoria.id)) {
          map.set(producto.categoria.id, {
            id: producto.categoria.id,
            nombre: producto.categoria.nombre,
            items: [],
          });
        }
        map.get(producto.categoria.id)!.items.push(producto);
      }

      const sections = Array.from(map.values()).sort((a, b) =>
        a.nombre.localeCompare(b.nombre)
      );
      const countsByCategory = Object.fromEntries(
        sections.map((section) => [String(section.id), section.items.length])
      );
      const sectionsById = Object.fromEntries(
        sections.map((section) => [String(section.id), section])
      );

      return {
        sections,
        flat: normalizados,
        countsByCategory,
        sectionsById,
      } satisfies ProductosPorCategoria;
    },
  });
};

export default useProductos;
