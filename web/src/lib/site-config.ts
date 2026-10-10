// Este módulo se comparte entre los metadatos del servidor y next.config.ts, nunca con el código del cliente.
const configuredUrl = new URL(process.env.NEXT_PUBLIC_SITE_URL?.trim() || 'http://localhost:3000');
if (!['http:', 'https:'].includes(configuredUrl.protocol) || configuredUrl.username || configuredUrl.password || configuredUrl.pathname !== '/' || configuredUrl.search || configuredUrl.hash) {
  throw new Error('NEXT_PUBLIC_SITE_URL debe ser el origen de la tienda, sin rutas, credenciales, parámetros ni fragmentos.');
}
if (process.env.SEO_INDEXABLE !== undefined && !['true', 'false'].includes(process.env.SEO_INDEXABLE)) {
  throw new Error('SEO_INDEXABLE debe ser true o false.');
}

export const siteOrigin = configuredUrl.origin;
const localHost = configuredUrl.hostname === 'localhost'
  || configuredUrl.hostname === '[::1]'
  || configuredUrl.hostname.startsWith('127.')
  || /\.(localhost|local|test|invalid|example)$/.test(configuredUrl.hostname);
export const isSiteIndexable = process.env.SEO_INDEXABLE === 'true'
  && process.env.NODE_ENV === 'production'
  && configuredUrl.protocol === 'https:'
  && !localHost;

export const privateRoutePrefixes = ['/cuenta', '/checkout', '/carrito', '/pedidos', '/login', '/registro', '/api', '/admin'];

export function absoluteUrl(path = '/') {
  return new URL(path, siteOrigin + '/').toString();
}

export function productPath(slug: string) {
  return '/producto/' + encodeURIComponent(slug);
}
