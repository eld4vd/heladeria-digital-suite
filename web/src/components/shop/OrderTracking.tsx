'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { api, ApiError } from '@/lib/api';
import { money, statusLabels } from '@/lib/format';
import type { Order, ShopSettings } from '@/lib/types';
import { Icon } from './Icon';
import styles from './Shop.module.css';

const steps: Order['status'][] = ['PENDING_PAYMENT', 'CONFIRMED', 'DISPATCHED'];

export function OrderTracking({ id, settings }: { id: string; settings: ShopSettings }) {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [needsLogin, setNeedsLogin] = useState(false);
  const [refresh, setRefresh] = useState(0);
  const [direct, setDirect] = useState(false);
  useEffect(() => {
    let active = true;
    let inFlight = false;
    let terminal = false;
    let interval: number | undefined;
    const controller = new AbortController();
    async function load(initial = false) {
      if (inFlight || terminal || (!initial && document.visibilityState !== 'visible')) return;
      inFlight = true;
      try {
        const updated = await api<Order>(`/orders/${encodeURIComponent(id)}`, { signal: controller.signal });
        terminal = updated.status === 'DISPATCHED' || updated.status === 'CANCELED';
        if (terminal) window.clearInterval(interval);
        if (active) {
          setOrder(updated); setError(''); setNeedsLogin(false);
          try { setDirect(!!JSON.parse(sessionStorage.getItem(`delicias-checkout:${id}`) || 'null')?.direct); } catch { /* El marcador no contiene datos del pedido y puede ignorarse sin riesgo. */ }
        }
      } catch (cause) {
        if (active) {
          const status = cause instanceof ApiError ? cause.status : 0;
          if (status === 401 || status === 403 || status === 404) {
            terminal = true;
            window.clearInterval(interval);
            setOrder(null);
          }
          setNeedsLogin(status === 401 || status === 403);
          setError(cause instanceof Error ? cause.message : 'No pudimos consultar tu pedido.');
        }
      } finally {
        if (active) setLoading(false);
        inFlight = false;
      }
    }
    void load(true);
    interval = window.setInterval(() => { void load(); }, 10_000);
    document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') void load(); }, { signal: controller.signal });
    return () => { active = false; window.clearInterval(interval); controller.abort(); };
  }, [id, refresh]);
  if (loading) return <div className="section"><div className={styles.skeleton} aria-label="Consultando tu pedido" /></div>;
  if (!order) return <div className="section"><div className={styles.empty}><span className={styles.emptyIcon}><Icon name="bag" size={30} /></span><h2>No podemos abrir este pedido.</h2><p>{needsLogin ? 'Inicia sesión con la cuenta que realizó la compra. Tu pedido no se pierde al cerrar el navegador.' : 'Sólo puedes consultar los pedidos de tu cuenta. Busca esta compra en tu historial.'}</p>{error && <p role="alert">{error}</p>}<div className={styles.actions} style={{ justifyContent: 'center' }}><button type="button" className="button button-secondary" onClick={() => { setLoading(true); setRefresh((value) => value + 1); }}>Volver a intentar</button><Link href={needsLogin ? `/login?next=${encodeURIComponent(`/pedidos/${encodeURIComponent(id)}`)}` : '/cuenta/pedidos'} className="button">{needsLogin ? 'Iniciar sesión' : 'Ver mis pedidos'}</Link></div></div></div>;
  const currentStep = steps.indexOf(order.status);
  const canceled = order.status === 'CANCELED';
  const pending = order.status === 'PENDING_PAYMENT';
  const date = (value: string) => new Date(value).toLocaleString(settings.locale, { dateStyle: 'medium', timeStyle: 'short' });
  const dispatched = order.status === 'DISPATCHED';
  const titles: Record<Order['status'], string> = { PENDING_PAYMENT: 'Tu antojo te está esperando.', CONFIRMED: '¡Recibimos tu pedido!', DISPATCHED: '¡Tu pedido ya salió!', CANCELED: 'Tu pedido fue cancelado.' };
  return <><header className={styles.trackingHero} aria-live="polite" aria-atomic="true"><span className={styles.emptyIcon}><Icon name={pending ? 'card' : canceled ? 'bag' : dispatched ? 'truck' : 'check'} size={30} /></span><h1>{titles[order.status]}</h1><span className={styles.orderCode}>Pedido {order.code}</span><p>{pending ? 'Completa el pago de demostración para confirmar tu pedido.' : canceled ? 'Puedes revisar el historial y crear un nuevo pedido cuando quieras.' : dispatched ? 'Tu pedido salió del local para delivery. Ten a mano tu teléfono para coordinar la entrega; no necesitas mantener esta página abierta.' : 'Pago confirmado. Puedes cerrar esta página: tu pedido queda guardado en tu cuenta y puedes consultarlo cuando quieras.'}<br /><small>{dispatched && order.dispatchedAt ? `Despachado el ${date(order.dispatchedAt)}` : `Creado el ${date(order.createdAt)}`}</small></p></header>
    {error && <output className="error" aria-live="polite">No pudimos actualizar el seguimiento: {error} La información mostrada es la última disponible.</output>}
    {!canceled && <ol className={styles.timeline} aria-label="Estado de tu pedido" style={{ listStyle: 'none', paddingLeft: 0 }}>{steps.map((step, index) => <li key={step} className={styles.timelineStep} data-complete={index <= currentStep} data-current={index === currentStep} aria-current={index === currentStep ? 'step' : undefined}><span className={styles.timelineDot}>{index < currentStep ? <Icon name="check" size={15} /> : index + 1}</span>{statusLabels[step]}</li>)}</ol>}
    {pending && <div className={styles.trackingActions}><Link href={`/checkout?order=${encodeURIComponent(order.id)}${direct ? '&mode=direct' : ''}`} className="button">Continuar al pago simulado <Icon name="arrow" size={17} /></Link></div>}
    <div className={styles.twoColumns}><div><div className={styles.formCard}><h2>Lo que elegiste</h2>{order.items.map((item) => <div className={styles.miniItem} key={item.id}><div><strong>{item.quantity} × {item.productName}</strong><span>{item.presentationName}{item.flavors.length > 0 && ` · ${item.flavors.join(', ')}`}</span>{item.extras.length > 0 && <span>Extras: {item.extras.map((extra) => extra.name).join(', ')}</span>}</div><strong>{money(item.totalMinor, order.currency, settings.locale)}</strong></div>)}</div><div className={styles.orderDetails}><div className={styles.formCard}><h2>Tu entrega</h2><p className={styles.reviewAddress}><strong>{order.customerName}</strong><br />{order.deliveryAddress}<br />{order.city}<br />{order.reference && <>Referencia: {order.reference}<br /></>}{order.phone}<br />{order.email}</p></div><div className={styles.formCard}><h2>Historial del pedido</h2><ul className={styles.historyList}>{order.history.map((event) => <li key={event.id}><span className={styles.historyDot} /><div>{statusLabels[event.toStatus]}<p>{date(event.createdAt)}{event.note && <><br />{event.note}</>}</p></div></li>)}</ul></div></div></div><aside className={styles.summary}><h2>Resumen del pedido</h2><div className={styles.summaryLine}><span>Helados y extras</span><span>{money(order.subtotalMinor, order.currency, settings.locale)}</span></div><div className={styles.summaryLine}><span>Delivery</span><span>{money(order.deliveryFeeMinor, order.currency, settings.locale)}</span></div><div className={styles.summaryTotal}><span>Total</span><span>{money(order.totalMinor, order.currency, settings.locale)}</span></div><p className={styles.summaryNote}>Todos los pagos y reversos son de demostración. No se ha realizado ningún cobro real.</p>{order.payments.length > 0 && <><h3 style={{ fontSize: '.9rem', marginTop: '1.5rem' }}>Intentos de pago</h3>{order.payments.map((payment) => <div className={styles.miniItem} key={payment.id}><div>{payment.method === 'DEMO_CARD' ? 'Tarjeta ficticia' : 'QR de demostración'}<span>{date(payment.createdAt)}</span></div><span>{payment.status === 'APPROVED' ? 'Aprobado' : payment.status === 'REFUNDED' ? 'Reversado' : 'Rechazado'}</span></div>)}</>}</aside></div><div className={styles.trackingActions}><Link href="/catalogo" className="button button-secondary">Volver a las delicias <Icon name="arrow" size={17} /></Link><Link href="/cuenta/pedidos" className={styles.textLink}>Historial de mi cuenta</Link></div>
  </>;
}
