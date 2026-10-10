'use client';
import Link from 'next/link';
import { useRef, useState } from 'react';
import type { Order } from '@/lib/types';
import { OrderActions } from './OrderActions';
import { Feedback, Money, PageHeading, ResourceState, StatusBadge, useDateLabel, methodLabels, statusLabels, useResource } from './shared';
export function OrdersScreen() {
  const dateLabel = useDateLabel();
  const resource = useResource<Order[]>('/admin/orders', 10000); const [query, setQuery] = useState(''); const [status, setStatus] = useState('');
  const [success, setSuccess] = useState('');
  const searchInput = useRef<HTMLInputElement>(null);
  const detailLinks = useRef(new Map<string, HTMLAnchorElement>());
  const orders = (resource.data || []).filter(order => (!status || order.status === status) && `${order.code} ${order.customerName} ${order.email}`.toLowerCase().includes(query.toLowerCase()));
  async function updated(message: string, orderId: string) {
    setSuccess(message);
    await resource.reload();
    requestAnimationFrame(() => { (detailLinks.current.get(orderId) || searchInput.current)?.focus(); });
  }
  return <>
    <PageHeading title="Pedidos" description="Despacha los pedidos confirmados desde esta lista. Se actualiza mientras está visible." />
    <Feedback success={success} />
    <div className="admin-toolbar admin-toolbar-context">
      <input ref={searchInput} aria-label="Buscar pedidos" className="admin-input admin-search" placeholder="Buscar código, cliente o correo…" value={query} onChange={event => setQuery(event.target.value)} />
      <select className="admin-input" aria-label="Filtrar por estado" value={status} onChange={event => setStatus(event.target.value)}><option value="">Todos los estados</option>{Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
      <button type="button" className="admin-button admin-button-secondary" onClick={() => void resource.reload()}>Actualizar</button>
    </div>
    <ResourceState {...resource} onRetry={resource.reload} empty={!resource.data?.length}>
      <section className="admin-panel">
        <div className="admin-table-wrap"><table className="admin-table admin-orders-table">
          <caption className="admin-sr-only">Pedidos de la tienda y acciones disponibles</caption>
          <thead><tr><th scope="col">Pedido</th><th scope="col">Cliente</th><th scope="col">Entrega</th><th scope="col">Estado</th><th scope="col">Total</th><th scope="col">Acciones</th></tr></thead>
          <tbody>{orders.map(order => <tr key={order.id}>
            <td><Link className="admin-table-link" href={`/pedidos/${order.id}`}>{order.code}</Link><small>{dateLabel(order.createdAt)}</small></td>
            <td><strong>{order.customerName}</strong><small>{order.phone}</small></td>
            <td>{order.city}<small>{order.items.reduce((sum, item) => sum + item.quantity, 0)} helados</small></td>
            <td><StatusBadge status={order.status} /></td>
            <td><Money value={order.totalMinor} currency={order.currency} /></td>
            <td><div className="admin-order-row-actions"><OrderActions order={order} onUpdated={message => updated(message, order.id)} /><Link ref={node => { if (node) detailLinks.current.set(order.id, node); else detailLinks.current.delete(order.id); }} className="admin-text-button" aria-label={`Ver detalle de ${order.code}`} href={`/pedidos/${order.id}`}>Detalle</Link></div></td>
          </tr>)}</tbody>
        </table></div>
        {!orders.length && <p className="admin-empty-inline">No hay pedidos que coincidan con tu búsqueda.</p>}
        <p className="admin-catalog-scroll-hint">Desliza la tabla para ver todas las acciones.</p>
      </section>
    </ResourceState>
  </>;
}
export function OrderDetailScreen({ id }: { id: string }) {
  const dateLabel = useDateLabel();
  const backLink = useRef<HTMLAnchorElement>(null);
  const resource = useResource<Order>(`/orders/${encodeURIComponent(id)}`, 10000);
  const order = resource.data;
  const [success, setSuccess] = useState('');
  async function updated(message: string) {
    setSuccess(message);
    await resource.reload();
    requestAnimationFrame(() => backLink.current?.focus());
  }
  return <>
    <Link ref={backLink} className="admin-back-link" href="/pedidos">← Volver a pedidos</Link>
    <PageHeading title={order ? `Pedido ${order.code}` : 'Detalle de pedido'} description={order ? `Recibido el ${dateLabel(order.createdAt)}` : 'Contenido, entrega y pago.'} actions={order && <StatusBadge status={order.status} />} />
    <Feedback success={success} />
    <ResourceState {...resource} onRetry={resource.reload}>{order && <>
      <div className="admin-order-detail-actions"><OrderActions order={order} onUpdated={updated} />{order.status === 'DISPATCHED' && <p className="admin-note">{order.dispatchedAt ? `Despachado el ${dateLabel(order.dispatchedAt)}.` : 'Despachado; fecha histórica no disponible.'} Venta simulada registrada. Este estado no confirma la recepción por el cliente.</p>}</div>
      <div className="admin-detail-grid"><div>
        <section className="admin-panel">
          <div className="admin-panel-heading"><h2>Helados del pedido</h2><span>{order.items.reduce((sum, item) => sum + item.quantity, 0)} unidades</span></div>
          {order.items.map(item => <div key={item.id} className="admin-order-item"><span className="admin-item-quantity">{item.quantity}×</span><div><strong>{item.productName}</strong><p>{item.presentationName}</p>{item.flavors.length > 0 && <small>Sabor: {item.flavors.join(', ')}</small>}{item.extras.length > 0 && <small>Extras: {item.extras.map(extra => extra.name).join(', ')}</small>}</div><Money value={item.totalMinor} currency={order.currency} /></div>)}
          <div className="admin-order-totals"><p><span>Subtotal</span><Money value={order.subtotalMinor} currency={order.currency} /></p><p><span>Envío</span><Money value={order.deliveryFeeMinor} currency={order.currency} /></p><p><strong>Total</strong><strong><Money value={order.totalMinor} currency={order.currency} /></strong></p></div>
        </section>
        <section className="admin-panel"><div className="admin-panel-heading"><h2>Historial</h2></div><ol className="admin-timeline">{order.history.map(entry => <li key={entry.id}><span className="admin-timeline-dot" /><div><strong>{statusLabels[entry.toStatus]}</strong><small>{dateLabel(entry.createdAt)}</small>{entry.note && <p>{entry.note}</p>}</div></li>)}</ol></section>
      </div><div>
        <section className="admin-panel"><div className="admin-panel-heading"><h2>Entrega</h2></div><dl className="admin-data-list"><dt>Cliente</dt><dd>{order.customerName}</dd><dt>Correo</dt><dd>{order.email}</dd><dt>Teléfono</dt><dd>{order.phone || 'No indicado'}</dd><dt>Dirección</dt><dd>{order.deliveryAddress}<br />{order.city}</dd>{order.reference && <><dt>Referencia</dt><dd>{order.reference}</dd></>}</dl></section>
        <section className="admin-panel"><div className="admin-panel-heading"><h2>Pagos</h2></div>{order.payments.length ? order.payments.map(payment => <div className="admin-payment-item" key={payment.id}><strong>{methodLabels[payment.method]}</strong><span className={`admin-badge ${payment.status === 'APPROVED' ? 'status-positive' : 'status-canceled'}`}>{payment.status === 'APPROVED' ? 'Aprobado' : payment.status === 'REFUNDED' ? 'Devuelto' : 'Rechazado'}</span><p><Money value={payment.amountMinor} currency={order.currency} /></p><small>{dateLabel(payment.createdAt)}</small></div>) : <p className="admin-empty-inline">Todavía no tiene un pago registrado.</p>}<p className="admin-note">Pagos de demostración, sin movimientos bancarios reales.</p></section>
      </div></div>
    </>}</ResourceState>
  </>;
}
