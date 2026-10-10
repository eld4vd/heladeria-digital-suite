'use client';

import Link from 'next/link';

export default function ErrorPage({ retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return <section className="admin-empty" role="alert"><h1>No pudimos cargar esta sección</h1><p>Comprueba que la API esté disponible y vuelve a intentarlo.</p><button className="admin-button" onClick={retry}>Volver a intentar</button><p><Link className="admin-text-button" href="/">Volver al resumen</Link></p></section>;
}
