import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import localFont from 'next/font/local';
import { CartProvider } from '@/lib/cart';
import { publicApi } from '@/lib/server-api';
import { pageMetadata } from '@/lib/seo';
import { absoluteUrl } from '@/lib/site-config';
import type { ShopSettings } from '@/lib/types';
import { BRAND_NAME } from '@/lib/brand';
import { PublicChrome } from '@/components/shop/PublicChrome';
import './globals.css';

const nunito = localFont({ src: './fonts/nunito-latin-variable.woff2', variable: '--font-nunito', weight: '400 800', display: 'swap', fallback: ['Segoe UI', 'Arial'] });
// La fuente de cartel se comparte en toda la tienda; Nunito conserva la legibilidad de textos y controles.
const displayFont = localFont({ src: './fonts/home-bowlby-one-sc.ttf', variable: '--font-bowlby', weight: '400', display: 'swap', fallback: ['Arial Black', 'Arial', 'sans-serif'] });

export async function generateMetadata(): Promise<Metadata> {
  let settings: ShopSettings | null = null;
  try { settings = await publicApi<ShopSettings>('/settings'); } catch { /* No se muestran datos del local sin verificar. */ }
  if (!settings?.name.trim()) settings = null;
  const brand = settings?.name || BRAND_NAME;
  const title = settings ? brand + ' · Helados en ' + settings.city : brand;
  const description = settings ? settings.description + ' Encuentra tu helado favorito y añade extras en ' + settings.city + '. Pagos simulados.' : 'Elige tus helados favoritos. Tienda de demostración con pagos simulados.';
  return {
    ...pageMetadata({ title, description, path: '/', settings, absoluteTitle: true, indexable: Boolean(settings) }),
    metadataBase: new URL(absoluteUrl('/')),
    // Cada página pública define su URL canónica; las páginas privadas no la heredan del layout.
    alternates: undefined,
    title: { default: title, template: '%s | ' + brand },
    applicationName: brand,
    verification: process.env.GOOGLE_SITE_VERIFICATION ? { google: process.env.GOOGLE_SITE_VERIFICATION } : undefined,
  };
}
export const viewport: Viewport = { width: 'device-width', initialScale: 1, themeColor: '#fffdfb' };

export default async function RootLayout({ children }: { children: ReactNode }) {
  let settings: ShopSettings | null = null;
  try { settings = await publicApi<ShopSettings>('/settings'); } catch { /* No se inventa un catálogo cuando la API no está disponible. */ }
  return <html lang={settings?.locale || 'es'} className={`${nunito.variable} ${displayFont.variable}`} data-scroll-behavior="smooth"><body className="bg-brand-white text-brand-ink"><a className="skip-link" href="#contenido">Saltar al contenido</a><CartProvider><PublicChrome settings={settings}>{children}</PublicChrome></CartProvider></body></html>;
}
