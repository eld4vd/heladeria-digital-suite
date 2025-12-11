import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

// Generador simple de UUID v4
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
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
  const isBrowser = typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

  const [clienteTempId, setClienteTempId] = useState<string>(() => generateUUID());
  const [carritoId, setCarritoIdState] = useState<number | null>(null);
  const [itemCount, setItemCountState] = useState<number>(0);
  const [total, setTotalState] = useState<number>(0);

  // Inicializar estado desde localStorage en cliente
  useEffect(() => {
    if (!isBrowser) return;

    setClienteTempId((current) => {
      const stored = window.localStorage.getItem('clienteTempId');
      if (stored) return stored;
      const newId = current || generateUUID();
      window.localStorage.setItem('clienteTempId', newId);
      return newId;
    });

    const storedCarritoId = window.localStorage.getItem('carritoId');
    setCarritoIdState(storedCarritoId ? parseInt(storedCarritoId, 10) : null);

    const storedItemCount = window.localStorage.getItem('carritoItemCount');
    setItemCountState(storedItemCount ? parseInt(storedItemCount, 10) : 0);

    const storedTotal = window.localStorage.getItem('carritoTotal');
    setTotalState(storedTotal ? parseFloat(storedTotal) : 0);
  }, [isBrowser]);

  // Sincronizar con localStorage cuando haya cambios (sólo en cliente)
  useEffect(() => {
    if (!isBrowser) return;
    if (carritoId !== null) {
      window.localStorage.setItem('carritoId', carritoId.toString());
    } else {
      window.localStorage.removeItem('carritoId');
    }
  }, [carritoId, isBrowser]);

  useEffect(() => {
    if (!isBrowser) return;
    window.localStorage.setItem('carritoItemCount', itemCount.toString());
  }, [itemCount, isBrowser]);

  useEffect(() => {
    if (!isBrowser) return;
    window.localStorage.setItem('carritoTotal', total.toString());
  }, [total, isBrowser]);

  const setCarritoId = (id: number | null) => {
    setCarritoIdState(id);
  };

  const setItemCount = (count: number) => {
    setItemCountState(count);
  };

  const setTotal = (newTotal: number) => {
    setTotalState(newTotal);
  };

  const clearCart = () => {
    setCarritoIdState(null);
    setItemCountState(0);
    setTotalState(0);
    if (isBrowser) {
      window.localStorage.removeItem('carritoId');
      window.localStorage.setItem('carritoItemCount', '0');
      window.localStorage.setItem('carritoTotal', '0');
    }
  };

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
