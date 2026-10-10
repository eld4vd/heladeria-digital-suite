'use client';

import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { BrandLogo } from '@/components/brand/BrandLogo';
import { BRAND_NAME } from '@/lib/brand';
import { api } from '@/lib/api';
import type { SessionData } from '@/lib/types';
import { errorMessage } from '@/components/admin/shared';

const storeUrl = process.env.NEXT_PUBLIC_STORE_URL || 'http://localhost:3000';

export default function AuthForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function submit(event: FormEvent) {
    event.preventDefault(); setBusy(true); setError('');
    try {
      const session = await api<SessionData>('/auth/login', { method: 'POST', body: { email: email.trim().toLowerCase(), password, internal: true } });
      if (!session.user || !session.user.active || session.user.role !== 'ADMIN') throw new Error('Este acceso está reservado para administradores.');
      router.replace('/'); router.refresh();
    } catch (err) { setError(errorMessage(err)); setBusy(false); }
  }

  return <main id="contenido" className="account-auth account-auth-internal"><div className="account-auth-story"><a href={storeUrl} className="account-auth-brand" aria-label={BRAND_NAME + ', volver a la tienda'}><BrandLogo variant="full" alt="" className="account-auth-logo" sizes="(max-width: 700px) 128px, 168px" eager /></a><h1>Detrás de cada<br />buen antojo.</h1><p>Pedidos, catálogo y equipo. Una sola vista para cuidar cada detalle de tu heladería.</p><div className="account-auth-art" aria-hidden="true"><span /><span /><span /></div><small>Hecho para disfrutar, de principio a fin.</small></div><div className="account-auth-form-wrap"><div className="account-auth-form"><p className="account-eyebrow">Acceso del equipo</p><h2>Bienvenido al panel</h2><p>Ingresa tus datos para continuar.</p><form onSubmit={submit} aria-busy={busy}><label className="account-field"><span>Correo electrónico</span><input name="email" spellCheck={false} autoCapitalize="none" required type="email" autoComplete="email" maxLength={254} value={email} onChange={event => setEmail(event.target.value)} placeholder="nombre@correo.com…" /></label><div className="account-field"><label htmlFor="account-password">Contraseña</label><div className="account-password"><input id="account-password" name="password" aria-label="Contraseña" required type={showPassword ? 'text' : 'password'} autoComplete="current-password" minLength={10} maxLength={72} value={password} onChange={event => setPassword(event.target.value)} placeholder="Tu contraseña…" /><button type="button" aria-pressed={showPassword} aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'} onClick={() => setShowPassword(!showPassword)}>{showPassword ? 'Ocultar' : 'Ver'}</button></div></div>{error && <p className="account-error" role="alert">{error}</p>}<button type="submit" className="account-button" disabled={busy}>{busy && <span className="account-spinner" aria-hidden="true" />}{busy ? 'Un momento…' : 'Iniciar sesión'}</button></form><a className="account-back-store" href={storeUrl}>← Volver a la tienda</a><p className="account-auth-note">Acceso reservado para administradores.</p></div></div></main>;
}
