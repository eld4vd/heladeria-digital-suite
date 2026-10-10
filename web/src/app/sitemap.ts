import type { MetadataRoute } from 'next';
import { publicApi } from '@/lib/server-api';
import { absoluteUrl, isSiteIndexable, productPath } from '@/lib/site-config';
import type { Product, ShopSettings } from '@/lib/types';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  if (!isSiteIndexable) return [];
  const editorial: MetadataRoute.Sitemap = ['/', '/heladeria', '/contacto'].map((path) => ({ url: absoluteUrl(path) }));
  const entries: MetadataRoute.Sitemap = [...editorial, { url: absoluteUrl('/catalogo') }];
  try {
    const [catalog, settings] = await Promise.all([
      publicApi<{ products: Product[] }>('/catalog'), publicApi<ShopSettings>('/settings'),
    ]);
    if (!settings.name.trim()) return [];
    if (!catalog.products.length) return editorial;
    return [...entries, ...catalog.products.filter((product) => product.active && product.category?.active !== false).map((product) => {
      const updated = product.updatedAt ? new Date(product.updatedAt) : null;
      return {
        url: absoluteUrl(productPath(product.slug)),
        ...(updated && !Number.isNaN(updated.getTime()) ? { lastModified: updated } : {}),
        ...(product.imageUrl ? { images: [absoluteUrl(product.imageUrl)] } : {}),
      };
    })];
  } catch {
    // No guarda permanentemente en caché un sitemap incompleto tras un fallo temporal de la API.
    return entries;
  }
}
