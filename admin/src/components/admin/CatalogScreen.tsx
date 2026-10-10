'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import type { Category, Extra, Flavor, Product } from '@/lib/types';
import { Feedback, Modal, Money, PageHeading, ResourceState, errorMessage, useAdminUser, useResource } from './shared';
import { CatalogEntryForm, catalogLabels, type CatalogEntity, type CatalogKind } from './CatalogEntryForm';
import { CatalogThumbnail } from './CatalogThumbnail';

type Editing = { kind: CatalogKind; item: CatalogEntity | 'new' };
const PAGE_SIZE = 25;

function productOverview(product: Product) {
  const sizes = product.presentations.filter(size => size.active);
  const pricedSizes = sizes.length ? sizes : product.presentations;
  const prices = pricedSizes.map(size => size.priceMinor);
  const stock = sizes.reduce((total, size) => total + size.stock, 0);
  const reason = !product.active ? 'Helado inactivo'
    : product.category?.active === false ? 'Categoría inactiva'
      : !product.presentations.length ? 'Sin precio configurado'
        : !sizes.length ? 'Sin tamaños activos'
          : !sizes.some(size => size.stock > 0) ? 'Sin stock' : '';
  return { stock, price: prices.length ? Math.min(...prices) : null, from: new Set(prices).size > 1, reason };
}

export default function CatalogScreen() {
  const editable = useAdminUser()?.role === 'ADMIN';
  const [kind, setKind] = useState<CatalogKind>('products');
  const [query, setQuery] = useState('');
  const [requestedPage, setRequestedPage] = useState(1);
  const [editing, setEditing] = useState<Editing | null>(null);
  const [deactivating, setDeactivating] = useState<{ kind: CatalogKind; item: CatalogEntity } | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const products = useResource<Product[]>('/admin/products');
  const categories = useResource<Category[]>('/admin/categories');
  const flavors = useResource<Flavor[]>('/admin/flavors');
  const extras = useResource<Extra[]>('/admin/extras');
  const resources = { products, categories, flavors, extras };
  const resource = resources[kind];
  const rows: CatalogEntity[] = (resource.data || []).filter(item => item.name.toLowerCase().includes(query.toLowerCase()));
  const pages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const page = Math.min(requestedPage, pages);
  const offset = (page - 1) * PAGE_SIZE;
  const visibleRows = rows.slice(offset, offset + PAGE_SIZE);

  function show(next: CatalogKind) { setKind(next); setQuery(''); setRequestedPage(1); setSuccess(''); }
  function open(entryKind: CatalogKind, item: CatalogEntity | 'new' = 'new') { setEditing({ kind: entryKind, item }); setSuccess(''); }
  async function refresh() { await Promise.all([products.reload(), categories.reload(), flavors.reload(), extras.reload()]); }
  async function saved() {
    const savedKind = editing?.kind;
    setEditing(null);
    await refresh();
    setSuccess(savedKind === 'products' ? 'Helado, precios y tamaños guardados. Si tiene stock y está activo junto con su categoría, ya puede comprarse.' : 'Los cambios se guardaron en el catálogo.');
  }
  async function deactivate() {
    if (!deactivating || busy) return;
    setBusy(true); setError('');
    try {
      await api(`/admin/${deactivating.kind}/${deactivating.item.id}`, { method: 'DELETE' });
      setDeactivating(null);
      await refresh();
      setSuccess('El registro quedó inactivo. Se conserva y puedes reactivarlo desde Editar.');
    } catch (err) { setError(errorMessage(err)); }
    finally { setBusy(false); }
  }
  function actions(item: CatalogEntity) {
    return editable && <div className="admin-row-actions">
      <button type="button" className="admin-text-button" aria-label={'Editar ' + catalogLabels[kind].singular + ': ' + item.name} onClick={() => open(kind, item)}>Editar</button>
      {item.active !== false && <button type="button" className="admin-text-button admin-danger" aria-label={'Desactivar ' + catalogLabels[kind].singular + ': ' + item.name} onClick={() => { setDeactivating({ kind, item }); setError(''); }}>Desactivar</button>}
    </div>;
  }

  return <>
    <PageHeading title="Catálogo de helados" description="Gestiona tus recetas, tamaños y los extras que podrán añadir los clientes." />
    <nav className="admin-tabs" aria-label="Secciones del catálogo">{(Object.keys(catalogLabels) as CatalogKind[]).map(value => <button type="button" key={value} aria-pressed={value === kind} className={value === kind ? 'is-active' : ''} onClick={() => show(value)}>{catalogLabels[value].plural}</button>)}</nav>
    <p className="admin-catalog-section-help">{catalogLabels[kind].description}</p>
    <div className="admin-toolbar admin-toolbar-context">
      <input name="catalogSearch" type="search" autoComplete="off" className="admin-input admin-search" aria-label={'Buscar ' + catalogLabels[kind].plural.toLowerCase()} placeholder={'Buscar ' + catalogLabels[kind].plural.toLowerCase() + '…'} value={query} onChange={event => { setQuery(event.target.value); setRequestedPage(1); }} />
      <div className="admin-toolbar-actions">
        <span className="admin-toolbar-count" aria-live="polite">{rows.length} {rows.length === 1 ? 'registro' : 'registros'}</span>
        {editable && <button type="button" className="admin-button" onClick={() => open(kind)}>+ Crear {catalogLabels[kind].singular}</button>}
      </div>
    </div>
    <Feedback success={success} />
    <ResourceState {...resource} onRetry={resource.reload}>
      {!resource.data?.length ? <section className="admin-empty">
        <h2>Todavía no hay {catalogLabels[kind].plural.toLowerCase()}</h2>
        <p>{catalogLabels[kind].description}</p>
        {editable && <button type="button" className="admin-button" onClick={() => open(kind)}>Crear {catalogLabels[kind].singular}</button>}
        {kind === 'products' && <p className="admin-note">Empieza por las categorías. También puedes crearlas dentro del formulario del helado.</p>}
      </section> : !rows.length ? <p className="admin-empty-inline">No encontramos registros con ese nombre.</p>
        : <section className="admin-panel admin-catalog-panel" aria-label={catalogLabels[kind].plural}>
          <div className="admin-table-wrap"><table className={'admin-table admin-catalog-table' + (kind === 'products' ? ' admin-catalog-products' : '')}>
            <caption className="sr-only">{catalogLabels[kind].plural}{kind === 'products' ? '. Precio base y stock de los tamaños activos. Abre Editar para consultar todos los detalles.' : ''}</caption>
            <thead><tr><th scope="col">{kind === 'products' ? 'Helado' : 'Nombre'}</th>{kind === 'products' ? <><th scope="col">Precio base</th><th scope="col">Stock</th></> : kind === 'extras' && <th scope="col">Recargo por unidad</th>}<th scope="col">Estado</th>{editable && <th scope="col">Acciones</th>}</tr></thead>
            <tbody>{visibleRows.map(item => {
              const product = kind === 'products' ? item as Product : null;
              const overview = product ? productOverview(product) : null;
              const imageUrl = product?.imageUrl || (kind === 'extras' ? (item as Extra).imageUrl : null);
              return <tr key={item.id}>
                <td><div className="admin-catalog-identity">
                  {(product || kind === 'extras') && <CatalogThumbnail src={imageUrl} preview={!!product} name={item.name} />}
                  <div><strong>{item.name}</strong>{product ? <small>{product.category?.name || categories.data?.find(category => category.id === product.categoryId)?.name || 'Sin categoría'}</small> : kind === 'categories' && <small>{(item as Category).slug}</small>}</div>
                </div></td>
                {overview ? <>
                  <td>{overview.price === null ? 'Sin configurar' : <>{overview.from && <span className="admin-catalog-price-prefix">Desde </span>}<strong><Money value={overview.price} /></strong></>}</td>
                  <td><strong>{overview.stock}</strong><small>unidades</small></td>
                </> : kind === 'extras' && <td><Money value={(item as Extra).priceMinor} /></td>}
                <td>{overview ? <><span className={`admin-badge ${!overview.reason ? 'status-positive' : item.active ? 'status-pending_payment' : 'status-canceled'}`}>{!overview.reason ? 'Disponible' : item.active ? 'No disponible' : 'Inactivo'}</span>{overview.reason && item.active && <small>{overview.reason}</small>}</> : <span className={`admin-badge ${item.active !== false ? 'status-positive' : 'status-canceled'}`}>{item.active !== false ? 'Activo' : 'Inactivo'}</span>}</td>
                {editable && <td>{actions(item)}</td>}
              </tr>;
            })}</tbody>
          </table></div>
          {kind === 'products' && <p className="admin-catalog-scroll-hint">Desliza la tabla para ver el stock y las acciones.</p>}
          {pages > 1 && <nav className="admin-catalog-pagination" aria-label="Páginas del catálogo">
            <output aria-live="polite">{offset + 1}–{Math.min(offset + PAGE_SIZE, rows.length)} de {rows.length} registros · Página {page} de {pages}</output>
            <div><button type="button" className="admin-button admin-button-secondary" disabled={page === 1} onClick={() => setRequestedPage(page - 1)}>Anterior</button><button type="button" className="admin-button admin-button-secondary" disabled={page === pages} onClick={() => setRequestedPage(page + 1)}>Siguiente</button></div>
          </nav>}
        </section>}
    </ResourceState>
    {editable && editing && <CatalogEntryForm key={editing.kind + ':' + (editing.item === 'new' ? 'new' : editing.item.id)} {...editing} resources={resources} refresh={refresh} onSaved={saved} onClose={() => setEditing(null)} />}
    {editable && deactivating && <Modal title={'Desactivar ' + catalogLabels[deactivating.kind].singular} onClose={() => { if (!busy) setDeactivating(null); }}>
      <p>¿Desactivar “{deactivating.item.name}”? No se borra el registro ni se cambian pedidos anteriores. Puedes volver a activarlo desde Editar.</p>
      {deactivating.kind === 'categories' && <p>Los helados de esta categoría dejarán de mostrarse en la tienda hasta que la reactives.</p>}
      {deactivating.kind === 'flavors' && <p>Este nombre dejará de sugerirse al describir helados. Las recetas ya guardadas y su disponibilidad no cambian.</p>}
      {deactivating.kind === 'extras' && <p>Este complemento dejará de ofrecerse para pedidos nuevos. El precio base de los helados no cambia.</p>}
      <Feedback error={error} />
      <div className="admin-form-actions"><button type="button" disabled={busy} className="admin-button admin-button-secondary" onClick={() => setDeactivating(null)}>Conservar activo</button><button type="button" disabled={busy} className="admin-button admin-button-danger" onClick={deactivate}>{busy ? 'Desactivando…' : 'Desactivar'}</button></div>
    </Modal>}
  </>;
}
