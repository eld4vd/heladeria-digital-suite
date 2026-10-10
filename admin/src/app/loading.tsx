import { PageLoading } from '@/components/admin/PageLoading';

export default function Loading() {
  return <main id="contenido" className="grid min-h-svh place-items-center px-5 py-10"><div className="w-full max-w-2xl"><PageLoading message="Preparando el panel…" /></div></main>;
}
