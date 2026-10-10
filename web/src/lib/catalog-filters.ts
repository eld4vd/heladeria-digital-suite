import type { Category, Product } from './types';

export const catalogFilterKeys = ['q', 'categoria', 'presentacion', 'sabor', 'min', 'max', 'disponible'] as const;
export const catalogSorts = ['featured', 'price-asc', 'price-desc', 'name'] as const;
export type CatalogSort = typeof catalogSorts[number];

export interface CatalogFilters {
  query: string;
  categoryId: string;
  presentations: string[];
  flavors: string[];
  minPrice: string;
  maxPrice: string;
  onlyAvailable: boolean;
  sort: CatalogSort;
}

interface Facet { id: string; name: string; count: number }

export function normalizeCatalogText(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('es').trim();
}

// Convierte el texto editable del precio al entrar en la interfaz; los filtros usan unidades monetarias menores enteras.
export function parseCatalogPrice(value: string): number | null {
  const text = value.trim();
  if (!/^(\d+([.,]\d{0,2})?|[.,]\d{1,2})$/.test(text)) return null;
  const minor = Math.round(Number(text.replace(',', '.')) * 100);
  return Number.isSafeInteger(minor) ? minor : null;
}

export function startingPrice(product: Product): number | null {
  const prices = product.presentations.filter((item) => item.active).map((item) => item.priceMinor);
  return prices.length ? Math.min(...prices) : null;
}

export function catalogFacets(products: Product[], categories: Category[]) {
  const presentations = new Map<string, Facet>();
  const flavors = new Map<string, Facet>();
  for (const product of products) {
    const seenPresentations = new Set<string>();
    for (const item of product.presentations.filter((presentation) => presentation.active)) {
      const id = normalizeCatalogText(item.name);
      if (seenPresentations.has(id)) continue;
      seenPresentations.add(id);
      const existing = presentations.get(id);
      presentations.set(id, { id, name: existing?.name ?? item.name, count: (existing?.count ?? 0) + 1 });
    }
    if (product.flavorId && product.flavor?.trim()) {
      const id = product.flavorId;
      const existing = flavors.get(id);
      flavors.set(id, { id, name: existing?.name ?? product.flavor.trim(), count: (existing?.count ?? 0) + 1 });
    }
  }
  const prices = products.map(startingPrice).filter((value): value is number => value !== null);
  const byName = (a: Facet, b: Facet) => a.name.localeCompare(b.name, 'es');
  return {
    categories: categories.filter((item) => item.active !== false).map((item) => ({
      id: item.id, name: item.name, count: products.filter((product) => product.categoryId === item.id).length,
    })).sort(byName),
    presentations: [...presentations.values()].sort(byName),
    flavors: [...flavors.values()].sort(byName),
    priceBounds: prices.length ? { min: Math.min(...prices), max: Math.max(...prices) } : null,
  };
}

export function filterCatalog(products: Product[], filters: CatalogFilters): Product[] {
  const query = normalizeCatalogText(filters.query);
  const min = parseCatalogPrice(filters.minPrice);
  const max = parseCatalogPrice(filters.maxPrice);
  return products.filter((product) => {
    if (filters.categoryId && product.categoryId !== filters.categoryId) return false;
    const presentations = product.presentations.filter((item) => item.active);
    if (filters.presentations.length && !presentations.some((item) => filters.presentations.includes(normalizeCatalogText(item.name)))) return false;
    if (filters.flavors.length && (!product.flavorId || !filters.flavors.includes(product.flavorId))) return false;
    if (filters.onlyAvailable && !presentations.some((item) => item.stock > 0 && (!filters.presentations.length || filters.presentations.includes(normalizeCatalogText(item.name))))) return false;
    const price = startingPrice(product);
    if ((min !== null || max !== null) && (price === null || (min !== null && price < min) || (max !== null && price > max))) return false;
    return !query || normalizeCatalogText(`${product.name} ${product.description} ${product.flavor ?? ''} ${product.category?.name ?? ''}`).includes(query);
  }).sort((a, b) => {
    if (filters.sort === 'name') return a.name.localeCompare(b.name, 'es');
    if (filters.sort === 'featured') return Number(b.featured) - Number(a.featured) || a.name.localeCompare(b.name, 'es');
    const aPrice = startingPrice(a);
    const bPrice = startingPrice(b);
    // Los productos sin precio quedan al final en ambos sentidos de ordenamiento, sin calcular Infinity - Infinity.
    if (aPrice === null) return bPrice === null ? a.name.localeCompare(b.name, 'es') : 1;
    if (bPrice === null) return -1;
    return (filters.sort === 'price-asc' ? aPrice - bPrice : bPrice - aPrice) || a.name.localeCompare(b.name, 'es');
  });
}
