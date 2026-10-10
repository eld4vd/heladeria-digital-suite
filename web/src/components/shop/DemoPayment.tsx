'use client';

import Link from 'next/link';
import { useRef, useState } from 'react';
import type { Order } from '@/lib/types';
import { api, ApiError } from '@/lib/api';
import { money } from '@/lib/format';
import { Icon } from './Icon';
import styles from './Shop.module.css';

export function DemoPayment({ order, onUpdate, currency = 'BOB', locale = 'es-BO', resumeHref }: { order: Order; onUpdate: (order: Order) => void; currency?: string; locale?: string; resumeHref?: string }) {
  const [method, setMethod] = useState<'DEMO_CARD' | 'DEMO_QR'>('DEMO_CARD');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [needsLogin, setNeedsLogin] = useState(false);
  const keys = useRef<Record<string, string>>({});
  const latest = order.payments[order.payments.length - 1];
  async function pay(scenario: 'APPROVED' | 'REJECTED') {
    if (busy || needsLogin) return;
    setBusy(true);
    setError('');
    const operation = `${method}:${scenario}`;
    keys.current[operation] ||= crypto.randomUUID();
    try {
      const updated = await api<Order>(`/orders/${order.id}/payments`, { method: 'POST', body: { method, scenario }, idempotencyKey: keys.current[operation] });
      delete keys.current[operation];
      onUpdate(updated);
    } catch (cause) {
      setNeedsLogin(cause instanceof ApiError && (cause.status === 401 || cause.status === 403));
      setError(cause instanceof Error ? cause.message : 'No pudimos confirmar el pago. Intenta nuevamente.');
    } finally {
      setBusy(false);
    }
  }
  const loginHref = `/login?next=${encodeURIComponent(resumeHref || `/checkout?order=${encodeURIComponent(order.id)}`)}`;
  return <div className={styles.formCard}>
    <h2>Confirma tu pago de demostración</h2>
    <div className={styles.demoWarning}><strong>Prototipo · No se realizará ningún cobro.</strong><br />No ingreses números de tarjeta, CVV ni información bancaria. Estos botones simulan el resultado de un pago.</div>
    <div className={styles.paymentMethods} aria-label="Método de pago simulado">
      <button type="button" className={styles.paymentMethod} disabled={busy || needsLogin} aria-pressed={method === 'DEMO_CARD'} onClick={() => setMethod('DEMO_CARD')}><Icon name="card" size={24} /><span>Tarjeta ficticia<br /><small>Sin datos bancarios</small></span></button>
      <button type="button" className={styles.paymentMethod} disabled={busy || needsLogin} aria-pressed={method === 'DEMO_QR'} onClick={() => setMethod('DEMO_QR')}><Icon name="qr" size={24} /><span>QR de demostración<br /><small>Sin transferencia real</small></span></button>
    </div>
    {method === 'DEMO_QR' && <><div className={styles.qrDemo} role="img" aria-label="Patrón decorativo de QR, no válido para pagos"><span>DEMO</span></div><p className={styles.summaryNote}>Este patrón es ilustrativo. No debes escanearlo ni transferir dinero.</p></>}
    {latest?.status === 'REJECTED' && <p className="error" role="status">Pago rechazado de demostración. Tu pedido sigue pendiente y no se descontó stock. Puedes volver a intentarlo.</p>}
    {error && <p className="error" role="alert">{error}</p>}
    {needsLogin && <p className={styles.leftNote}>Tu pedido sigue guardado. <Link href={loginHref} className={styles.textLink}>Inicia sesión con la misma cuenta para continuar</Link>.</p>}
    <div className={styles.paymentActions}>
      <button type="button" className="button" disabled={busy || needsLogin || order.status !== 'PENDING_PAYMENT'} onClick={() => void pay('APPROVED')}>{busy ? 'Procesando…' : `Simular pago aprobado · ${money(order.totalMinor, currency, locale)}`}<Icon name="check" size={18} /></button>
      <button type="button" className="button button-secondary" disabled={busy || needsLogin || order.status !== 'PENDING_PAYMENT'} onClick={() => void pay('REJECTED')}>Simular rechazo</button>
    </div>
  </div>;
}
