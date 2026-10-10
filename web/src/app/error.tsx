'use client';

import Link from 'next/link';

export default function ErrorPage({ retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return <section className="container section" style={{ textAlign: 'center' }}><span className="eyebrow">Un pequeño contratiempo</span><h1 style={{ fontSize: 'clamp(2rem, 5vw, 4rem)', fontWeight: 400 }}>Algo no salió como esperábamos.</h1><p className="muted">Tu antojo merece otro intento. Vuelve a cargar la página o descubre nuestro catálogo.</p><div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '1rem', marginTop: '2rem' }}><button className="button" onClick={retry}>Volver a intentar</button><Link className="button button-secondary" href="/catalogo">Ver catálogo</Link></div></section>;
}
