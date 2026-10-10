'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import type { Category, Product } from '@/lib/types';
import { money } from '@/lib/format';
import {
  catalogFacets, catalogFilterKeys, catalogSorts, filterCatalog, parseCatalogPrice,
  type CatalogFilters, type CatalogSort,
} from '@/lib/catalog-filters';
import { ProductCard } from './ProductCard';
import { Icon } from './Icon';
import styles from './Catalog.module.css';

export function CatalogBrowser({ products, categories, currency, locale }: {
  products: Product[]; categories: Category[]; currency: string; locale: string;
}) {
  const params = useSearchParams();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const sort = params.get('orden');
  const filters: CatalogFilters = {
    query: params.get('q') ?? '', categoryId: params.get('categoria') ?? '',
    presentations: [...new Set(params.getAll('presentacion'))],
    flavors: [...new Set(params.getAll('sabor'))],
    minPrice: params.get('min') ?? '', maxPrice: params.get('max') ?? '',
    onlyAvailable: params.get('disponible') === '1',
    sort: catalogSorts.includes(sort as CatalogSort) ? sort as CatalogSort : 'featured',
  };
  const facets = useMemo(() => catalogFacets(products, categories), [products, categories]);
  const filtered = filterCatalog(products, filters);
  const min = parseCatalogPrice(filters.minPrice);
  const max = parseCatalogPrice(filters.maxPrice);
  const priceError = (filters.minPrice && min === null) || (filters.maxPrice && max === null)
    ? 'Usa un precio no negativo con un máximo de dos decimales.'
    : min !== null && max !== null && min > max ? 'El mínimo no puede ser mayor que el máximo.' : '';

  function update(changes: Record<string, string | string[]>, replace = false) {
    // El historial nativo se integra con el enrutador de Next; cada pulsación no vuelve a solicitar datos ni mueve el desplazamiento.
    const next = new URLSearchParams(window.location.search);
    for (const [key, value] of Object.entries(changes)) {
      next.delete(key);
      for (const item of Array.isArray(value) ? value : [value]) if (item) next.append(key, item);
    }
    const query = next.toString();
    const url = window.location.pathname + (query ? '?' + query : '') + window.location.hash;
    if (replace) window.history.replaceState(null, '', url);
    else window.history.pushState(null, '', url);
  }

  function toggle(key: 'presentacion' | 'sabor', value: string) {
    const selected = new URLSearchParams(window.location.search).getAll(key);
    update({ [key]: selected.includes(value) ? selected.filter((item) => item !== value) : [...selected, value] });
  }

  function clearFilters() {
    update(Object.fromEntries(catalogFilterKeys.map((key) => [key, ''])));
  }

  const chips: { key: string; label: string; remove: () => void }[] = [];
  if (filters.query) chips.push({ key: 'query', label: 'Búsqueda: ' + filters.query, remove: () => update({ q: '' }) });
  if (filters.categoryId) chips.push({ key: 'category', label: facets.categories.find((item) => item.id === filters.categoryId)?.name ?? 'Categoría no disponible', remove: () => update({ categoria: '' }) });
  for (const id of filters.presentations) chips.push({ key: 'presentation-' + id, label: facets.presentations.find((item) => item.id === id)?.name ?? 'Presentación no disponible', remove: () => toggle('presentacion', id) });
  for (const id of filters.flavors) chips.push({ key: 'flavor-' + id, label: facets.flavors.find((item) => item.id === id)?.name ?? 'Sabor no disponible', remove: () => toggle('sabor', id) });
  if (filters.minPrice || filters.maxPrice) chips.push({
    key: 'price', label: 'Precio: ' + (min !== null ? money(min, currency, locale) : 'sin mínimo') + ' – ' + (max !== null ? money(max, currency, locale) : 'sin máximo'),
    remove: () => update({ min: '', max: '' }),
  });
  if (filters.onlyAvailable) chips.push({ key: 'available', label: 'Con stock', remove: () => update({ disponible: '' }) });
  const rangeValue = facets.priceBounds ? Math.max(facets.priceBounds.min, Math.min(facets.priceBounds.max, max ?? facets.priceBounds.max)) : 0;

  return <div className={styles.layout}>
    <button className={styles.mobileToggle} type="button" aria-expanded={filtersOpen} aria-controls="filtros-catalogo" onClick={() => setFiltersOpen(!filtersOpen)}>
      <Icon name="filters" size={19} /><span>{filtersOpen ? 'Ocultar filtros' : 'Mostrar filtros'}</span>
      {chips.length > 0 && <span className={styles.filterCount}>{chips.length}</span>}
    </button>

    <aside id="filtros-catalogo" className={styles.sidebar} data-open={filtersOpen} aria-labelledby="titulo-filtros">
      <div className={styles.sidebarHeading}><h2 id="titulo-filtros"><Icon name="filters" size={19} />Filtros</h2>
        <button className={styles.clearButton} type="button" onClick={clearFilters} disabled={!chips.length}>Limpiar</button>
      </div>

      <label className={styles.search} htmlFor="buscar-helados"><span className={styles.fieldLabel}>Buscar un antojo</span>
        <span className={styles.searchControl}><Icon name="search" size={18} />
          <input id="buscar-helados" name="q" type="search" autoComplete="off" value={filters.query} onChange={(event) => update({ q: event.target.value }, true)} placeholder="Helado o sabor…" />
        </span>
      </label>

      <fieldset className={styles.group}><legend>Categorías</legend>
        <label className={styles.category}><input name="categoria" type="radio" value="" checked={!filters.categoryId} onChange={() => update({ categoria: '' })} /><span>Todos los helados</span><span className={styles.count}>{products.length}</span></label>
        {facets.categories.map((item) => <label key={item.id} className={styles.category}><input name="categoria" type="radio" value={item.id} checked={filters.categoryId === item.id} onChange={() => update({ categoria: item.id })} /><span>{item.name}</span><span className={styles.count}>{item.count}</span></label>)}
        {!facets.categories.length && <p className={styles.hint}>Las categorías aparecerán al publicarse.</p>}
      </fieldset>

      <fieldset className={styles.group}><legend>Precio inicial <span className={styles.currency}>{currency}</span></legend>
        <p className={styles.hint} id="precio-ayuda">Precio desde, sin extras ni delivery.</p>
        <input className={styles.priceSlider} type="range" aria-label="Filtrar por precio máximo" aria-valuetext={facets.priceBounds ? money(rangeValue, currency, locale) : 'Sin precios disponibles'} min={facets.priceBounds?.min ?? 0} max={facets.priceBounds?.max ?? 0} step={1} value={rangeValue} disabled={!facets.priceBounds || facets.priceBounds.min === facets.priceBounds.max} onChange={(event) => update({ max: (Number(event.target.value) / 100).toFixed(2) }, true)} />
        <div className={styles.priceInputs}>
          <label htmlFor="precio-minimo"><span>Mínimo</span><input id="precio-minimo" name="min" type="text" inputMode="decimal" autoComplete="off" value={filters.minPrice} placeholder="Sin mínimo" disabled={!facets.priceBounds} aria-describedby={'precio-ayuda' + (priceError ? ' precio-error' : '')} aria-invalid={Boolean(priceError)} onChange={(event) => update({ min: event.target.value }, true)} /></label>
          <label htmlFor="precio-maximo"><span>Máximo</span><input id="precio-maximo" name="max" type="text" inputMode="decimal" autoComplete="off" value={filters.maxPrice} placeholder="Sin máximo" disabled={!facets.priceBounds} aria-describedby={'precio-ayuda' + (priceError ? ' precio-error' : '')} aria-invalid={Boolean(priceError)} onChange={(event) => update({ max: event.target.value }, true)} /></label>
        </div>
        {priceError && <p id="precio-error" className={styles.priceError} role="alert">{priceError}</p>}
        {!facets.priceBounds && <p className={styles.hint}>Disponible cuando haya precios publicados.</p>}
      </fieldset>

      <fieldset className={styles.group}><legend>Tamaños</legend>
        <div className={styles.options}>{facets.presentations.map((item) => <button key={item.id} type="button" className={styles.option} aria-pressed={filters.presentations.includes(item.id)} onClick={() => toggle('presentacion', item.id)}>{item.name}<span className={styles.count}>{item.count}</span></button>)}</div>
        {!facets.presentations.length && <p className={styles.hint}>Los tamaños aparecerán con la carta.</p>}
      </fieldset>

      <fieldset className={styles.group}><legend>Sabores</legend>
        <div className={styles.options}>{facets.flavors.map((item) => <button key={item.id} type="button" className={styles.option} aria-pressed={filters.flavors.includes(item.id)} onClick={() => toggle('sabor', item.id)}>{item.name}<span className={styles.count}>{item.count}</span></button>)}</div>
        {!facets.flavors.length && <p className={styles.hint}>Los sabores disponibles aparecerán aquí.</p>}
      </fieldset>

      <fieldset className={styles.group}><legend>Disponibilidad</legend>
        <label className={styles.availability}><input name="disponible" type="checkbox" checked={filters.onlyAvailable} disabled={!products.length} onChange={(event) => update({ disponible: event.target.checked ? '1' : '' })} /><span>Solo helados con stock</span></label>
      </fieldset>
    </aside>

    <section className={styles.results} aria-labelledby="titulo-catalogo">
      <header className={styles.heading}><h1 id="titulo-catalogo">¿Cuál se te antoja?</h1><p>Tu helado favorito, con un extra si te apetece.</p></header>
      <div className={styles.toolbar}>
        <output className={styles.resultCount} aria-live="polite" aria-atomic="true">{filtered.length} {filtered.length === 1 ? 'helado' : 'helados'}{chips.length ? ' de ' + products.length : ' en la carta'}</output>
        <label className={styles.sort} htmlFor="orden-catalogo"><span>Ordenar por</span><select id="orden-catalogo" name="orden" value={filters.sort} disabled={!products.length} onChange={(event) => update({ orden: event.target.value === 'featured' ? '' : event.target.value })}><option value="featured">Destacados</option><option value="price-asc">Menor precio</option><option value="price-desc">Mayor precio</option><option value="name">Nombre: A–Z</option></select></label>
      </div>
      {chips.length > 0 && <div className={styles.activeFilters} aria-label="Filtros aplicados">{chips.map((chip) => <button type="button" key={chip.key} className={styles.filterChip} onClick={chip.remove} aria-label={'Quitar filtro: ' + chip.label}><span>{chip.label}</span><Icon name="close" size={15} /></button>)}</div>}

      {filtered.length > 0 ? <div className={styles.grid}>{filtered.map((product) => <ProductCard key={product.id} product={product} currency={currency} locale={locale} heading="h2" variant="catalog" />)}</div>
        : <div className={styles.empty}>
          <span className={styles.emptyIcon}><Icon name={products.length ? 'search' : 'ice'} size={36} /></span>
          <h2>{products.length ? 'Ese antojo aún no aparece.' : 'Nuestra carta está por llegar.'}</h2>
          <p>{products.length ? 'Prueba con otro sabor o quita los filtros para ver todos los helados.' : 'Todavía no hay helados publicados. Sus fotos, sabores y precios aparecerán aquí cuando la carta esté lista.'}</p>
          {chips.length ? <button className="button" type="button" onClick={clearFilters}>Quitar filtros<Icon name="close" size={17} /></button> : <Link className="button" href="/heladeria">Conoce la heladería<Icon name="arrow" size={17} /></Link>}
        </div>}
    </section>
  </div>;
}
