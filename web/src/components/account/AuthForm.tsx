'use client';
import Link from 'next/link';
import { BrandLogo } from '@/components/brand/BrandLogo';
import { BRAND_NAME } from '@/lib/brand';
import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { api } from '@/lib/api';
import { adminBaseUrl } from '@/lib/admin-url';
import type { SessionData } from '@/lib/types';
import { errorMessage } from './shared';
import './account.css';

export default function AuthForm({ register = false, next = '/cuenta' }: { register?: boolean; next?: string }) {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const safeNext = next.startsWith('/') && !next.startsWith('//') && !next.includes('\\') && !/^\/admin(?:[/?#]|$)/.test(next) && !Array.from(next).some(character => character.charCodeAt(0) < 32 || character.charCodeAt(0) === 127) ? next : '/cuenta';
  const checkout = /^\/checkout(?:[?#]|$)/.test(safeNext);
  const tracking = safeNext.startsWith('/pedidos/');
  const direct = checkout && new URLSearchParams(safeNext.split('?')[1]).get('mode') === 'direct';
  const backHref = checkout ? direct ? '/catalogo' : '/carrito' : '/';

  async function submit(event: FormEvent) {
    event.preventDefault(); setBusy(true); setError('');
    try {
      const session = await api<SessionData>(register ? '/auth/register' : '/auth/login', {
        method: 'POST', body: { email: email.trim().toLowerCase(), password, ...(register ? { name: name.trim() } : {}) },
      });
      if (!session.user) throw new Error('No se pudo iniciar la sesión.');
      if (session.user.role !== 'CUSTOMER') { window.location.assign(adminBaseUrl); return; }
      router.replace(safeNext); router.refresh();
    } catch (err) { setError(errorMessage(err)); setBusy(false); }
  }

  return <section className="account-auth">
    <div className="account-auth-story">
      <Link href="/" className="account-auth-brand" aria-label={BRAND_NAME + ', inicio'}><BrandLogo variant="full" alt="" className="account-auth-logo" sizes="(max-width: 700px) 128px, 168px" eager /></Link>
      
      <h1>{register ? <>Tu próximo<br />{' '}favorito te espera.</> : <>Volver sabe<br />{' '}todavía mejor.</>}</h1>
      <p>Guarda tus direcciones, encuentra tus pedidos y disfruta de una experiencia hecha a tu gusto.</p>
      <div className="account-auth-art" aria-hidden="true"><span /><span /><span /></div>
      <small>Hecho para disfrutar, de principio a fin.</small>
    </div>
    <div className="account-auth-form-wrap"><div className="account-auth-form">
      
      <h2>{checkout ? register ? 'Crea tu cuenta para pedir' : 'Inicia sesión para pedir' : register ? 'Crea tu cuenta' : 'Qué gusto verte'}</h2>
      <p>{checkout ? 'Tu selección sigue guardada en este navegador. Después continuarás con entrega y pago.' : tracking ? 'Entra con la cuenta que realizó la compra para consultar tu pedido.' : register ? 'Solo unos datos y estaremos listos.' : 'Ingresa tus datos para continuar.'}</p>
      <form onSubmit={submit} aria-busy={busy}>
        {register && <label className="account-field"><span>Tu nombre</span><input name="name" required autoComplete="name" minLength={2} maxLength={100} value={name} onChange={event => setName(event.target.value)} placeholder="Tu nombre completo…" /></label>}
        <label className="account-field"><span>Correo electrónico</span><input name="email" spellCheck={false} autoCapitalize="none" required type="email" autoComplete="email" maxLength={254} value={email} onChange={event => setEmail(event.target.value)} placeholder="nombre@correo.com…" /></label>
        <div className="account-field"><label htmlFor="account-password">Contraseña</label><div className="account-password"><input id="account-password" name="password" aria-label="Contraseña" required type={showPassword ? 'text' : 'password'} autoComplete={register ? 'new-password' : 'current-password'} minLength={10} maxLength={72} value={password} onChange={event => setPassword(event.target.value)} placeholder={register ? 'Al menos 10 caracteres…' : 'Tu contraseña…'} /><button type="button" aria-pressed={showPassword} aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'} onClick={() => setShowPassword(!showPassword)}>{showPassword ? 'Ocultar' : 'Ver'}</button></div>{register && <small>Usa al menos 10 caracteres y una contraseña exclusiva.</small>}</div>
        {error && <p className="account-error" role="alert">{error}</p>}
        <button type="submit" className="account-button" disabled={busy}>{busy && <span className="account-spinner" aria-hidden="true" />}{busy ? 'Un momento…' : checkout ? register ? 'Crear cuenta y continuar' : 'Entrar y continuar' : register ? 'Crear mi cuenta' : 'Iniciar sesión'}</button>
      </form>
      <p className="account-auth-switch">{register ? '¿Ya tienes cuenta?' : '¿Tu primera visita?'} <Link href={`${register ? '/login' : '/registro'}?next=${encodeURIComponent(safeNext)}`}>{register ? 'Inicia sesión' : 'Crea una cuenta'}</Link></p>
      <Link className="account-back-store" href={backHref}>← {checkout ? direct ? 'Volver al catálogo' : 'Volver al carrito' : 'Volver a la tienda'}</Link>
    </div></div>
  </section>;
}
