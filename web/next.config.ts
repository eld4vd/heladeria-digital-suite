import type { NextConfig } from 'next';
import { fileURLToPath } from 'node:url';
import { isSiteIndexable, privateRoutePrefixes } from './src/lib/site-config';
const apiOrigin = process.env.API_INTERNAL_URL ?? 'http://127.0.0.1:4000';
// Turbopack conserva la configuración predeterminada de Next; los archivos temporales de compilación quedan en .next.
const config: NextConfig = {
  output: 'standalone', poweredByHeader: false,
  images: {
    // Las imágenes de la portada son locales. Se conserva la URL editorial permitida anteriormente.
    remotePatterns: [
      new URL('https://images.unsplash.com/photo-1501443762994-82bd5dace89a?auto=format&fit=crop&w=1000&q=85'),
    ],
  },
  outputFileTracingRoot: fileURLToPath(new URL('../', import.meta.url)),
  async rewrites() { return [{ source: '/api/v1/:path*', destination: `${apiOrigin}/api/v1/:path*` }]; },
  async headers() {
    return [{ source: '/:path*', headers: [
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      { key: 'X-Frame-Options', value: 'DENY' },
      { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' }
    ] },
    ...(!isSiteIndexable ? [{ source: '/:path*', headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }] }] : []),
    ...privateRoutePrefixes.map((prefix) => ({ source: prefix + '/:path*', headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow, nosnippet' }] })),
    ];
  }
};
export default config;
