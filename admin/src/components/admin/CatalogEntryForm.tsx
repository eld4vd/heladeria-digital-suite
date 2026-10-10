'use client';

import { useId, useState, type FormEvent } from 'react';
import { api } from '@/lib/api';
import type { Category, Extra, Flavor, Product } from '@/lib/types';
import { ImagePreview } from './ImagePreview';
import { Feedback, Field, Modal, errorMessage } from './shared';

export type CatalogKind = 'products' | 'categories' | 'flavors' | 'extras';
export type CatalogEntity = Product | Category | Flavor | Extra;
type Resource<T> = { data: T[] | null; loading: boolean; error: string; reload: () => Promise<void> };
export type CatalogResources = {
  products: Resource<Product>; categories: Resource<Category>;
  flavors: Resource<Flavor>; extras: Resource<Extra>;
};
export const catalogLabels: Record<CatalogKind, { plural: string; singular: string; description: string }> = {
  categories: { plural: 'Categorías', singular: 'categoría', description: 'Agrupan tus helados: conos, copas, paletas o vasos. No tienen precio ni stock.' },
  flavors: { plural: 'Sabores', singular: 'sabor', description: 'Recetas que puedes asignar a tus helados. El cliente no tiene que elegirlas de nuevo.' },
  extras: { plural: 'Extras', singular: 'extra', description: 'Complementos que el cliente puede añadir a su pedido, con recargo por unidad.' },
  products: { plural: 'Helados', singular: 'helado', description: 'Sabor de la receta, precio, stock y tamaños de cada helado.' },
};
type SizeDraft = { key: string; id?: string; name: string; price: string; stock: string; active: boolean };
type Draft = {
  name: string; slug: string; description: string; imageUrl: string; categoryId: string;
  price: string; active: boolean; featured: boolean; flavorId: string; sizes: SizeDraft[];
};
function draftFor(item: CatalogEntity | 'new'): Draft {
  const entity = item === 'new' ? undefined : item as Partial<Product & Extra>;
  return {
    name: entity?.name || '', slug: entity?.slug || '', description: entity?.description || '',
    imageUrl: entity?.imageUrl || '', categoryId: entity?.categoryId || '',
    price: entity?.priceMinor === undefined ? '' : (entity.priceMinor / 100).toFixed(2),
    active: entity?.active ?? true, featured: entity?.featured ?? false,
    flavorId: entity?.flavorId || '',
    sizes: entity?.presentations?.length ? entity.presentations.map(size => ({
      key: size.id, id: size.id, name: size.name, price: (size.priceMinor / 100).toFixed(2),
      stock: String(size.stock), active: size.active,
    })) : [{ key: 'normal', name: 'Normal', price: '', stock: '0', active: true }],
  };
}
function slugFor(name: string) {
  return name.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase()
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 120).replace(/-+$/g, '');
}
function mergeOptions<T extends { id: string }>(saved: T[] | null, created: T[]) {
  return [...new Map([...(saved || []), ...created].map(item => [item.id, item])).values()];
}

export function CatalogEntryForm({ kind, item, resources, refresh, onSaved, onClose }: {
  kind: CatalogKind; item: CatalogEntity | 'new'; resources: CatalogResources;
  refresh: () => Promise<void>; onSaved: (entity: CatalogEntity) => Promise<void>; onClose: () => void;
}) {
  const hintsId = useId();
  const [draft, setDraft] = useState(() => draftFor(item));
  const [manualSlug, setManualSlug] = useState(item !== 'new');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [quickKind, setQuickKind] = useState<'categories' | 'flavors' | null>(null);
  const [createdCategories, setCreatedCategories] = useState<Category[]>([]);
  const [createdFlavors, setCreatedFlavors] = useState<Flavor[]>([]);
  const [flavorSearch, setFlavorSearch] = useState('');
  const categories = mergeOptions(resources.categories.data, createdCategories);
  const flavors = mergeOptions(resources.flavors.data, createdFlavors)
    .filter(flavor => flavor.active || flavor.id === draft.flavorId)
    .sort((a, b) => a.name.localeCompare(b.name, 'es'));
  const normalizeSearch = (value: string) => value.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLocaleLowerCase('es').trim();
  const visibleFlavors = flavors.filter(flavor => flavor.id === draft.flavorId || normalizeSearch(flavor.name).includes(normalizeSearch(flavorSearch)));
  const dependencies = kind === 'products' ? [resources.categories, resources.flavors] : [];
  const loadingOptions = dependencies.some(resource => resource.loading);
  const optionsError = dependencies.find(resource => resource.error)?.error;

  function change<K extends keyof Draft>(field: K, value: Draft[K]) { setDraft(previous => ({ ...previous, [field]: value })); }
  function changeName(name: string) {
    setDraft(previous => ({ ...previous, name, ...(!manualSlug && (kind === 'products' || kind === 'categories') ? { slug: slugFor(name) } : {}) }));
  }
  function changeSize<K extends keyof SizeDraft>(key: string, field: K, value: SizeDraft[K]) {
    setDraft(previous => ({ ...previous, sizes: previous.sizes.map(size => size.key === key ? { ...size, [field]: value } : size) }));
  }
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy || loadingOptions || optionsError) return;
    if (draft.name.trim().length < 2) { setError('Escribe un nombre de al menos 2 caracteres.'); return; }
    if (kind === 'products' && draft.sizes.some(size => size.name.trim().length < 2)) { setError('Escribe un nombre para cada tamaño, por ejemplo Normal o Grande.'); return; }
    setBusy(true); setError('');
    let body: Record<string, unknown> = { name: draft.name.trim(), active: draft.active };
    if (kind === 'categories') body = { ...body, slug: draft.slug, description: draft.description };
    if (kind === 'extras') body = { ...body, priceMinor: Math.round(Number(draft.price) * 100), imageUrl: draft.imageUrl.trim() || null };
    if (kind === 'products') body = {
      ...body, slug: draft.slug, description: draft.description, imageUrl: draft.imageUrl.trim(),
      categoryId: draft.categoryId, featured: draft.featured, flavorId: draft.flavorId || null,
      presentations: draft.sizes.map(size => ({
        ...(size.id ? { id: size.id } : { stock: Number(size.stock) }),
        name: size.name.trim(), priceMinor: Math.round(Number(size.price) * 100),
        active: size.active,
      })),
    };
    try {
      const entity = await api<CatalogEntity>(`/admin/${kind}${item === 'new' ? '' : `/${item.id}`}`, { method: item === 'new' ? 'POST' : 'PATCH', body });
      await onSaved(entity);
    } catch (err) { setError(errorMessage(err)); }
    finally { setBusy(false); }
  }
  async function saveQuick(entity: CatalogEntity) {
    if (!quickKind) return;
    if (quickKind === 'categories') {
      setCreatedCategories(previous => [...previous, entity as Category]);
      change('categoryId', entity.id);
    } else {
      setCreatedFlavors(previous => [...previous, entity as Flavor]);
      change('flavorId', entity.id);
      setFlavorSearch('');
    }
    await refresh();
    setQuickKind(null);
  }

  return <>
    <Modal title={String(item === 'new' ? 'Crear ' : 'Editar ') + catalogLabels[kind].singular} onClose={() => { if (!busy) onClose(); }}>
      <p className="admin-catalog-form-help">{catalogLabels[kind].description}</p>
      <form className="admin-form" onSubmit={save} autoComplete="off" aria-busy={busy}>
        <Field label="Nombre"><input name="name" required disabled={busy} minLength={2} maxLength={kind === 'products' ? 120 : kind === 'flavors' ? 5000 : 80} className="admin-input" value={draft.name} onChange={event => changeName(event.target.value)} /></Field>
        {(kind === 'products' || kind === 'categories') && <>
          <Field label="Identificador en la URL" hint="Se propone a partir del nombre. Puedes editarlo; después conviene conservarlo para no romper enlaces.">
            <input name="slug" required disabled={busy} maxLength={120} pattern="[a-z0-9]+(?:-[a-z0-9]+)*" spellCheck={false} className="admin-input" value={draft.slug} onChange={event => { setManualSlug(true); change('slug', event.target.value); }} />
          </Field>
          <Field label="Descripción" hint={kind === 'products' ? 'Describe la receta y qué recibe el cliente.' : 'Opcional: describe el grupo de helados.'}>
            <textarea name="description" disabled={busy} required={kind === 'products'} minLength={kind === 'products' ? 10 : undefined} maxLength={kind === 'products' ? 3000 : 500} className="admin-input" value={draft.description} onChange={event => change('description', event.target.value)} />
          </Field>
        </>}
        {(kind === 'products' || kind === 'extras') && <div className="admin-image-field">
          <Field label={kind === 'products' ? 'URL de la foto del helado' : 'URL de la foto del extra (opcional)'} hint="Usa una URL HTTPS de tu imagen. No se asigna una foto automáticamente.">
            <input name="imageUrl" required={kind === 'products'} disabled={busy} type="url" maxLength={1500} pattern="https://.+" spellCheck={false} className="admin-input" value={draft.imageUrl} onChange={event => change('imageUrl', event.target.value)} />
          </Field>
          <ImagePreview url={draft.imageUrl} alt={'Vista previa de la foto del ' + (kind === 'products' ? 'helado' : 'extra') + (draft.name.trim() ? ': ' + draft.name.trim() : '')} />
        </div>}
        {kind === 'products' && <>
          <div>
            <Field label="Categoría" hint="El grupo al que pertenece. Una categoría inactiva también oculta sus helados en la tienda.">
              <select name="categoryId" required disabled={busy || resources.categories.loading} className="admin-input" value={draft.categoryId} onChange={event => change('categoryId', event.target.value)}>
                <option value="">Selecciona una categoría</option>
                {categories.map(category => <option key={category.id} value={category.id}>{category.name}{category.active === false ? ' (inactiva)' : ''}</option>)}
              </select>
            </Field>
            {!categories.length && !resources.categories.loading && !resources.categories.error && <p className="admin-note">Crea una categoría para poder guardar este helado.</p>}
            <button type="button" className="admin-text-button" disabled={busy} onClick={() => setQuickKind('categories')}>+ Crear categoría sin cerrar el helado</button>
          </div>
          <div className="grid gap-2.5">
            {flavors.length > 8 && <Field label="Buscar un sabor">
              <input name="flavorSearch" type="search" disabled={busy || resources.flavors.loading} maxLength={120} className="admin-input" value={flavorSearch} onChange={event => setFlavorSearch(event.target.value)} placeholder="Busca por nombre" />
            </Field>}
            <Field label="Sabor de la receta (opcional)" hint="Selecciona el sabor que ya tiene este helado. No cambia el precio y el cliente no lo vuelve a elegir.">
              <select name="flavorId" disabled={busy || resources.flavors.loading} className="admin-input" value={draft.flavorId} onChange={event => change('flavorId', event.target.value)}>
                <option value="">Sin especificar</option>
                {visibleFlavors.map(flavor => <option key={flavor.id} value={flavor.id}>{flavor.name}{flavor.active ? '' : ' (inactivo; receta actual)'}</option>)}
              </select>
            </Field>
            {!flavors.length && !resources.flavors.loading && !resources.flavors.error && <p className="admin-note">Todavía no hay sabores. Puedes crear uno aquí y asignarlo al helado.</p>}
            {flavorSearch && !visibleFlavors.some(flavor => normalizeSearch(flavor.name).includes(normalizeSearch(flavorSearch))) && <output className="admin-note" aria-live="polite">No hay sabores con ese nombre. Puedes crear uno nuevo.</output>}
            {draft.flavorId && flavors.some(flavor => flavor.id === draft.flavorId && !flavor.active) && <p className="admin-note">Este sabor sigue siendo la receta del helado. Para asignarlo a otros, reactívalo desde Sabores.</p>}
            <button type="button" className="admin-text-button justify-self-start" disabled={busy} onClick={() => setQuickKind('flavors')}>+ Crear sabor sin cerrar el helado</button>
          </div>
          <section aria-labelledby={hintsId + '-sizes'} className="admin-catalog-size-section">
            <h3 id={hintsId + '-sizes'}>Precio y stock</h3>
            <p className="admin-catalog-hint">Si sólo vendes un tamaño, deja “Normal” y escribe su precio. Si vendes pequeño o grande, añade sus opciones aquí. No necesitas crear otra ficha aparte.</p>
            <div className="admin-catalog-size-list">{draft.sizes.map(size => <fieldset key={size.key} className="admin-catalog-size" disabled={busy}>
              <legend>{size.name || 'Nuevo tamaño'}</legend>
              <Field label="Tamaño" hint="Por ejemplo: Normal, Pequeño, Grande o 500 ml."><input name={'sizeName-' + size.key} required minLength={2} maxLength={80} className="admin-input" value={size.name} onChange={event => changeSize(size.key, 'name', event.target.value)} /></Field>
              <Field label="Precio base" hint="Incluye el sabor. Los extras se suman aparte, según la moneda configurada."><input name={'sizePrice-' + size.key} required type="number" inputMode="decimal" min={0.01} max={100000} step="0.01" className="admin-input" value={size.price} onChange={event => changeSize(size.key, 'price', event.target.value)} /></Field>
              {size.id ? <p className="admin-catalog-hint">Stock actual: {size.stock} unidades. Las entradas y retiros posteriores se registran desde Inventario, con su motivo.</p> : <Field label="Stock inicial" hint="Unidades disponibles para vender. Con cero, esta opción aparece agotada."><input name={'sizeStock-' + size.key} required type="number" min={0} max={1000000} step={1} className="admin-input" value={size.stock} onChange={event => changeSize(size.key, 'stock', event.target.value)} /></Field>}
              <label className="admin-checkbox"><input name={'sizeActive-' + size.key} type="checkbox" checked={size.active} onChange={event => changeSize(size.key, 'active', event.target.checked)} />Tamaño disponible para vender</label>
              {!size.id && draft.sizes.length > 1 && <button type="button" className="admin-text-button admin-danger" onClick={() => change('sizes', draft.sizes.filter(row => row.key !== size.key))}>Quitar este tamaño nuevo</button>}
              {size.id && <p className="admin-note">Para dejar de vender este tamaño, desmarca su disponibilidad. Se conservará el historial de pedidos.</p>}
            </fieldset>)}</div>
            <button type="button" disabled={busy || draft.sizes.length >= 20} className="admin-text-button" onClick={() => change('sizes', [...draft.sizes, { key: crypto.randomUUID(), name: '', price: '', stock: '0', active: true }])}>+ Añadir otro tamaño con su precio</button>
          </section>
          <label className="admin-checkbox"><input name="featured" disabled={busy} type="checkbox" checked={draft.featured} onChange={event => change('featured', event.target.checked)} />Mostrar entre los destacados</label>
        </>}
        {kind === 'extras' && <Field label="Recargo por unidad de helado" hint="Se suma al precio base cuando el cliente elige este extra. Cero significa sin recargo.">
          <input name="price" required disabled={busy} type="number" inputMode="decimal" min={0} max={100000} step="0.01" className="admin-input" value={draft.price} onChange={event => change('price', event.target.value)} />
        </Field>}
        <label className="admin-checkbox"><input name="active" disabled={busy} type="checkbox" checked={draft.active} onChange={event => change('active', event.target.checked)} />{kind === 'flavors' ? 'Disponible para asignar a helados' : kind === 'extras' ? 'Disponible para elegir' : 'Activo en el catálogo'}</label>
        {loadingOptions && <output className="admin-note" aria-live="polite">Cargando las opciones del catálogo…</output>}
        {optionsError && <div><Feedback error={optionsError} /><button type="button" className="admin-text-button" disabled={busy} onClick={() => { void refresh(); }}>Volver a cargar las opciones</button></div>}
        <Feedback error={error} />
        <div className="admin-form-actions"><button type="button" disabled={busy} className="admin-button admin-button-secondary" onClick={onClose}>Cancelar</button><button type="submit" className="admin-button" disabled={busy || loadingOptions || Boolean(optionsError)}>{busy ? 'Guardando…' : 'Guardar ' + catalogLabels[kind].singular}</button></div>
      </form>
    </Modal>
    {quickKind && <CatalogEntryForm key={quickKind} kind={quickKind} item="new" resources={resources} refresh={refresh} onSaved={saveQuick} onClose={() => setQuickKind(null)} />}
  </>;
}
