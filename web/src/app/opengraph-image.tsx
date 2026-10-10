import { socialImage } from '@/components/seo/SocialImage';
import { publicApi } from '@/lib/server-api';
import type { ShopSettings } from '@/lib/types';
import { BRAND_NAME } from '@/lib/brand';

export const alt = 'Heladería Sucre: catálogo de helados y pedidos de demostración';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const dynamic = 'force-dynamic';

export default async function Image() {
  let settings: ShopSettings | null = null;
  try { settings = await publicApi<ShopSettings>('/settings'); } catch { /* No se inventan datos del negocio. */ }
  return socialImage({
    brand: settings?.name || BRAND_NAME,
    title: 'Un poquito de felicidad.',
    subtitle: settings?.city ? 'Encuentra tu helado favorito y disfruta de un momento dulce en ' + settings.city + '.' : 'Encuentra tu helado favorito y disfruta de un momento dulce.',
  });
}
