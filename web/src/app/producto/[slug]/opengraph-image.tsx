import { socialImage } from '@/components/seo/SocialImage';
import { ApiError } from '@/lib/api';
import { publicApi } from '@/lib/server-api';
import type { Product, ShopSettings } from '@/lib/types';

export const alt = 'Helado del catálogo: combinaciones y presentaciones de demostración';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const dynamic = 'force-dynamic';

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  try {
    const [product, settings] = await Promise.all([
      publicApi<Product>('/catalog/' + encodeURIComponent(slug)),
      publicApi<ShopSettings>('/settings'),
    ]);
    return socialImage({ brand: settings.name, title: product.name, subtitle: product.description });
  } catch (error) {
    const status = error instanceof ApiError && error.status === 404 ? 404 : 503;
    return new Response(status === 404 ? 'Producto no encontrado.' : 'Catálogo temporalmente no disponible.', { status, headers: { 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex' } });
  }
}
