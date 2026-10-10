import type { NextConfig } from 'next';
import { fileURLToPath } from 'node:url';
const apiOrigin = process.env.API_INTERNAL_URL ?? 'http://127.0.0.1:4000';
const config: NextConfig = {
  output: 'standalone', poweredByHeader: false,
  outputFileTracingRoot: fileURLToPath(new URL('../', import.meta.url)),
  async rewrites() { return [{ source: '/api/v1/:path*', destination: `${apiOrigin}/api/v1/:path*` }]; },
  async headers() {
    return [{ source: '/:path*', headers: [
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      { key: 'X-Frame-Options', value: 'DENY' },
      { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
      { key: 'X-Robots-Tag', value: 'noindex, nofollow' },
      { key: 'Cache-Control', value: 'private, no-store' }
    ] }];
  }
};
export default config;
