'use client';

import Link from 'next/link';
import type { Order } from '@/lib/types';
import { Money, PageHeading, ResourceState, StatusBadge, useDateLabel, methodLabels, statusLabels, useResource } from './shared';

const isFinished = (order: Order) => order.status === 'DISPATCHED' || order.status === 'CANCELED';

// El detalle del cliente es independiente de los controles administrativos del pedido de forma intencionada.
export function OrderDetailScreen({ id }: { id: string }) {
  const dateLabel = useDateLabel();
  const resource = useResource<Order>(`/orders/${encodeURIComponent(id)}`, 10000, isFinished);
  const order = resource.data;
  return <>
    <Link className="admin-back-link" href="/cuenta/pedidos">← Volver a pedidos</Link>
    <PageHeading title={order ? `Pedido ${order.code}` : 'Detalle de pedido'} description={order ? `Recibido el ${dateLabel(order.createdAt)}` : 'Todos los detalles, en un solo lugar.'} actions={order && <StatusBadge status={order.status} />} />
    {order?.status === 'CONFIRMED' && <p className="admin-note">Pago confirmado. No necesitas mantener esta página abierta: tu pedido queda guardado en tu cuenta.</p>}
    {order?.status === 'DISPATCHED' && <p className="admin-note">Tu pedido salió del local para delivery{order.dispatchedAt ? ` el ${dateLabel(order.dispatchedAt)}` : ''}. Despachado no significa que ya haya llegado. Ten a mano el teléfono indicado para coordinar la entrega.</p>}
    <ResourceState {...resource} onRetry={resource.reload}>{order && <div className="admin-detail-grid">
      <div>
        <section className="admin-panel">
          <div className="admin-panel-heading"><h2>Lo que elegiste</h2><span>{order.items.length} selección(es)</span></div>
          {order.items.map(item => <div key={item.id} className="admin-order-item"><span className="admin-item-quantity">{item.quantity}×</span><div><strong>{item.productName}</strong><p>{item.presentationName}</p>{item.flavors.length > 0 && <small>Sabores: {item.flavors.join(', ')}</small>}{item.extras.length > 0 && <small>Extras: {item.extras.map(extra => extra.name).join(', ')}</small>}</div><Money value={item.totalMinor} currency={order.currency} /></div>)}
          <div className="admin-order-totals"><p><span>Subtotal</span><Money value={order.subtotalMinor} currency={order.currency} /></p><p><span>Envío</span><Money value={order.deliveryFeeMinor} currency={order.currency} /></p><p><strong>Total</strong><strong><Money value={order.totalMinor} currency={order.currency} /></strong></p></div>
        </section>
        <section className="admin-panel"><div className="admin-panel-heading"><h2>Historial del pedido</h2></div><ol className="admin-timeline">{order.history.map(entry => <li key={entry.id}><span className="admin-timeline-dot" /><div><strong>{statusLabels[entry.toStatus]}</strong><small>{dateLabel(entry.createdAt)}</small>{entry.note && <p>{entry.note}</p>}</div></li>)}</ol></section>
      </div>
      <div>
        <section className="admin-panel"><div className="admin-panel-heading"><h2>Datos de entrega</h2></div><dl className="admin-data-list"><dt>Cliente</dt><dd>{order.customerName}</dd><dt>Correo</dt><dd>{order.email}</dd><dt>Teléfono</dt><dd>{order.phone || 'No indicado'}</dd><dt>Dirección</dt><dd>{order.deliveryAddress}<br />{order.city}</dd>{order.reference && <><dt>Referencia</dt><dd>{order.reference}</dd></>}</dl></section>
        <section className="admin-panel">
          <div className="admin-panel-heading"><h2>Pagos</h2></div>
          {order.payments.length ? order.payments.map(payment => <div className="admin-payment-item" key={payment.id}><strong>{methodLabels[payment.method]}</strong><span className={`admin-badge ${payment.status === 'APPROVED' ? 'status-approved' : 'status-canceled'}`}>{payment.status === 'APPROVED' ? 'Aprobado' : payment.status === 'REFUNDED' ? 'Devuelto' : 'Rechazado'}</span><p><Money value={payment.amountMinor} currency={order.currency} /></p><small>{dateLabel(payment.createdAt)}</small></div>) : <p className="admin-empty-inline">Este pedido todavía no tiene un pago registrado.</p>}
          <p className="admin-note">Pagos de demostración. No representan movimientos bancarios reales.</p>
          {order.status === 'PENDING_PAYMENT' && <Link className="admin-button" href={`/checkout?order=${encodeURIComponent(order.id)}`}>Continuar al pago simulado →</Link>}
        </section>
      </div>
    </div>}</ResourceState>
  </>;
}
