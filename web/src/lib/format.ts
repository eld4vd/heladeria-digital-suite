import type { OrderStatus } from './types';
export function money(minor: number, currency = 'BOB', locale = 'es-BO') {
  return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(minor / 100);
}
export const statusLabels: Record<OrderStatus, string> = {
  PENDING_PAYMENT: 'Pendiente de pago', CONFIRMED: 'Confirmado', DISPATCHED: 'Despachado', CANCELED: 'Cancelado'
};
export function formatDate(value: string) {
  return new Intl.DateTimeFormat('es-BO', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'America/La_Paz' }).format(new Date(value));
}
