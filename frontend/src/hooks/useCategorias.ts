// src/hooks/useCategorias.ts
import { useQuery, type QueryKey } from '@tanstack/react-query';
import { categoriaService } from '../services/categoria.service';
import type { Categoria } from '../models/Categoria';

export interface CategoriaResumen {
  id: number;
  nombre: string;
}

export interface CategoriasResult {
  list: CategoriaResumen[];
  byId: Record<number, CategoriaResumen>;
}

export const CATEGORIAS_QUERY_KEY: QueryKey = ['categorias'];

const useCategorias = () => {
  return useQuery<Categoria[], Error, CategoriasResult>({
    queryKey: CATEGORIAS_QUERY_KEY,
    queryFn: categoriaService.getCategorias,
    staleTime: 300_000,
    gcTime: 600_000,
    refetchOnWindowFocus: true,
    select: (categorias) => {
      // Combinar filter+map en una sola iteración (rule 7.6) e inmutable sort (rule 7.12)
      const activas: CategoriaResumen[] = [];
      const byId: Record<number, CategoriaResumen> = {};

      for (const categoria of categorias) {
        if (categoria.activo) {
          const resumen: CategoriaResumen = { id: categoria.id, nombre: categoria.nombre };
          activas.push(resumen);
          byId[categoria.id] = resumen;
        }
      }

      activas.sort((a, b) => a.nombre.localeCompare(b.nombre));

      return { list: activas, byId } satisfies CategoriasResult;
    },
  });
};

export default useCategorias;

/*
Este hook retorna categorías activas con orden alfabético y un índice por ID listo para consumirse en la UI.
*/
