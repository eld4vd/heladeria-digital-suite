import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { notFound } from 'next/navigation';
import { publicApi } from '@/lib/server-api';
import { ApiError } from '@/lib/api';
import { breadcrumbSchema, pageMetadata, productSchema } from '@/lib/seo';
import { productPath } from '@/lib/site-config';
import { JsonLd } from '@/components/seo/JsonLd';
import type { Product, ShopSettings } from '@/lib/types';
import { ProductConfigurator } from '@/components/shop/ProductConfigurator';
import { ProductImageStage } from '@/components/shop/ProductImageStage';
import { ProductCard } from '@/components/shop/ProductCard';
import { Unavailable } from '@/components/shop/Unavailable';
import purchase from '@/components/shop/ProductPurchase.module.css';

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const [product, settings] = await Promise.all([
      publicApi<Product>('/catalog/' + encodeURIComponent(slug)), publicApi<ShopSettings>('/settings'),
    ]);
    return pageMetadata({ title: product.name, description: product.description + ' Elige el tamaño y añade extras si te apetece. Pagos simulados.', path: productPath(product.slug), settings });
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    return pageMetadata({ title: 'Producto no disponible', description: 'El catálogo no está disponible temporalmente.', path: productPath(slug), indexable: false });
  }
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  let product: Product;
  let settings: ShopSettings;
  let catalog: { products: Product[] };
  try {
    [product, settings, catalog] = await Promise.all([publicApi<Product>(`/catalog/${encodeURIComponent(slug)}`), publicApi<ShopSettings>('/settings'), publicApi<{ products: Product[] }>('/catalog')]);
  } catch (cause) {
    if (typeof cause === 'object' && cause !== null && 'status' in cause && Number(cause.status) === 404) notFound();
    return <Unavailable title="Esta delicia no está disponible" description="No pudimos conectar con la heladería. Puedes volver al catálogo e intentarlo nuevamente." />;
  }
    const related = catalog.products.filter((item) => item.id !== product.id).sort((a, b) => Number(b.categoryId === product.categoryId) - Number(a.categoryId === product.categoryId)).slice(0, 4);
    return <div className="container"><JsonLd data={productSchema(product, settings)} /><JsonLd data={breadcrumbSchema([{ name: 'Inicio', path: '/' }, { name: 'Helados', path: '/catalogo' }, { name: product.name, path: productPath(product.slug) }])} />
      <nav className="mx-auto max-w-[1060px] pt-4 pb-1 sm:pt-6" aria-label="Volver a la tienda">
        <Link href="/catalogo" className="inline-flex min-h-11 items-center gap-2 rounded-full border border-brand-control px-4 font-sans text-sm font-extrabold no-underline transition-colors hover:border-brand-berry hover:bg-brand-blush"><ArrowLeft size={18} aria-hidden="true" focusable="false" />Volver al catálogo</Link>
      </nav>
      <div className={purchase.layout}>
      <ProductImageStage key={product.imageUrl} src={product.imageUrl} name={product.name} /><ProductConfigurator key={product.id} product={product} settings={settings} />
    </div>{related.length > 0 && <section className={purchase.related} aria-labelledby="otros-helados"><h2 id="otros-helados">¿Otro antojo?</h2><div className={purchase.relatedGrid}>{related.map(item => <ProductCard key={item.id} product={item} currency={settings.currency} locale={settings.locale} variant="catalog" />)}</div></section>}</div>;
}
