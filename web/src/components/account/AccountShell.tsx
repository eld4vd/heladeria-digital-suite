'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, type ReactNode } from 'react';
import { api } from '@/lib/api';
import type { User } from '@/lib/types';
import { FormattingProvider, errorMessage, type ShopFormatting } from './shared';
export default function AccountShell({ user, children, initialSettings }: { user: User; children: ReactNode; initialSettings?: ShopFormatting }) {
  const pathname = usePathname(); const router = useRouter(); const [busy, setBusy] = useState(false); const [error, setError] = useState('');
  async function logout() { setBusy(true); try { await api('/auth/logout', { method: 'POST' }); router.replace('/login'); router.refresh(); } catch (err) { setError(errorMessage(err)); setBusy(false); } }
  return <FormattingProvider initial={initialSettings}><section className="account-page"><div className="account-welcome"><p className="account-eyebrow">TU RINCÓN DELICIAS</p><h1>Hola, {user.name.split(' ')[0]}.</h1><p>Tu información y tus pedidos, a mano para la próxima vez.</p></div><div className="account-layout"><aside className="account-sidebar"><div className="account-person"><span>{user.name.slice(0, 1).toUpperCase()}</span><strong>{user.name}</strong><small>{user.email}</small></div><nav aria-label="Mi cuenta">{[{ href: '/cuenta', label: 'Mi perfil', icon: '◎' }, { href: '/cuenta/direcciones', label: 'Mis direcciones', icon: '⌖' }, { href: '/cuenta/pedidos', label: 'Mis pedidos', icon: '▤' }].map(item => <Link key={item.href} href={item.href} className={pathname === item.href || item.href !== '/cuenta' && pathname.startsWith(item.href + '/') ? 'is-active' : ''}><span aria-hidden="true">{item.icon}</span>{item.label}</Link>)}</nav><button className="account-logout" disabled={busy} onClick={logout}>{busy ? 'Cerrando sesión…' : 'Cerrar sesión ↗'}</button>{error && <p role="alert" className="account-error">{error}</p>}</aside><div className="account-content">{children}</div></div></section></FormattingProvider>;
}
