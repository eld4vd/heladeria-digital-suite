'use client';

import Link from 'next/link';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { api, ApiError } from '@/lib/api';
import { useCart } from '@/lib/cart';
import { money } from '@/lib/format';
import type { Address, Order, ShopSettings, User } from '@/lib/types';
import { DemoPayment } from './DemoPayment';
import { Icon } from './Icon';
import styles from './Shop.module.css';

type Form = { customerName: string; email: string; phone: string; deliveryAddress: string; city: string; reference: string };

export function CheckoutView({ settings, customer, direct, existingOrderId }: { settings: ShopSettings; customer: User; direct: boolean; existingOrderId?: string }) {
  const router = useRouter();
  const cart = useCart();
  const items = direct ? cart.buyNowItem ? [cart.buyNowItem] : [] : cart.items;
  const [form, setForm] = useState<Form>({ customerName: customer.name, email: customer.email, phone: customer.phone || '', deliveryAddress: '', city: settings.city, reference: '' });
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState('');
  const [order, setOrder] = useState<Order | null>(null);
  const [loadingOrder, setLoadingOrder] = useState(!!existingOrderId);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [needsLogin, setNeedsLogin] = useState(false);
  const [uncertainCreation, setUncertainCreation] = useState(false);
  const key = useRef<string | null>(null);
  const request = useRef<Record<string, unknown> | null>(null);
  useEffect(() => {
    let active = true;
    void api<Address[]>('/account/addresses').then((saved) => { if (active) setAddresses(saved); }).catch(() => { /* Un fallo al cargar las direcciones guardadas no impide introducir manualmente la dirección de entrega. */ });
    return () => { active = false; };
  }, []);
  useEffect(() => {
    if (!existingOrderId) return;
    let active = true;
    void api<Order>(`/orders/${encodeURIComponent(existingOrderId)}`).then((pending) => {
      if (!active) return;
      if (pending.status !== 'PENDING_PAYMENT') router.replace(`/pedidos/${pending.id}`);
      else setOrder(pending);
    }).catch((cause: unknown) => {
      if (!active) return;
      setNeedsLogin(cause instanceof ApiError && (cause.status === 401 || cause.status === 403));
      setError(cause instanceof Error ? cause.message : 'No pudimos recuperar el pedido.');
    }).finally(() => { if (active) setLoadingOrder(false); });
    return () => { active = false; };
  }, [existingOrderId, router]);
  const subtotal = items.reduce((sum, item) => sum + item.unitPriceMinor * item.quantity, 0);
  function update(field: keyof Form, value: string) { setForm((current) => ({ ...current, [field]: value })); }
  function chooseAddress(id: string) {
    setSelectedAddress(id);
    const saved = addresses.find((address) => address.id === id);
    if (!saved) { setForm((current) => ({ ...current, deliveryAddress: '', city: settings.city, reference: '' })); return; }
    setForm((current) => ({ ...current, deliveryAddress: saved.address, city: saved.city, reference: saved.reference || '', customerName: saved.recipientName || current.customerName, phone: saved.phone || current.phone }));
  }
  async function createOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy || needsLogin || !items.length || !settings.deliveryEnabled) return;
    setBusy(true);
    setError('');
    key.current ||= crypto.randomUUID();
    request.current ||= { ...form, items: items.map((item) => ({ presentationId: item.presentationId, quantity: item.quantity, extraIds: item.extraIds })) };
    try {
      const created = await api<Order>('/orders', { method: 'POST', body: request.current, idempotencyKey: key.current });
      setOrder(created);
      setUncertainCreation(false);
      try { sessionStorage.setItem(`delicias-checkout:${created.id}`, JSON.stringify({ direct, items: items.map((item) => ({ key: item.key, quantity: item.quantity })) })); } catch { /* Las restricciones del almacenamiento no deben invalidar un pedido confirmado por el servidor. */ }
      const url = `/checkout?order=${encodeURIComponent(created.id)}${direct ? '&mode=direct' : ''}`;
      window.history.replaceState(window.history.state, '', url);
    } catch (cause) {
      const status = typeof cause === 'object' && cause !== null && 'status' in cause ? Number(cause.status) : 0;
      setNeedsLogin(status === 401 || status === 403);
      const isDefinitive = status >= 400 && status < 500;
      if (isDefinitive) { key.current = null; request.current = null; setUncertainCreation(false); }
      else setUncertainCreation(true);
      setError(`${cause instanceof Error ? cause.message : 'No pudimos crear tu pedido.'}${isDefinitive ? '' : ' Reintenta con los mismos datos; evitaremos duplicar tu pedido.'}`);
    } finally {
      setBusy(false);
    }
  }
  function paid(updated: Order) {
    setOrder(updated);
    if (updated.status === 'CONFIRMED' || updated.status === 'DISPATCHED') {
      let context: { direct: boolean; items: { key: string; quantity: number }[] } | null = null;
      try { context = JSON.parse(sessionStorage.getItem(`delicias-checkout:${updated.id}`) || 'null'); } catch { /* Un marcador local inválido nunca debe borrar otras selecciones. */ }
      if (context?.direct) {
        if (cart.buyNowItem?.key === context.items[0]?.key) cart.clearBuyNow();
      } else if (context) {
        for (const purchased of context.items) {
          const current = cart.items.find((item) => item.key === purchased.key);
          if (!current) continue;
          if (current.quantity <= purchased.quantity) cart.removeItem(current.key);
          else cart.updateQuantity(current.key, current.quantity - purchased.quantity);
        }
      } else if (!existingOrderId) {
        if (direct) cart.clearBuyNow();
        else cart.clearCart();
      }
      try { sessionStorage.removeItem(`delicias-checkout:${updated.id}`); } catch { /* El pago se completa aunque el almacenamiento del navegador no esté disponible. */ }
      router.push(`/pedidos/${updated.id}`);
    }
  }
  const resumeHref = `/checkout${existingOrderId ? `?order=${encodeURIComponent(existingOrderId)}${direct ? '&mode=direct' : ''}` : direct ? '?mode=direct' : ''}`;
  const loginHref = `/login?next=${encodeURIComponent(resumeHref)}`;
  if (!cart.hydrated || loadingOrder) return <div className={styles.skeleton} aria-label="Cargando tu pedido" />;
  if (existingOrderId && !order) return <div className={styles.empty}><h2>No pudimos abrir este pedido.</h2><p role="alert">{error || 'Usa la cuenta con la que realizaste la compra.'}</p><Link href={needsLogin ? loginHref : '/cuenta/pedidos'} className="button">{needsLogin ? 'Iniciar sesión y continuar' : 'Ver mis pedidos'}</Link></div>;
  if (!order && !items.length) return <div className={styles.empty}><span className={styles.emptyIcon}><Icon name="bag" size={30} /></span><h2>Primero, un buen antojo.</h2><p>Elige tu helado favorito antes de continuar.</p><Link href="/catalogo" className="button">Elegir mis helados <Icon name="arrow" size={18} /></Link></div>;
  return <>
    <nav className={styles.checkoutSteps} aria-label="Pasos de compra">
      <Link href="/carrito">01 · Carrito</Link><span aria-hidden="true">→</span>
      <span className={!order ? styles.current : undefined} aria-current={!order ? 'step' : undefined}>02 · Entrega</span><span aria-hidden="true">→</span>
      <span className={order ? styles.current : undefined} aria-current={order ? 'step' : undefined}>03 · Pago simulado</span>
    </nav>
    <header className={styles.pageIntro}>
      <h1>{order ? 'Confirma tu pedido.' : 'Ya falta muy poquito.'}</h1>
      <p>{order ? 'Revisa la entrega y el total antes de simular tu pago.' : 'Dinos dónde llevar tus helados.'}</p>
    </header>
    <div className={`${styles.twoColumns} ${styles.checkoutColumns}`}>
      <aside className={`${styles.summary} ${styles.checkoutSummary}`} aria-labelledby="checkout-summary-title">
        <div className={styles.checkoutSummaryHeading}>
          <h2 id="checkout-summary-title">{order ? 'Tu pedido' : 'Tu selección'}</h2>
          <div className={styles.summaryTotal}><span>{order ? 'Total confirmado' : 'Total estimado'}</span><span>{money(order?.totalMinor ?? subtotal + settings.deliveryFeeMinor, order?.currency || settings.currency, settings.locale)}</span></div>
        </div>
        <div className={styles.checkoutBreakdown}>
          <div className={styles.summaryLine}><span>Subtotal</span><span>{money(order?.subtotalMinor ?? subtotal, order?.currency || settings.currency, settings.locale)}</span></div>
          <div className={styles.summaryLine}><span>Delivery</span><span>{money(order?.deliveryFeeMinor ?? settings.deliveryFeeMinor, order?.currency || settings.currency, settings.locale)}</span></div>
        </div>
        <details className={styles.selectionDetails}>
          <summary>Ver helados del pedido ({order ? order.items.length : items.length})</summary>
          {order ? order.items.map((item) => <div className={styles.miniItem} key={item.id}>
            <div>{item.quantity} × {item.productName}<span>{item.presentationName}{item.flavors.length ? ` · ${item.flavors.join(', ')}` : ''}</span>{item.extras.length > 0 && <span>Extras: {item.extras.map((extra) => extra.name).join(', ')}</span>}</div>
            <strong>{money(item.totalMinor, order.currency, settings.locale)}</strong>
          </div>) : items.map((item) => <div className={styles.miniItem} key={item.key}>
            <div>{item.quantity} × {item.productName}<span>{item.presentationName}</span>{item.extras.length > 0 && <span>Extras: {item.extras.map((extra) => extra.name).join(', ')}</span>}</div>
            <strong>{money(item.unitPriceMinor * item.quantity, settings.currency, settings.locale)}</strong>
          </div>)}
        </details>
        <p className={styles.summaryNote}>{order ? 'Precio final validado por la heladería.' : 'Precio y disponibilidad se confirman antes de pagar.'}</p>
        {direct && <p className={styles.summaryNote}>Compra directa: tu carrito habitual se mantiene intacto.</p>}
      </aside>
      <div className={styles.checkoutBody}>{order ? <>
        <div className={styles.formCard}>
          <h2>Tu entrega</h2>
          <p className={styles.reviewAddress}><strong>{order.customerName}</strong><br />{order.deliveryAddress}, {order.city}<br />{order.reference && <>Referencia: {order.reference}<br /></>}{order.phone} · {order.email}</p>
          <p className={styles.leftNote}>Pedido {order.code} · La cobertura será revisada por nuestro equipo.</p>
        </div>
        <DemoPayment order={order} onUpdate={paid} currency={order.currency} locale={settings.locale} resumeHref={`/checkout?order=${encodeURIComponent(order.id)}${direct ? '&mode=direct' : ''}`} />
        <p className={styles.leftNote}>¿Quieres continuar después? <Link href={`/pedidos/${order.id}`} className={styles.textLink}>Ver mi pedido pendiente</Link></p>
      </> : <>
        <div className={styles.authNotice}>¡Hola, {customer.name}! Tu pedido se guardará en <Link href="/cuenta/pedidos">tu cuenta</Link>.</div>
        {addresses.length > 0 && <label className={`field ${styles.savedAddress}`}>Usar una dirección guardada<select className="input" value={selectedAddress} disabled={busy || uncertainCreation} onChange={(event) => chooseAddress(event.target.value)}><option value="">Escribir una dirección nueva</option>{addresses.map((address) => <option key={address.id} value={address.id}>{address.label} · {address.address}</option>)}</select></label>}
        <form onSubmit={(event) => void createOrder(event)}>
          <fieldset disabled={busy || uncertainCreation} className={styles.checkoutFields}>
            <div className={styles.formCard}>
              <section className={styles.formSection} aria-labelledby="checkout-contact-title">
                <h2 id="checkout-contact-title">Datos de contacto</h2>
                <div className={`${styles.formGrid} ${styles.contactGrid}`}>
                  <label className={`field ${styles.fullWidth}`}>Nombre completo<input className="input" name="customerName" value={form.customerName} onChange={(event) => update('customerName', event.target.value)} required minLength={2} maxLength={100} autoComplete="name" placeholder="Tu nombre completo" /></label>
                  <label className="field">Correo electrónico<input className="input" type="email" name="email" value={form.email} onChange={(event) => update('email', event.target.value)} required maxLength={160} autoComplete="email" placeholder="tu@correo.com" /></label>
                  <label className="field">Teléfono<input className="input" type="tel" name="phone" value={form.phone} onChange={(event) => update('phone', event.target.value)} required minLength={7} maxLength={30} autoComplete="tel" placeholder="Número de contacto" /></label>
                </div>
              </section>
              <section className={styles.formSection} aria-labelledby="checkout-delivery-title">
                <h2 id="checkout-delivery-title">Dirección de delivery</h2>
                <div className={styles.formGrid}>
                  <label className={`field ${styles.fullWidth}`}>Dirección completa<textarea className="input" name="deliveryAddress" value={form.deliveryAddress} onChange={(event) => update('deliveryAddress', event.target.value)} required minLength={5} maxLength={300} autoComplete="street-address" rows={2} placeholder="Calle, número, zona y departamento si corresponde" /></label>
                  <label className="field">Ciudad<input className="input" name="city" value={form.city} onChange={(event) => update('city', event.target.value)} required maxLength={100} autoComplete="address-level2" /></label>
                  <label className="field"><span>Referencia <span className="muted">(opcional)</span></span><input className="input" name="reference" value={form.reference} onChange={(event) => update('reference', event.target.value)} maxLength={300} placeholder="Ej. Puerta verde, junto a la plaza" /></label>
                </div>
                {settings.coverageText && <p className={styles.deliveryNote}><Icon name="truck" size={18} /><span>{settings.coverageText}</span></p>}
              </section>
            </div>
          </fieldset>
          {error && <p className="error" role="alert">{error}</p>}
          {needsLogin && <p className={styles.leftNote}>Tu sesión ya no permite continuar. <Link href={loginHref} className={styles.textLink}>Inicia sesión para retomar tu compra</Link>. Tu selección se conserva en este navegador.</p>}
          {!settings.deliveryEnabled && <p className="error">El delivery está pausado. No podemos recibir pedidos por ahora.</p>}
          <div className={styles.checkoutSubmit}>
            <div className={styles.actionTotal}><span>Total estimado</span><strong>{money(subtotal + settings.deliveryFeeMinor, settings.currency, settings.locale)}</strong></div>
            <button type="submit" className="button" disabled={busy || needsLogin || !settings.deliveryEnabled}>{busy ? 'Revisando tu pedido…' : uncertainCreation ? 'Reintentar con los mismos datos' : 'Revisar total y continuar'}<Icon name="arrow" size={18} /></button>
          </div>
          <p className={styles.leftNote}>Aún no se realiza ningún cobro. El siguiente paso es un pago simulado.</p>
        </form>
      </>}</div>
    </div>
  </>;
}
