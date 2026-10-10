'use client';

import { useRef, useState, type FormEvent } from 'react';
import { api } from '@/lib/api';
import type { Order } from '@/lib/types';
import { Feedback, Field, Modal, Money, errorMessage, useAdminUser } from './shared';

type Action = 'DISPATCHED' | 'CANCELED';

export function OrderActions({ order, onUpdated }: { order: Order; onUpdated: (message: string) => void | Promise<void> }) {
  const editable = useAdminUser()?.role === 'ADMIN';
  const [action, setAction] = useState<Action | null>(null);
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const sending = useRef(false);
  const canDispatch = order.status === 'CONFIRMED';
  const canCancel = order.status === 'PENDING_PAYMENT' || canDispatch;
  const available = action === 'DISPATCHED' ? canDispatch : canCancel;

  function open(next: Action) { setAction(next); setNote(''); setError(''); }
  async function confirm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!action || !available || sending.current) return;
    if (action === 'CANCELED' && note.trim().length < 3) { setError('Escribe un motivo de al menos 3 caracteres.'); return; }
    sending.current = true;
    setBusy(true);
    setError('');
    try {
      await api<Order>(`/admin/orders/${encodeURIComponent(order.id)}/status`, {
        method: 'PATCH', body: { status: action, note: note.trim() || undefined },
      });
      setAction(null);
      await onUpdated(action === 'DISPATCHED' ? `Pedido ${order.code} despachado. Venta simulada registrada.` : `Pedido ${order.code} cancelado.`);
    } catch (cause) {
      setError(errorMessage(cause));
    } finally {
      sending.current = false;
      setBusy(false);
    }
  }

  if (!editable) return null;
  return <>
    <div className="admin-row-actions admin-order-actions">
      {canDispatch && <button type="button" disabled={busy} className="admin-button admin-button-compact" aria-label={`Despachar pedido ${order.code}`} onClick={() => open('DISPATCHED')}>Despachar</button>}
      {canCancel && <button type="button" disabled={busy} className="admin-text-button admin-danger" aria-label={`Cancelar pedido ${order.code}`} onClick={() => open('CANCELED')}>Cancelar</button>}
    </div>
    {action && <Modal title={`${action === 'DISPATCHED' ? 'Despachar' : 'Cancelar'} ${order.code}`} onClose={() => { if (!sending.current) setAction(null); }}>
      <p>{action === 'DISPATCHED' ? 'Confirma sólo cuando el pedido salga del local con el repartidor. Se registrará la venta, no una entrega al cliente.' : canDispatch ? 'Se liberará el stock reservado y se registrará un reverso del pago simulado.' : 'El pedido pendiente se cancelará. No tiene stock reservado ni pago aprobado.'}</p>
      <div className="admin-order-confirmation">
        <strong>{order.customerName}</strong>
        <p>{order.deliveryAddress}, {order.city}{order.reference && <><br />Referencia: {order.reference}</>}<br />{order.phone}</p>
        <ul>{order.items.map(item => <li key={item.id}><strong>{item.quantity} × {item.productName}</strong><span>{item.presentationName}{item.extras.length > 0 && ` · Extras: ${item.extras.map(extra => extra.name).join(', ')}`}</span></li>)}</ul>
        <div className="admin-summary-row"><span>Total</span><strong><Money value={order.totalMinor} currency={order.currency} /></strong></div>
      </div>
      <form className="admin-form" onSubmit={event => void confirm(event)} aria-busy={busy}>
        {action === 'CANCELED' && <Field label="Motivo de cancelación"><textarea name="cancellationReason" required minLength={3} maxLength={500} rows={2} className="admin-input" value={note} disabled={busy} onChange={event => setNote(event.target.value)} placeholder="Ej. Cancelación solicitada por el cliente…" /></Field>}
        {!available && <p className="admin-alert admin-alert-error" role="alert">El estado cambió mientras revisabas el pedido. Cierra esta ventana y comprueba la fila actualizada.</p>}
        <Feedback error={error} />
        <div className="admin-form-actions">
          <button type="button" disabled={busy} className="admin-button admin-button-secondary" onClick={() => setAction(null)}>Volver</button>
          <button type="submit" disabled={busy || !available} className={`admin-button${action === 'CANCELED' ? ' admin-button-danger' : ''}`}>{busy ? 'Guardando…' : action === 'DISPATCHED' ? 'Confirmar despacho' : 'Cancelar pedido'}</button>
        </div>
      </form>
    </Modal>}
  </>;
}
