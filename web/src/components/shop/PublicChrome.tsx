'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Menu } from 'lucide-react';
import { useCart } from '@/lib/cart';
import { adminBaseUrl } from '@/lib/admin-url';
import type { ShopSettings } from '@/lib/types';
import { Icon } from './Icon';
import { BrandLogo } from '@/components/brand/BrandLogo';
import { BRAND_NAME } from '@/lib/brand';

export function PublicChrome({ children, settings }: { children: ReactNode; settings: ShopSettings | null }) {
  const path = usePathname();
  const cart = useCart();
  const toggle = useRef<HTMLButtonElement>(null);
  const header = useRef<HTMLElement>(null);
  const [menuPath, setMenuPath] = useState<string | null>(null);
  const menuOpen = menuPath === path;
  const closeMenu = () => setMenuPath(null);
  useEffect(() => {
    if (!menuOpen) return;
    const onEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { setMenuPath(null); toggle.current?.focus(); }
    };
    window.addEventListener('keydown', onEscape);
    // El punto de cambio coincide con lg de Tailwind; el menú también se cierra al salir del header.
    const desktop = window.matchMedia('(min-width: 1024px)');
    const onResize = () => { if (desktop.matches) setMenuPath(null); };
    const onPointerDown = (event: PointerEvent) => {
      if (event.target instanceof Node && !header.current?.contains(event.target)) setMenuPath(null);
    };
    desktop.addEventListener('change', onResize);
    document.addEventListener('pointerdown', onPointerDown);
    return () => {
      window.removeEventListener('keydown', onEscape);
      desktop.removeEventListener('change', onResize);
      document.removeEventListener('pointerdown', onPointerDown);
    };
  }, [menuOpen]);
  const count = cart.hydrated ? cart.items.reduce((total, item) => total + item.quantity, 0) : 0;
  const brand = settings?.name || BRAND_NAME;
  const inCatalog = path.startsWith('/catalogo') || path.startsWith('/producto');
  const inOrderFlow = path === '/carrito' || path === '/checkout' || path.startsWith('/pedidos/');
  const navigationLink = 'inline-flex min-h-11 items-center font-display text-[.8rem] font-normal leading-tight uppercase no-underline underline-offset-8 hover:underline aria-[current=page]:underline focus-visible:outline-brand-ink xl:text-[.95rem]';
  const iconLink = 'relative size-11 shrink-0 place-items-center rounded-full border border-brand-ink/20 no-underline transition-colors hover:bg-brand-blush focus-visible:outline-brand-ink';
  const mobileLink = 'flex min-h-14 items-center border-b border-brand-line py-3 font-display text-[clamp(1rem,4.8vw,1.5rem)] font-normal leading-snug uppercase no-underline hover:text-brand-berry aria-[current=page]:text-brand-berry aria-[current=page]:underline focus-visible:outline-brand-ink';
  return <>
    <header ref={header} className="sticky top-0 z-30 border-b border-brand-ink/10 bg-brand-strawberry text-brand-ink">
      <div className="mx-auto grid min-h-19 w-full max-w-[1440px] grid-cols-[minmax(0,1fr)_auto] items-center gap-3 pt-[max(.5rem,env(safe-area-inset-top))] pr-[max(1rem,env(safe-area-inset-right))] pb-2 pl-[max(1rem,env(safe-area-inset-left))] sm:gap-5 sm:px-6 lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] lg:px-8 xl:px-12">
        <nav className="hidden min-w-0 items-center gap-5 lg:order-1 lg:flex xl:gap-8" aria-label="Tienda">
          <Link className={navigationLink} aria-current={path === '/' ? 'page' : undefined} href="/">Inicio</Link>
          <Link className={navigationLink} aria-current={inCatalog ? 'page' : undefined} href="/catalogo">Nuestros helados</Link>
        </nav>
        <Link className="flex w-fit min-w-0 items-center gap-2 py-1 no-underline focus-visible:outline-brand-ink lg:order-2 lg:gap-3" href="/" aria-label={brand + ', inicio'} onClick={closeMenu}>
          <span className="grid size-11 shrink-0 place-items-center rounded-full bg-brand-white lg:size-13"><BrandLogo alt="" className="w-11 lg:w-13" sizes="(min-width: 1024px) 52px, 44px" eager /></span>
          <span className="max-w-[12ch] font-display text-[clamp(.95rem,4vw,1.1rem)] font-normal leading-[1.05] uppercase [overflow-wrap:anywhere] lg:text-[1.15rem]" translate="no">{brand}</span>
        </Link>
        <div className="flex items-center justify-end gap-2 lg:order-3 lg:gap-3">
          <nav className="hidden items-center gap-5 lg:flex xl:mr-2 xl:gap-8" aria-label="Conócenos"><Link className={navigationLink} aria-current={path === '/heladeria' ? 'page' : undefined} href="/heladeria">Heladería</Link><Link className={navigationLink} aria-current={path === '/contacto' ? 'page' : undefined} href="/contacto">Contacto</Link></nav>
          <Link className={`${iconLink} hidden sm:inline-grid`} href="/cuenta" aria-label="Mi cuenta" onClick={closeMenu}><Icon name="user" size={22} /></Link>
          <Link className={`${iconLink} inline-grid bg-brand-blush`} href="/carrito" aria-label={'Carrito' + (count ? ', ' + count + ' productos' : ', vacío')} onClick={closeMenu}>
            <Icon name="bag" size={23} />{count > 0 && <span className="absolute -top-1 -right-1 grid h-5 min-w-5 place-items-center rounded-full bg-brand-ink px-1 font-sans text-xs font-extrabold text-brand-white" aria-hidden="true">{count}</span>}
          </Link>
          <button ref={toggle} className={`${iconLink} inline-grid bg-transparent lg:hidden`} type="button" aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'} aria-expanded={menuOpen} aria-controls="mobile-menu" onClick={() => setMenuPath(menuOpen ? null : path)}>{menuOpen ? <Icon name="close" size={23} /> : <Menu size={23} strokeWidth={1.6} aria-hidden="true" focusable="false" />}</button>
        </div>
      </div>
      {menuOpen && <nav id="mobile-menu" data-lenis-prevent className="absolute inset-x-0 top-full max-h-[calc(100dvh-5rem-env(safe-area-inset-top))] overflow-y-auto overscroll-contain border-b border-brand-control bg-brand-white px-[max(1.5rem,env(safe-area-inset-left))] pt-3 pb-[max(1.5rem,env(safe-area-inset-bottom))] shadow-xl shadow-brand-ink/10 sm:px-6 lg:hidden" aria-label="Menú móvil">
        <Link className={mobileLink} href="/" aria-current={path === '/' ? 'page' : undefined} onClick={closeMenu}>Inicio</Link>
        <Link className={mobileLink} href="/catalogo" aria-current={inCatalog ? 'page' : undefined} onClick={closeMenu}>Nuestros helados</Link>
        <Link className={mobileLink} href="/heladeria" aria-current={path === '/heladeria' ? 'page' : undefined} onClick={closeMenu}>La heladería</Link>
        <Link className={mobileLink} href="/contacto" aria-current={path === '/contacto' ? 'page' : undefined} onClick={closeMenu}>Contacto y preguntas</Link>
        <Link className={`${mobileLink} border-b-0`} href="/cuenta" onClick={closeMenu}>Mi cuenta</Link>
      </nav>}
    </header>
    <main id="contenido">{children}</main>
    {inOrderFlow ? <footer className="border-t border-brand-line bg-brand-white text-brand-muted">
      <div className="container flex max-w-[1120px] flex-wrap items-center justify-between gap-x-5 gap-y-1 py-2 pb-[max(.5rem,env(safe-area-inset-bottom))] text-sm">
        <span className="min-w-0 [overflow-wrap:anywhere]">© {brand} · Sin cobros reales</span>
        <Link href="/contacto" className="inline-flex min-h-11 items-center font-bold text-brand-berry">¿Necesitas ayuda?</Link>
      </div>
    </footer> : <footer className="site-footer">
      <div className="container footer-grid">
        <div><Link className="brand footer-brand" href="/" aria-label={brand + ', inicio'}><BrandLogo variant="full" alt="" className="brand-full" sizes="180px" /></Link><p>Siempre hay un buen momento<br />para un helado.</p></div>
        <div><h2>Descubre</h2><Link href="/catalogo">Nuestros helados</Link><Link href="/heladeria">La heladería</Link><Link href="/contacto">Contacto</Link><Link href="/contacto#preguntas-frecuentes">Preguntas frecuentes</Link></div>
        <div><h2>Tu pedido</h2><Link href="/carrito">Mi carrito</Link><Link href="/cuenta/pedidos">Mis pedidos</Link><Link href="/cuenta">Mi cuenta</Link><a href={adminBaseUrl + '/login'}>Acceso del equipo</a></div>
        <div><h2>Nos vemos aquí</h2>{settings && (settings.address || settings.hours || settings.phone) ? <>
          {settings.address && <p>{settings.address}<br />{settings.city}</p>}
          {settings.hours && <p>{settings.hours}</p>}
          {settings.phone && <a href={'tel:' + settings.phone.replace(/[^\d+]/g, '')}>{settings.phone}</a>}
        </> : <p>Pronto compartiremos la dirección y los horarios del local. <Link href="/contacto">Consulta la información de contacto.</Link></p>}</div>
      </div>
      <div className="container footer-bottom"><span>© {brand}. Hecho para disfrutar.</span><span>Proyecto de demostración. Sin cobros reales.</span></div>
    </footer>}
  </>;
}
