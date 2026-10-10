import type { MetadataRoute } from 'next';
import { absoluteUrl, isSiteIndexable } from '@/lib/site-config';

export default function robots(): MetadataRoute.Robots {
  // El HTML privado debe permitir el rastreo para que los robots puedan leer sus etiquetas noindex.
  // La autenticación protege los datos personales, no robots.txt.
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/api/'] },
    ...(isSiteIndexable ? { sitemap: absoluteUrl('/sitemap.xml') } : {}),
  };
}
