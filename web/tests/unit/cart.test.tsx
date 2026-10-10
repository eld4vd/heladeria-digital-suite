import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { ReactNode } from 'react';
import { CartProvider, useCart } from '@/lib/cart';
import type { CartItem } from '@/lib/types';

const selection: CartItem = { key: 'presentacion:vainilla', productId: 'helado', productName: 'Helado', productSlug: 'helado', imageUrl: '', presentationId: 'presentacion', presentationName: 'Pequeño', quantity: 1, unitPriceMinor: 1800, flavorIds: ['vainilla'], flavorNames: ['Vainilla'], extraIds: [], extras: [] };
const wrapper = ({ children }: { children: ReactNode }) => <CartProvider>{children}</CartProvider>;
function mount() {
  const hook = renderHook(useCart, { wrapper });
  act(() => { hook.result.current.clearCart(); hook.result.current.clearBuyNow(); });
  return hook;
}

describe('carrito persistente', () => {
  it('combina selecciones iguales y permite cambiar o quitar cantidades', () => {
    const { result } = mount();
    act(() => { result.current.addItem(selection); result.current.addItem(selection); });
    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].quantity).toBe(2);
    act(() => result.current.updateQuantity(selection.key, 3));
    expect(JSON.parse(localStorage.getItem('delicias:cart:v1') || '[]')[0].quantity).toBe(3);
    act(() => result.current.removeItem(selection.key));
    expect(result.current.items).toHaveLength(0);
  });

  it('comprar ahora mantiene el carrito independiente', () => {
    const { result } = mount();
    act(() => { result.current.addItem(selection); result.current.buyNow({ ...selection, key: 'otra', productName: 'Compra directa' }); });
    expect(result.current.items[0].productName).toBe('Helado');
    expect(result.current.buyNowItem?.productName).toBe('Compra directa');
    act(() => result.current.clearBuyNow());
    expect(result.current.items).toHaveLength(1);
    expect(result.current.buyNowItem).toBeNull();
  });

  it('limita cantidades y persiste solo selecciones, nunca datos personales', () => {
    const { result } = mount();
    act(() => result.current.addItem({ ...selection, quantity: 900, customerName: 'Dato personal', email: 'privado@example.test', phone: '77123456' } as CartItem));
    expect(result.current.items[0].quantity).toBe(50);
    const saved = localStorage.getItem('delicias:cart:v1') || '';
    expect(saved).not.toContain('Dato personal');
    expect(saved).not.toContain('privado@example.test');
    expect(saved).not.toContain('77123456');
  });

  it('rechaza la combinación 51 sin alterar el carrito y permite combinar una existente', () => {
    const { result } = mount();
    act(() => { for (let index = 0; index < 50; index++) expect(result.current.addItem({ ...selection, key: `selection-${index}` })).toBe(true); });
    let accepted = true;
    act(() => { accepted = result.current.addItem({ ...selection, key: 'selection-51' }); });
    expect(accepted).toBe(false);
    expect(result.current.items).toHaveLength(50);
    expect(result.current.items.some(item => item.key === 'selection-51')).toBe(false);
    act(() => { accepted = result.current.addItem({ ...selection, key: 'selection-0' }); });
    expect(accepted).toBe(true);
    expect(result.current.items[0].quantity).toBe(2);
    expect(JSON.parse(localStorage.getItem('delicias:cart:v1') || '[]')).toHaveLength(50);
  });

  it('sanea selecciones guardadas al máximo de 50 líneas, 10 sabores y 20 extras', () => {
    const { result } = mount();
    const oversized = { ...selection, flavorIds: Array.from({ length: 15 }, (_, index) => `flavor-${index}`), flavorNames: Array.from({ length: 15 }, (_, index) => `Sabor ${index}`), extraIds: Array.from({ length: 30 }, (_, index) => `extra-${index}`), extras: Array.from({ length: 30 }, (_, index) => ({ name: `Extra ${index}`, priceMinor: 100 })) };
    localStorage.setItem('delicias:cart:v1', JSON.stringify(Array.from({ length: 60 }, (_, index) => ({ ...oversized, key: `saved-${index}` }))));
    act(() => { window.dispatchEvent(new StorageEvent('storage', { key: 'delicias:cart:v1' })); });
    expect(result.current.items).toHaveLength(50);
    expect(result.current.items[0].flavorIds).toHaveLength(10);
    expect(result.current.items[0].flavorNames).toHaveLength(10);
    expect(result.current.items[0].extraIds).toHaveLength(20);
    expect(result.current.items[0].extras).toHaveLength(20);
    act(() => result.current.updateQuantity('saved-0', 2));
    expect(JSON.parse(localStorage.getItem('delicias:cart:v1') || '[]')).toHaveLength(50);
  });
});
