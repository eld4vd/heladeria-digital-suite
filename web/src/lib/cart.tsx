'use client';

import { useEffect, useSyncExternalStore, type ReactNode } from 'react';
import type { CartItem } from './types';

const CART_KEY = 'delicias:cart:v1';
const DIRECT_KEY = 'delicias:direct:v1';
const MAX_LINES = 50;
const MAX_FLAVORS = 10;
const MAX_EXTRAS = 20;
type CartState = { items: CartItem[]; buyNowItem: CartItem | null; hydrated: boolean };
const serverState: CartState = { items: [], buyNowItem: null, hydrated: false };
let state = serverState;
const listeners = new Set<() => void>();

function sanitize(value: unknown): CartItem | null {
  if (!value || typeof value !== 'object') return null;
  const item = value as Partial<CartItem>;
  const strings = ['key', 'productId', 'productName', 'productSlug', 'imageUrl', 'presentationId', 'presentationName'] as const;
  if (strings.some((key) => typeof item[key] !== 'string') || !Number.isSafeInteger(item.quantity) || !Number.isSafeInteger(item.unitPriceMinor) || Number(item.unitPriceMinor) < 0) return null;
  const safeStrings = (data: unknown, max: number): string[] => Array.isArray(data) ? data.filter((entry): entry is string => typeof entry === 'string').slice(0, max) : [];
  const safeIds = (data: unknown, max: number): string[] => [...new Set(safeStrings(data, max))];
  const extras = Array.isArray(item.extras) ? item.extras.filter((entry) => entry && typeof entry.name === 'string' && Number.isSafeInteger(entry.priceMinor) && entry.priceMinor >= 0).map((entry) => ({ name: entry.name, priceMinor: entry.priceMinor })).slice(0, MAX_EXTRAS) : [];
  return { key: item.key!, productId: item.productId!, productName: item.productName!, productSlug: item.productSlug!, imageUrl: item.imageUrl!, presentationId: item.presentationId!, presentationName: item.presentationName!, quantity: Math.max(1, Math.min(50, item.quantity!)), unitPriceMinor: item.unitPriceMinor!, flavorIds: safeIds(item.flavorIds, MAX_FLAVORS), flavorNames: safeStrings(item.flavorNames, MAX_FLAVORS), extraIds: safeIds(item.extraIds, MAX_EXTRAS), extras };
}
function readCart(): CartItem[] {
  try { const saved: unknown = JSON.parse(localStorage.getItem(CART_KEY) || '[]'); return Array.isArray(saved) ? saved.map(sanitize).filter((item): item is CartItem => item !== null).slice(0, MAX_LINES) : []; } catch { return []; }
}
function readDirect(): CartItem | null {
  try { return sanitize(JSON.parse(sessionStorage.getItem(DIRECT_KEY) || 'null')); } catch { return null; }
}
function publish(next: CartState, persist = true) {
  state = next;
  if (persist && typeof window !== 'undefined') {
    try { localStorage.setItem(CART_KEY, JSON.stringify(state.items)); } catch { /* El almacenamiento puede estar deshabilitado; la sesión actual sigue funcionando. */ }
    try { if (state.buyNowItem) sessionStorage.setItem(DIRECT_KEY, JSON.stringify(state.buyNowItem)); else sessionStorage.removeItem(DIRECT_KEY); } catch { /* No se guardan datos personales del cliente en ninguno de los dos almacenamientos. */ }
  }
  for (const listener of listeners) listener();
}
function subscribe(listener: () => void) { listeners.add(listener); return () => listeners.delete(listener); }
const getSnapshot = () => state;
const getServerSnapshot = () => serverState;

const actions = {
  addItem(value: CartItem): boolean {
    const item = sanitize(value);
    if (!item) return false;
    const existing = state.items.find((entry) => entry.key === item.key);
    if (!existing && state.items.length >= MAX_LINES) return false;
    const items = existing ? state.items.map((entry) => entry.key === item.key ? { ...item, quantity: Math.min(50, entry.quantity + item.quantity) } : entry) : [...state.items, item];
    publish({ ...state, items });
    return true;
  },
  updateQuantity(key: string, quantity: number) {
    if (!Number.isSafeInteger(quantity)) return;
    publish({ ...state, items: state.items.map((entry) => entry.key === key ? { ...entry, quantity: Math.max(1, Math.min(50, quantity)) } : entry) });
  },
  removeItem(key: string) { publish({ ...state, items: state.items.filter((entry) => entry.key !== key) }); },
  clearCart() { publish({ ...state, items: [] }); },
  buyNow(value: CartItem) { const item = sanitize(value); if (item) publish({ ...state, buyNowItem: item }); },
  clearBuyNow() { publish({ ...state, buyNowItem: null }); },
};

export function CartProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    if (!state.hydrated) publish({ items: readCart(), buyNowItem: readDirect(), hydrated: true }, false);
    const sync = (event: StorageEvent) => { if (event.key === CART_KEY) publish({ ...state, items: readCart() }, false); };
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, []);
  return children;
}

export function useCart() {
  return { ...useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot), ...actions };
}
