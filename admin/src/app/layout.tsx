import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { BRAND_NAME } from '@/lib/brand';
import { AutoHideScrollbars } from '@/components/admin/AutoHideScrollbars';
import './globals.css';

export const metadata: Metadata = {
  title: { default: 'Administración | ' + BRAND_NAME, template: '%s | Administración ' + BRAND_NAME },
  description: 'Panel interno para gestionar la heladería.',
  robots: { index: false, follow: false },
};
export const viewport: Viewport = { width: 'device-width', initialScale: 1, themeColor: '#f7f8fa' };
export const dynamic = 'force-dynamic';

export default function RootLayout({ children }: { children: ReactNode }) {
  return <html lang="es"><body><AutoHideScrollbars /><a className="skip-link" href="#contenido">Saltar al contenido</a>{children}</body></html>;
}
