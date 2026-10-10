import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Order, Product, ShopSettings } from '@/lib/types';
import { ApiError } from '@/lib/api';
import { ProductConfigurator } from './ProductConfigurator';
import { CatalogBrowser } from './CatalogBrowser';
import { DemoPayment } from './DemoPayment';

const mocks = vi.hoisted(() => ({ addItem: vi.fn(), buyNow: vi.fn(), push: vi.fn(), api: vi.fn() }));
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mocks.push }),
  useSearchParams: () => new URLSearchParams(window.location.search),
}));
vi.mock('@/lib/cart', () => ({ useCart: () => ({ addItem: mocks.addItem, buyNow: mocks.buyNow, hydrated: true }) }));
vi.mock('@/lib/api', async (importOriginal) => ({
  ...await importOriginal<typeof import('@/lib/api')>(),
  api: mocks.api,
}));

const settings = { name: 'Delicias', description: 'Helados para compartir', currency: 'BOB', locale: 'es-BO', address: 'Plaza 25 de Mayo', city: 'Sucre', phone: '+591 70000000', email: 'hola@example.com', hours: '10:00 a 21:00', coverageText: 'Zona urbana de Sucre', deliveryFeeMinor: 1000, deliveryEnabled: true } satisfies ShopSettings;
const product = {
  id: 'product-1', slug: 'copa-delicias', name: 'Copa Delicias', description: 'Helado cremoso de la casa', flavorId: 'flavor-1', flavor: 'Chocolate', imageUrl: '/placeholder-ice-cream.jpg', active: true, featured: true, categoryId: 'category-1', category: { id: 'category-1', slug: 'copas', name: 'Copas' },
  presentations: [{ id: 'presentation-1', name: 'Mediana', priceMinor: 2500, stock: 5, active: true }],
  extras: [{ id: 'extra-1', name: 'Almendras', priceMinor: 300, active: true }],
} satisfies Product;

beforeEach(() => {
  vi.clearAllMocks();
  mocks.addItem.mockReturnValue(true);
  window.history.replaceState(null, '', '/');
});

describe('Configuración de helados', () => {
  it('compra el sabor fijo del helado sin pedir elegirlo nuevamente', () => {
    render(<ProductConfigurator product={product} settings={settings} />);
    expect(screen.getByText('Chocolate')).toBeTruthy();
    expect(screen.queryByRole('checkbox', { name: /chocolate/i })).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: /añadir al carrito/i }));
    expect(screen.queryByRole('alert')).toBeNull();
    expect(mocks.addItem).toHaveBeenCalledWith(expect.objectContaining({ quantity: 1, unitPriceMinor: 2500, flavorIds: ['flavor-1'], flavorNames: ['Chocolate'], extraIds: [] }));
  });

  it('añade los extras elegidos por el cliente al precio de cada helado', () => {
    render(<ProductConfigurator product={product} settings={settings} />);
    fireEvent.click(screen.getByText('Un toque extra'));
    fireEvent.click(screen.getByLabelText(/Almendras/));
    fireEvent.click(screen.getByRole('button', { name: /aumentar cantidad/i }));
    fireEvent.click(screen.getByRole('button', { name: /añadir al carrito/i }));
    expect(mocks.addItem).toHaveBeenCalledWith(expect.objectContaining({ quantity: 2, unitPriceMinor: 2800, flavorIds: ['flavor-1'], flavorNames: ['Chocolate'], extraIds: ['extra-1'], extras: [{ name: 'Almendras', priceMinor: 300 }] }));
  });

  it('comprar ahora usa una selección separada, sin añadir al carrito habitual', () => {
    render(<ProductConfigurator product={product} settings={settings} />);
    fireEvent.click(screen.getByRole('button', { name: /comprar ahora/i }));
    expect(mocks.buyNow).toHaveBeenCalledWith(expect.objectContaining({ presentationId: 'presentation-1', flavorIds: ['flavor-1'], flavorNames: ['Chocolate'], extraIds: [] }));
    expect(mocks.addItem).not.toHaveBeenCalled();
    expect(mocks.push).toHaveBeenCalledWith('/checkout?mode=direct');
  });

  it('no muestra éxito si el carrito está lleno', () => {
    mocks.addItem.mockReturnValue(false);
    render(<ProductConfigurator product={product} settings={settings} />);
    fireEvent.click(screen.getByRole('button', { name: /añadir al carrito/i }));
    expect(screen.getByRole('alert').textContent).toMatch(/carrito está lleno/i);
    expect(screen.queryByText(/tu helado ya está en el carrito/i)).toBeNull();
  });

  it('limita los extras a 20 y permite desmarcar una opción para elegir otra', () => {
    const manyExtras = Array.from({ length: 21 }, (_, index) => ({ id: `extra-${index}`, name: `Extra ${index + 1}`, priceMinor: 100, active: true }));
    render(<ProductConfigurator product={{ ...product, extras: manyExtras }} settings={settings} />);
    fireEvent.click(screen.getByText('Un toque extra'));
    for (let index = 1; index <= 20; index++) fireEvent.click(screen.getByLabelText(new RegExp(`^Extra ${index}\\b`)));
    expect((screen.getByLabelText(/^Extra 21\b/) as HTMLInputElement).disabled).toBe(true);
    expect((screen.getByLabelText(/^Extra 1\b/) as HTMLInputElement).disabled).toBe(false);
    fireEvent.click(screen.getByLabelText(/^Extra 1\b/));
    expect((screen.getByLabelText(/^Extra 21\b/) as HTMLInputElement).disabled).toBe(false);
  });
});

describe('Catálogo', () => {
  it('filtra por texto y muestra una salida útil si no hay coincidencias', () => {
    const catalog = () => <CatalogBrowser products={[product]} categories={[product.category]} currency="BOB" locale="es-BO" />;
    const { rerender } = render(catalog());
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'mango' } });
    // El simulador de navegación no se suscribe al enrutador de Next; expone explícitamente la URL actualizada.
    rerender(catalog());
    expect(screen.queryByRole('heading', { name: 'Copa Delicias' })).toBeNull();
    expect(screen.getByRole('heading', { name: /ese antojo aún no aparece/i })).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Quitar filtros' }));
    rerender(catalog());
    expect(screen.getByRole('heading', { name: 'Copa Delicias' })).toBeTruthy();
  });
});

describe('Pago de demostración', () => {
  it('permite retomar el mismo pedido y la compra directa después de iniciar sesión', async () => {
    const order = { id: 'order-1', code: 'DEL-001', status: 'PENDING_PAYMENT', totalMinor: 3500, payments: [] } as unknown as Order;
    const resumeHref = '/checkout?order=order-1&mode=direct';
    mocks.api.mockRejectedValue(new ApiError('Inicia sesión para continuar.', 401));
    const update = vi.fn();
    render(<DemoPayment order={order} onUpdate={update} resumeHref={resumeHref} />);
    fireEvent.click(screen.getByRole('button', { name: /simular pago aprobado/i }));
    const login = await screen.findByRole('link', { name: /inicia sesión con la misma cuenta/i });
    expect(login.getAttribute('href')).toBe(`/login?next=${encodeURIComponent(resumeHref)}`);
    expect((screen.getByRole('button', { name: /simular pago aprobado/i }) as HTMLButtonElement).disabled).toBe(true);
    expect((screen.getByRole('button', { name: /simular rechazo/i }) as HTMLButtonElement).disabled).toBe(true);
    expect(update).not.toHaveBeenCalled();
  });

  it('no solicita datos bancarios y envía un intento idempotente', async () => {
    const order = { id: 'order-1', code: 'DEL-001', status: 'PENDING_PAYMENT', totalMinor: 3500, payments: [] } as unknown as Order;
    const approved = { ...order, status: 'CONFIRMED' } as Order;
    mocks.api.mockResolvedValue(approved);
    const update = vi.fn();
    render(<DemoPayment order={order} onUpdate={update} />);
    expect(screen.queryByRole('textbox')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: /simular pago aprobado/i }));
    await waitFor(() => expect(update).toHaveBeenCalledWith(approved));
    expect(mocks.api).toHaveBeenCalledWith('/orders/order-1/payments', expect.objectContaining({ method: 'POST', body: { method: 'DEMO_CARD', scenario: 'APPROVED' }, idempotencyKey: expect.any(String) }));
  });
});
