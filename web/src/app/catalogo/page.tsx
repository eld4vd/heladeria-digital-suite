import type { Metadata } from 'next';
import { Suspense } from 'react';
import type { Category, Product, ShopSettings } from '@/lib/types';
import { publicApi } from '@/lib/server-api';
import { breadcrumbSchema, catalogSchema, pageMetadata } from '@/lib/seo';
import { JsonLd } from '@/components/seo/JsonLd';
import { CatalogBrowser } from '@/components/shop/CatalogBrowser';
import { Unavailable } from '@/components/shop/Unavailable';
import { PageLoading } from '@/components/shop/PageLoading';

export async function generateMetadata(): Promise<Metadata> {
  try {
    const [data, settings] = await Promise.all([
      publicApi<{ products: Product[] }>('/catalog'), publicApi<ShopSettings>('/settings'),
    ]);
    if (!settings.name.trim()) return pageMetadata({ title: 'Catálogo de helados', description: 'Nuestro catálogo estará disponible próximamente.', path: '/catalogo', indexable: false });
    return pageMetadata({
      title: 'Catálogo de helados en ' + settings.city,
      description: 'Descubre los helados de ' + settings.name + ', sus sabores, tamaños y extras opcionales. Pedidos de delivery en ' + settings.city + ' con pagos simulados.',
      path: '/catalogo', settings, indexable: data.products.length > 0,
    });
  } catch {
    return pageMetadata({ title: 'Catálogo temporalmente no disponible', description: 'Vuelve a consultar nuestro catálogo cuando se restablezca el servicio.', path: '/catalogo', indexable: false });
  }
}

export default async function CatalogPage() {
  let data: { products: Product[]; categories: Category[] };
  let settings: ShopSettings;
  try {
    [data, settings] = await Promise.all([publicApi<{ products: Product[]; categories: Category[] }>('/catalog'), publicApi<ShopSettings>('/settings')]);
  } catch {
    return <Unavailable />;
  }
  return <div className="container">
    <JsonLd data={catalogSchema(data.products, settings)} />
    <JsonLd data={breadcrumbSchema([{ name: 'Inicio', path: '/' }, { name: 'Helados', path: '/catalogo' }])} />
    <Suspense fallback={<PageLoading contained={false} message="Cargando la carta de helados…" />}>
      <CatalogBrowser products={data.products} categories={data.categories} currency={settings.currency} locale={settings.locale} />
    </Suspense>
  </div>;
}
