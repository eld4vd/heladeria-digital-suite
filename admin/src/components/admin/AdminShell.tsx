'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { api } from '@/lib/api';
import type { User } from '@/lib/types';
import { BrandLogo } from '@/components/brand/BrandLogo';
import { BRAND_NAME } from '@/lib/brand';
import { AdminUserContext, FormattingProvider, errorMessage, type ShopFormatting } from './shared';

const navigation = [
  { href: '/', label: 'Resumen', icon: 'M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z' },
  { href: '/pedidos', label: 'Pedidos', icon: 'M8 3h8v4H8zM8 5H5v16h14V5h-3M8 12h8M8 16h5' },
  { href: '/catalogo', label: 'Catálogo', icon: 'M8 12h8l-4 10-4-10ZM6 9a3 3 0 0 1 2-5 4 4 0 0 1 8 0 3 3 0 0 1 2 5v3H6V9Z' },
  { href: '/inventario', label: 'Inventario', icon: 'm3 7 9-4 9 4v10l-9 4-9-4V7Zm0 0 9 4 9-4M12 11v10M7.5 5l9 4' },
  { href: '/clientes', label: 'Clientes', icon: 'M20 21v-2a6 6 0 0 0-6-6h-4a6 6 0 0 0-6 6v2M12 9a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z' },
  { href: '/pagos', label: 'Pagos', icon: 'M3 5h18v14H3V5Zm0 5h18M7 15h3' },
  { href: '/reportes', label: 'Reportes', icon: 'M4 3v18h17M8 16v-4M13 16V8M18 16V5' },
  { href: '/equipo', label: 'Equipo', icon: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM17 3a4 4 0 0 1 0 8M22 21v-2a4 4 0 0 0-3-3.9' },
  { href: '/configuracion', label: 'Configuración', icon: 'M4 7h16M4 17h16M9 4v6M15 14v6' },
];
const storeUrl = process.env.NEXT_PUBLIC_STORE_URL || 'http://localhost:3000';

function NavIcon({ path }: { path: string }) {
  return <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={path} /></svg>;
}

export default function AdminShell({ user, children, initialSettings }: { user: User; children: ReactNode; initialSettings?: ShopFormatting }) {
  const pathname = usePathname(); const router = useRouter();
  const [openPath, setOpenPath] = useState<string | null>(null);
  const [busy, setBusy] = useState(false); const [error, setError] = useState('');
  const sidebar = useRef<HTMLElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const open = openPath === pathname;
  useEffect(() => {
    if (!open) return;
    const mobile = window.matchMedia('(max-width: 950px)');
    if (!mobile.matches) return;
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const main = content.current;
    const originalOverflow = document.body.style.overflow;
    const previousInert = main?.inert ?? false;
    if (main) main.inert = true;
    document.body.style.overflow = 'hidden';
    sidebar.current?.querySelector<HTMLButtonElement>('.admin-sidebar-close')?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { event.preventDefault(); setOpenPath(null); }
      if (event.key !== 'Tab') return;
      const nodes = sidebar.current?.querySelectorAll<HTMLElement>('a[href], button:not(:disabled)');
      if (!nodes?.length) return;
      const first = nodes[0]; const last = nodes[nodes.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    const onResize = () => { if (!mobile.matches) setOpenPath(null); };
    document.addEventListener('keydown', onKey);
    mobile.addEventListener('change', onResize);
    return () => {
      if (main) main.inert = previousInert;
      document.body.style.overflow = originalOverflow;
      document.removeEventListener('keydown', onKey);
      mobile.removeEventListener('change', onResize);
      if (mobile.matches && previous?.isConnected) previous.focus();
    };
  }, [open]);

  async function logout() {
    setBusy(true);
    try { await api('/auth/logout', { method: 'POST' }); router.replace('/login'); router.refresh(); }
    catch (err) { setError(errorMessage(err)); setBusy(false); }
  }

  return <AdminUserContext.Provider value={user}><FormattingProvider initial={initialSettings}><div className="admin-app">
    {open && <button className="admin-mobile-scrim" type="button" tabIndex={-1} aria-label="Cerrar navegación" onClick={() => setOpenPath(null)} />}
    <aside ref={sidebar} id="admin-navigation" className={'admin-sidebar' + (open ? ' is-open' : '')} aria-label="Navegación administrativa">
      <div className="admin-sidebar-heading">
        <Link className="admin-brand" href="/" aria-label={BRAND_NAME + ', resumen'} onClick={() => setOpenPath(null)}><span className="admin-brand-mark"><BrandLogo alt="" className="admin-brand-image" sizes="(max-width: 950px) 40px, 48px" eager /></span><span translate="no">{BRAND_NAME}<small>Gestión del negocio</small></span></Link>
        <button className="admin-sidebar-close admin-icon-button" type="button" aria-label="Cerrar navegación" onClick={() => setOpenPath(null)}>×</button>
      </div>
      <nav aria-label="Administración">{navigation.map(item => {
        const active = pathname === item.href || item.href !== '/' && pathname.startsWith(item.href + '/');
        return <Link key={item.href} href={item.href} className={active ? 'is-active' : ''} aria-current={active ? 'page' : undefined} onClick={() => setOpenPath(null)}><NavIcon path={item.icon} />{item.label}</Link>;
      })}</nav>
      <div className="admin-sidebar-bottom">
        <a href={storeUrl} className="admin-shop-link">Ver tienda <NavIcon path="M14 3h7v7M21 3l-9 9M10 3H3v18h18v-7" /></a>
        <div className="admin-user"><span className="admin-avatar" aria-hidden="true">{user.name.slice(0, 1).toUpperCase()}</span><div><strong>{user.name}</strong><small>Administrador</small></div></div>
        <button type="button" onClick={logout} disabled={busy} className="admin-logout">{busy ? 'Cerrando sesión…' : 'Cerrar sesión'}</button>
        {error && <p role="alert" className="admin-sidebar-error">{error}</p>}
      </div>
    </aside>
    <div ref={content} className="admin-main">
      <header className="admin-topbar">
        <button className="admin-menu-button admin-icon-button" type="button" aria-expanded={open} aria-controls="admin-navigation" aria-label={open ? 'Cerrar navegación' : 'Abrir navegación'} onClick={() => setOpenPath(open ? null : pathname)}><NavIcon path="M4 6h16M4 12h16M4 18h16" /></button>
        <span>Panel de gestión</span>
        <div><span className="admin-demo-label">Pagos simulados</span><span className="admin-topbar-avatar" aria-label={'Sesión de ' + user.name}>{user.name.slice(0, 1).toUpperCase()}</span></div>
      </header>
      <main id="contenido" className="admin-content">{children}</main>
      <footer className="admin-footer">{BRAND_NAME} · Operación y pedidos <span>Los pagos de esta versión son simulados.</span></footer>
    </div>
  </div></FormattingProvider></AdminUserContext.Provider>;
}
