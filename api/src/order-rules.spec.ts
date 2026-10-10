import { assertTransition, groupedQuantities, inputHash, quoteItems, QuoteExtra, QuotePresentation, requireKey } from './order-rules';

const presentation: QuotePresentation = { id: 'presentation-1', name: 'Mediano', priceMinor: 2000, stock: 4, active: true, product: { name: 'Helado', flavor: { id: 'flavor-1', name: 'Pistacho' }, active: true, category: { active: true } } };
const extras: QuoteExtra[] = [{ id: 'extra-1', name: 'Cookies', priceMinor: 300, active: true }];
const item = { presentationId: presentation.id, quantity: 2, extraIds: ['extra-1'] };
describe('Reglas del ecommerce', () => {
  it('calcula extras una vez por unidad y conserva nombres/precios del snapshot', () => {
    expect(quoteItems([item], [presentation], extras)[0]).toMatchObject({ unitPriceMinor: 2300, totalMinor: 4600, flavors: ['Pistacho'], extras: [{ name: 'Cookies', priceMinor: 300 }], flavorIds: ['flavor-1'] });
    expect(quoteItems([{ ...item, extraIds: [] }], [presentation], extras)[0]).toMatchObject({ unitPriceMinor: 2000, totalMinor: 4000, extras: [] });
  });
  it('agrupa una presentación aunque sus extras sean distintos', () => {
    expect(groupedQuantities([{ presentationId: 'b', quantity: 2 }, { presentationId: 'a', quantity: 1 }, { presentationId: 'b', quantity: 3 }])).toEqual([['a', 1], ['b', 5]]);
    expect(() => quoteItems([item, { ...item, quantity: 3, extraIds: [] }], [presentation], extras)).toThrow('Stock insuficiente');
  });
  it('rechaza extras inválidos, desactivados o repetidos', () => {
    expect(() => quoteItems([{ ...item, extraIds: ['unknown'] }], [presentation], extras)).toThrow();
    expect(() => quoteItems([item], [presentation], [{ ...extras[0], active: false }])).toThrow();
    expect(() => quoteItems([{ ...item, extraIds: ['extra-1', 'extra-1'] }], [presentation], extras)).toThrow();
    expect(() => quoteItems([item], [{ ...presentation, product: { ...presentation.product, category: { active: false } } }], extras)).toThrow();
  });
  it('usa el sabor fijo del servidor e ignora una selección antigua del navegador', () => {
    expect(quoteItems([{ ...item, flavorIds: ['otro-sabor'] }], [presentation], extras)[0]).toMatchObject({ flavors: ['Pistacho'], flavorIds: ['flavor-1'], unitPriceMinor: 2300 });
    expect(quoteItems([item], [{ ...presentation, product: { ...presentation.product, flavor: null } }], extras)[0]).toMatchObject({ flavors: [], flavorIds: [] });
  });
  it('permite despachar confirmados y cancelar antes del despacho, sin confirmar manualmente', () => {
    expect(() => assertTransition('CONFIRMED', 'DISPATCHED')).not.toThrow();
    expect(() => assertTransition('CONFIRMED', 'CANCELED')).not.toThrow();
    expect(() => assertTransition('PENDING_PAYMENT', 'CANCELED')).not.toThrow();
    expect(() => assertTransition('DISPATCHED', 'CANCELED')).toThrow();
    expect(() => assertTransition('PENDING_PAYMENT', 'CONFIRMED')).toThrow();
    expect(() => assertTransition('PENDING_PAYMENT', 'DISPATCHED')).toThrow();
    expect(() => assertTransition('DISPATCHED', 'CONFIRMED')).toThrow();
  });
  it('normaliza claves JSON sin ignorar cambios reales del pedido', () => {
    expect(inputHash({ a: 1, b: 2 })).toBe(inputHash({ b: 2, a: 1 }));
    expect(inputHash({ a: 2, b: 2 })).not.toBe(inputHash({ a: 1, b: 2 }));
    expect(() => requireKey('bad')).toThrow();
    expect(requireKey('key_12345678')).toBe('key_12345678');
  });
});
