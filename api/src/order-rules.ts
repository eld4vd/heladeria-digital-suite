import { BadRequestException, ConflictException } from '@nestjs/common';
import { OrderStatus } from './contracts';
import { OrderItemDto } from './dto';
import { hash } from './security';

export type QuoteExtra = { id: string; name: string; priceMinor: number; active: boolean };
export type QuotePresentation = { id: string; name: string; priceMinor: number; stock: number; active: boolean; product: { name: string; flavor: { id: string; name: string } | null; active: boolean; category: { active: boolean } } };
export function groupedQuantities(items: { presentationId: string; quantity: number }[]) {
  const grouped = new Map<string, number>();
  for (const item of items) grouped.set(item.presentationId, (grouped.get(item.presentationId) ?? 0) + item.quantity);
  return [...grouped.entries()].sort(([a], [b]) => a.localeCompare(b));
}
export function quoteItems(items: OrderItemDto[], presentations: QuotePresentation[], availableExtras: QuoteExtra[]) {
  if (!items.length) throw new BadRequestException('El pedido necesita al menos un helado.');
  const byId = new Map(presentations.map((p) => [p.id, p]));
  const extraMap = new Map(availableExtras.filter(extra => extra.active).map(extra => [extra.id, extra]));
  for (const [id, quantity] of groupedQuantities(items)) {
    const p = byId.get(id);
    if (!p || !p.active || !p.product.active || !p.product.category.active) throw new ConflictException('Una presentación ya no está disponible.');
    if (quantity > p.stock) throw new ConflictException(`Stock insuficiente para ${p.product.name}, ${p.name}.`);
  }
  return items.map((item) => {
    const p = byId.get(item.presentationId)!;
    if (!Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 50) throw new BadRequestException('Cantidad inválida.');
    if (new Set(item.extraIds).size !== item.extraIds.length) throw new BadRequestException('No repitas extras.');
    if (item.extraIds.some((id) => !extraMap.has(id))) throw new BadRequestException('Un extra seleccionado ya no está disponible.');
    const extras = item.extraIds.map((id) => ({ name: extraMap.get(id)!.name, priceMinor: extraMap.get(id)!.priceMinor }));
    const unitPriceMinor = p.priceMinor + extras.reduce((sum, e) => sum + e.priceMinor, 0);
    // El sabor pertenece a la receta. Nunca se obtiene de selecciones del navegador.
    const flavor = p.product.flavor;
    return { presentationId: p.id, productName: p.product.name, presentationName: p.name, quantity: item.quantity, unitPriceMinor, totalMinor: unitPriceMinor * item.quantity, flavorIds: flavor ? [flavor.id] : [], extraIds: item.extraIds, flavors: flavor ? [flavor.name] : [], extras };
  });
}
const transitions: Record<OrderStatus, OrderStatus[]> = {
  PENDING_PAYMENT: ['CANCELED'], CONFIRMED: ['DISPATCHED', 'CANCELED'], DISPATCHED: [], CANCELED: [],
};
export function assertTransition(from: OrderStatus, to: OrderStatus) {
  if (!transitions[from].includes(to)) throw new ConflictException(`No se permite cambiar de ${from} a ${to}.`);
}
export function inputHash(value: unknown): string {
  const canonical = (input: unknown): unknown => Array.isArray(input) ? input.map(canonical) : input && typeof input === 'object' ? Object.fromEntries(Object.entries(input as Record<string, unknown>).filter(([, v]) => v !== undefined).sort(([a], [b]) => a.localeCompare(b)).map(([k, v]) => [k, canonical(v)])) : input;
  return hash(JSON.stringify(canonical(value)));
}
export function requireKey(key?: string) {
  if (!key || !/^[a-zA-Z0-9_-]{8,128}$/.test(key)) throw new BadRequestException('Envía una clave Idempotency-Key válida.');
  return key;
}
