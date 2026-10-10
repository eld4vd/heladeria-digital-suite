'use client';

import { createContext, useCallback, useContext, useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { api } from '@/lib/api';
import { PageLoading } from './PageLoading';
import type { Order, ShopSettings, User } from '@/lib/types';

export const AdminUserContext = createContext<User | null>(null);
export const useAdminUser = () => useContext(AdminUserContext);
export type ShopFormatting = { currency: string; locale: string; timezone?: string };
export const defaultFormatting: ShopFormatting = { currency: 'BOB', locale: 'es-BO', timezone: 'America/La_Paz' };
export const CurrencyContext = createContext<ShopFormatting>(defaultFormatting);
export const statusLabels: Record<Order['status'], string> = {
  PENDING_PAYMENT: 'Pago pendiente', CONFIRMED: 'Confirmado', DISPATCHED: 'Despachado', CANCELED: 'Cancelado',
};
export const methodLabels: Record<string, string> = { DEMO_CARD: 'Tarjeta · demo', DEMO_QR: 'QR · demo' };
export function formatMoney(value: number, currency = 'BOB', locale = 'es-BO') {
  try { return new Intl.NumberFormat(locale, { style: 'currency', currency }).format((value || 0) / 100); }
  catch { return new Intl.NumberFormat('es-BO', { style: 'currency', currency }).format((value || 0) / 100); }
}
export function Money({ value, currency }: { value: number; currency?: string }) {
  const current = useContext(CurrencyContext);
  return <>{formatMoney(value, currency || current.currency, current.locale)}</>;
}
export function dateLabel(value: string, formatting: ShopFormatting = defaultFormatting) {
  try { return new Date(value).toLocaleString(formatting.locale, { dateStyle: 'medium', timeStyle: 'short', timeZone: formatting.timezone || defaultFormatting.timezone }); }
  catch { return new Date(value).toLocaleString('es-BO', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'America/La_Paz' }); }
}
export function useDateLabel() { const formatting = useContext(CurrencyContext); return useCallback((value: string) => dateLabel(value, formatting), [formatting]); }
export function FormattingProvider({ initial, children }: { initial?: ShopFormatting; children: ReactNode }) {
  const { data, reload } = useResource<ShopSettings & { timezone?: string }>('/settings');
  useEffect(() => { const refresh = () => { void reload(); }; window.addEventListener('delicias:settings-changed', refresh); return () => window.removeEventListener('delicias:settings-changed', refresh); }, [reload]);
  const settings = data || initial || defaultFormatting;
  return <CurrencyContext.Provider value={{ currency: settings.currency, locale: settings.locale, timezone: settings.timezone || defaultFormatting.timezone }}>{children}</CurrencyContext.Provider>;
}
export function errorMessage(error: unknown) { return error instanceof Error ? error.message : 'No se pudo completar la operación. Inténtalo de nuevo.'; }
export function useResource<T>(path: string | null, pollMs = 0) {
  const [result, setResult] = useState<{ path: string; data: T | null; error: string } | null>(null);
  const active = useRef(false);
  const generation = useRef(0);
  const reload = useCallback(async () => {
    if (!path) return;
    const ticket = ++generation.current;
    try { const data = await api<T>(path); if (active.current && ticket === generation.current) setResult({ path, data, error: '' }); }
    catch (err) { if (active.current && ticket === generation.current) setResult(previous => ({ path, data: previous?.path === path ? previous.data : null, error: errorMessage(err) })); }
  }, [path]);
  useEffect(() => {
    if (!path) { active.current = false; generation.current += 1; return; }
    active.current = true; generation.current += 1; void reload();
    const onVisible = () => { if (document.visibilityState === 'visible') void reload(); };
    const timer = pollMs ? window.setInterval(() => { if (document.visibilityState === 'visible') void reload(); }, pollMs) : undefined;
    if (pollMs) document.addEventListener('visibilitychange', onVisible);
    return () => { active.current = false; generation.current += 1; if (timer) window.clearInterval(timer); document.removeEventListener('visibilitychange', onVisible); };
  }, [reload, pollMs, path]);
  return { data: path && result?.path === path ? result.data : null, error: path && result?.path === path ? result.error : '', loading: Boolean(path) && result?.path !== path, reload };
}
export function PageHeading({ title, description, actions }: { title: string; description: string; actions?: ReactNode }) {
  return <div className="admin-page-heading"><div><h1>{title}</h1><p>{description}</p></div>{actions && <div className="admin-heading-actions">{actions}</div>}</div>;
}
export function Feedback({ error, success }: { error?: string; success?: string }) {
  return <>{error && <p className="admin-alert admin-alert-error" role="alert">{error}</p>}{success && <output className="admin-alert admin-alert-success" aria-live="polite">{success}</output>}</>;
}
export function ResourceState({ loading, error, empty, onRetry, children }: { loading: boolean; error: string; empty?: boolean; onRetry: () => void; children: ReactNode }) {
  if (loading) return <PageLoading compact />;
  if (error) return <div className="admin-empty"><h2>No pudimos cargar esta sección</h2><p>{error}</p><button className="admin-button admin-button-secondary" onClick={onRetry}>Volver a intentar</button></div>;
  if (empty) return <div className="admin-empty"><span aria-hidden="true">◇</span><h2>Todavía no hay registros</h2><p>Los datos aparecerán aquí cuando empieces a operar.</p></div>;
  return <>{children}</>;
}
export function StatusBadge({ status }: { status: Order['status'] }) { return <span className={`admin-badge status-${status.toLowerCase()}`}>{statusLabels[status] || status}</span>; }
export function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  useEffect(() => {
    const element = dialog.current;
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const originalOverflow = document.body.style.overflow;
    element?.showModal();
    document.body.style.overflow = 'hidden';
    return () => {
      element?.close();
      document.body.style.overflow = originalOverflow;
      if (previous?.isConnected) previous.focus();
    };
  }, []);
  return <dialog ref={dialog} className="admin-modal" aria-labelledby={titleId}
    onCancel={event => { event.preventDefault(); onClose(); }}
    onPointerDown={event => {
      if (event.target !== event.currentTarget) return;
      const bounds = event.currentTarget.getBoundingClientRect();
      if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) onClose();
    }}>
    <div className="admin-modal-heading"><h2 id={titleId}>{title}</h2><button type="button" className="admin-icon-button" aria-label="Cerrar ventana" onClick={onClose}>×</button></div>
    {children}
  </dialog>;
}
export function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) { return <div className="admin-field"><label className="admin-control-label"><span>{label}</span>{children}</label>{hint && <small>{hint}</small>}</div>; }
export function StatCard({ label, value, hint, accent }: { label: string; value: ReactNode; hint?: string; accent?: boolean }) { return <div className={`admin-stat${accent ? ' admin-stat-accent' : ''}`}><p>{label}</p><strong>{value}</strong>{hint && <small>{hint}</small>}</div>; }
