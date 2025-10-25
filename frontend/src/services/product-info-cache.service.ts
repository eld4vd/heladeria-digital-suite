import { productService } from './producto.service';

export const productInfoCache: Record<number, { nombre: string; imagenUrl?: string | null }> = {};

export async function ensureProductsInfo(ids: number[]) {
  const missing = Array.from(new Set(ids.filter((id) => !productInfoCache[id])));
  if (missing.length === 0) return;
  await Promise.allSettled(
    missing.map(async (id) => {
      try {
        const p = await productService.getProducto(id);
        productInfoCache[id] = { nombre: p.nombre, imagenUrl: (p as any).imagenUrl ?? (p as any).imagen_url ?? null };
      } catch {
        // ignorar errores individuales
      }
    })
  );
}
