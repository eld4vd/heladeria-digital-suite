import Link from 'next/link';
import { BrandLogo } from '@/components/brand/BrandLogo';

export default function NotFound() {
  return <main id="contenido" className="grid min-h-svh place-items-center bg-admin-canvas px-5 py-10 text-admin-ink">
    <section aria-labelledby="titulo-no-encontrado" className="w-full max-w-xl rounded-3xl border border-admin-line bg-admin-surface p-6 text-center shadow-neu sm:p-12">
      <BrandLogo className="mx-auto mb-6 w-14" sizes="56px" eager />
      <p className="mx-auto mb-8 inline-flex items-center rounded-full border border-admin-line px-4 py-1.5 text-sm font-semibold text-admin-muted">Error 404</p>
      <div aria-hidden="true" className="mb-8 flex items-center justify-center gap-3 text-[clamp(5rem,16vw,8rem)] leading-none font-bold tracking-tight">
        <span>4</span><span className="grid size-24 place-items-center rounded-full border border-admin-pink-300 bg-admin-pink-100 text-[4rem] text-admin-pink-800 shadow-neu-pink sm:size-32 sm:text-[5.5rem]">0</span><span>4</span>
      </div>
      <h1 id="titulo-no-encontrado" className="m-0 text-4xl font-bold tracking-tight sm:text-5xl">Oops!</h1>
      <p className="mt-4 mb-3 text-lg font-semibold">No encontramos esta sección.</p>
      <p className="mx-auto mt-0 mb-8 max-w-[40ch] text-sm leading-7 text-admin-muted">La dirección no existe o ha cambiado. Vuelve al resumen del panel o inicia sesión para continuar.</p>
      <div className="flex flex-col items-center gap-3">
        <Link href="/" className="inline-flex min-h-12 w-full items-center justify-center rounded-xl border border-admin-pink-600 bg-admin-pink-200 px-6 py-3 font-semibold text-admin-ink shadow-neu-pink hover:bg-admin-pink-100 sm:w-auto">Volver al resumen</Link>
        <Link href="/login" className="inline-flex min-h-11 items-center px-3 py-2 font-semibold text-admin-pink-800 underline hover:text-admin-ink">Ir al inicio de sesión</Link>
      </div>
    </section>
  </main>;
}
