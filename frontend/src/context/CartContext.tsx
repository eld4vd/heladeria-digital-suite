import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';

// ── Helpers de localStorage con try-catch y versionado (rule 4.4, 7.5) ──
const STORAGE_VERSION = 'v1';
const STORAGE_KEYS = {
  clienteTempId: `cart:${STORAGE_VERSION}:clienteTempId`,
  carritoId: `cart:${STORAGE_VERSION}:carritoId`,
  itemCount: `cart:${STORAGE_VERSION}:itemCount`,
  total: `cart:${STORAGE_VERSION}:total`,
} as const;

// Cache en memoria para evitar lecturas repetidas a localStorage (rule 7.5)
const storageCache = new Map<string, string | null>();

function safeGetItem(key: string): string | null {
  if (storageCache.has(key)) return storageCache.get(key)!;
  try {
    const value = window.localStorage.getItem(key);
    storageCache.set(key, value);
    return value;
  } catch {
    return null;
  }
}

function safeSetItem(key: string, value: string): void {
  try {
    window.localStorage.setItem(key, value);
    storageCache.set(key, value);
  } catch {
    // Ignora errores en modo incógnito o quota excedida
  }
}

function safeRemoveItem(key: string): void {
  try {
    window.localStorage.removeItem(key);
    storageCache.set(key, null);
  } catch {
    // Ignora errores
  }
}

// Generador simple de UUID v4 — RegExp hoisted a nivel de módulo (rule 7.9)
const UUID_PATTERN = /[xy]/g;
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(UUID_PATTERN, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

interface CartContextType {
  clienteTempId: string;
  carritoId: number | null;
  setCarritoId: (id: number | null) => void;
  itemCount: number;
  setItemCount: (count: number) => void;
  total: number;
  setTotal: (total: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// Exportar el contexto para uso directo
export { CartContext };

export function CartProvider({ children }: { children: ReactNode }) {
  // Lazy state initialization desde localStorage (rule 5.10)
  const [clienteTempId, setClienteTempId] = useState<string>(() => {
    const stored = safeGetItem(STORAGE_KEYS.clienteTempId);
    if (stored) return stored;
    const newId = generateUUID();
    safeSetItem(STORAGE_KEYS.clienteTempId, newId);
    return newId;
  });

  const [carritoId, setCarritoIdState] = useState<number | null>(() => {
    const stored = safeGetItem(STORAGE_KEYS.carritoId);
    return stored ? parseInt(stored, 10) : null;
  });

  const [itemCount, setItemCountState] = useState<number>(() => {
    const stored = safeGetItem(STORAGE_KEYS.itemCount);
    return stored ? parseInt(stored, 10) : 0;
  });

  const [total, setTotalState] = useState<number>(() => {
    const stored = safeGetItem(STORAGE_KEYS.total);
    return stored ? parseFloat(stored) : 0;
  });

  // Sincronizar con localStorage cuando haya cambios
  useEffect(() => {
    safeSetItem(STORAGE_KEYS.clienteTempId, clienteTempId);
  }, [clienteTempId]);

  useEffect(() => {
    if (carritoId !== null) {
      safeSetItem(STORAGE_KEYS.carritoId, carritoId.toString());
    } else {
      safeRemoveItem(STORAGE_KEYS.carritoId);
    }
  }, [carritoId]);

  useEffect(() => {
    safeSetItem(STORAGE_KEYS.itemCount, itemCount.toString());
  }, [itemCount]);

  useEffect(() => {
    safeSetItem(STORAGE_KEYS.total, total.toString());
  }, [total]);

  // Callbacks estables con functional setState (rule 5.9)
  const setCarritoId = useCallback((id: number | null) => {
    setCarritoIdState(id);
  }, []);

  const setItemCount = useCallback((count: number) => {
    setItemCountState(count);
  }, []);

  const setTotal = useCallback((newTotal: number) => {
    setTotalState(newTotal);
  }, []);

  const clearCart = useCallback(() => {
    setCarritoIdState(null);
    setItemCountState(0);
    setTotalState(0);
    safeRemoveItem(STORAGE_KEYS.carritoId);
    safeSetItem(STORAGE_KEYS.itemCount, '0');
    safeSetItem(STORAGE_KEYS.total, '0');
  }, []);

  const value: CartContextType = {
    clienteTempId,
    carritoId,
    setCarritoId,
    itemCount,
    setItemCount,
    total,
    setTotal,
    clearCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart debe usarse dentro de un CartProvider');
  }
  return context;
}
