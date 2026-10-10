import 'server-only';
import type { Metadata } from 'next';
import type { Product, ShopSettings } from './types';
import { absoluteUrl, isSiteIndexable, productPath } from './site-config';
import { BRAND_NAME } from './brand';

export function descriptionText(value: string) {
  const text = value.replace(/\s+/g, ' ').trim();
  return text.length <= 170 ? text : text.slice(0, 167).replace(/\s+\S*$/, '') + '…';
}

export function pageMetadata({ title, description, path, settings, absoluteTitle = false, indexable = true }: {
  title: string; description: string; path: string; settings?: ShopSettings | null; absoluteTitle?: boolean; indexable?: boolean;
}): Metadata {
  const brand = settings?.name || BRAND_NAME;
  const pageTitle = absoluteTitle ? title : title + ' | ' + brand;
  const summary = descriptionText(description);
  const canIndex = isSiteIndexable && indexable && (!settings || Boolean(settings.name.trim()));
  return {
    title: { absolute: pageTitle },
    description: summary,
    alternates: { canonical: absoluteUrl(path) },
    openGraph: {
      type: 'website', locale: (settings?.locale || 'es-BO').replace(/-/g, '_'),
      siteName: brand, title: pageTitle, description: summary, url: absoluteUrl(path),
    },
    twitter: { card: 'summary_large_image', title: pageTitle, description: summary },
    robots: {
      index: canIndex, follow: canIndex,
      ...(canIndex ? { googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 } } : {}),
    },
  };
}

export function breadcrumbSchema(items: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem', position: index + 1, name: item.name, item: absoluteUrl(item.path),
    })),
  };
}

export function homeSchema(settings: ShopSettings) {
  if (!settings.name.trim()) return null;
  const businessId = absoluteUrl('/#heladeria');
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'IceCreamShop', '@id': businessId, url: absoluteUrl('/'),
        name: settings.name, description: settings.description,
        ...(settings.phone ? { telephone: settings.phone } : {}),
        ...(settings.email ? { email: settings.email } : {}),
        ...(settings.address && settings.city ? {
          address: { '@type': 'PostalAddress', streetAddress: settings.address, addressLocality: settings.city },
        } : {}),
        hasMenu: absoluteUrl('/catalogo'),
      },
      {
        '@type': 'WebSite', '@id': absoluteUrl('/#website'), url: absoluteUrl('/'),
        name: settings.name, inLanguage: settings.locale, publisher: { '@id': businessId },
      },
    ],
  };
}

export function catalogSchema(products: Product[], settings: ShopSettings) {
  if (!settings.name.trim() || !products.length) return null;
  return {
    '@context': 'https://schema.org', '@type': 'CollectionPage',
    '@id': absoluteUrl('/catalogo#catalogo'), url: absoluteUrl('/catalogo'),
    name: 'Catálogo de helados | ' + settings.name, inLanguage: settings.locale,
    isPartOf: { '@id': absoluteUrl('/#website') },
    mainEntity: {
      '@type': 'ItemList', numberOfItems: products.length,
      itemListElement: products.map((product, index) => ({
        '@type': 'ListItem', position: index + 1, name: product.name,
        url: absoluteUrl(productPath(product.slug)),
      })),
    },
  };
}

export function productSchema(product: Product, settings: ShopSettings) {
  // El pago es simulado. No se anuncian precios de demostración como ofertas reales de compra.
  // No se inventan reseñas, valoraciones, promesas de entrega, país ni horarios del negocio.
  return {
    '@context': 'https://schema.org', '@type': 'Product',
    '@id': absoluteUrl(productPath(product.slug) + '#producto'),
    url: absoluteUrl(productPath(product.slug)), name: product.name,
    description: product.description,
    ...(product.imageUrl ? { image: [absoluteUrl(product.imageUrl)] } : {}),
    ...(product.category?.name ? { category: product.category.name } : {}),
    ...(settings.name.trim() ? { brand: { '@type': 'Brand', name: settings.name } } : {}),
  };
}
