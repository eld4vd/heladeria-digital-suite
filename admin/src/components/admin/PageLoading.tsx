import { BrandLogo } from '@/components/brand/BrandLogo';

/** Compartido entre Suspense de las rutas y las solicitudes del cliente, sin inventar datos del panel. */
export function PageLoading({ compact = false, message = 'Cargando información…' }: { compact?: boolean; message?: string }) {
  return (
    <section className={`min-w-0 rounded-3xl border border-admin-line bg-admin-surface shadow-neu ${compact ? 'p-5 sm:p-6' : 'p-6 sm:p-8'}`}>
      <div className="flex flex-wrap items-center gap-4 sm:gap-5">
        <span aria-hidden="true" className={`grid shrink-0 place-items-center rounded-2xl border border-admin-pink-300/70 bg-admin-pink-100 shadow-neu-pink ${compact ? 'size-12 p-2' : 'size-16 p-3'}`}>
          <BrandLogo alt="" className="w-full" sizes={compact ? '32px' : '40px'} eager />
        </span>
        <div className="min-w-0 flex-1">
          <output aria-live="polite" aria-atomic="true" className={`block font-semibold text-admin-ink ${compact ? 'text-sm' : 'text-lg sm:text-xl'}`}>{message}</output>
          {!compact && <p className="mt-2 mb-0 max-w-[42ch] text-sm leading-7 text-admin-muted">El contenido aparecerá en cuanto termine la carga.</p>}
        </div>
        <span aria-hidden="true" className="admin-route-dots"><span /><span /><span /></span>
      </div>
      {!compact && <div aria-hidden="true" className="admin-route-skeleton mt-8">
        <div className="mb-6 h-3 w-2/5 rounded-lg bg-admin-line" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[0, 1, 2].map((item) => <div key={item} className="rounded-2xl border border-white bg-admin-surface p-5 shadow-neu-inset"><div className="h-2.5 w-3/4 rounded bg-admin-line" /><div className="mt-5 h-5 w-1/2 rounded-md bg-admin-pink-200/70" /></div>)}
        </div>
        <div className="mt-6 overflow-hidden rounded-2xl border border-admin-line p-4 sm:p-5">
          {[0, 1, 2].map((row) => <div key={row} className="flex items-center gap-4 border-b border-admin-line py-4 last:border-0"><span className="size-8 shrink-0 rounded-lg bg-admin-pink-100" /><span className="h-2.5 w-2/5 rounded bg-admin-line" /><span className="ml-auto h-2.5 w-1/5 rounded bg-admin-line" /></div>)}
        </div>
      </div>}
    </section>
  );
}
