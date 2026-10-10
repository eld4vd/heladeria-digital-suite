'use client';

import { useEffect, useId, useState } from 'react';

function previewSource(value: string) {
  if (!value || value.length > 1500) return '';
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'https:' && !parsed.username && !parsed.password ? parsed.href : '';
  } catch { return ''; }
}

function RemoteImagePreview({ src, alt }: { src: string; alt: string }) {
  const [requested, setRequested] = useState(false);
  const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>('loading');

  useEffect(() => {
    // Evita solicitar URL incompletas con cada pulsación. Una URL nueva vuelve a montar este componente.
    const timer = window.setTimeout(() => setRequested(true), 300);
    return () => window.clearTimeout(timer);
  }, []);

  return <>
    {requested && status !== 'error' && <img
      src={src} alt={alt} width={480} height={208} decoding="async" referrerPolicy="no-referrer"
      className={'admin-image-preview-image' + (status === 'loaded' ? '' : ' invisible')}
      onLoad={() => setStatus('loaded')} onError={() => setStatus('error')}
    />}
    <output aria-live="polite" aria-atomic="true" className={status === 'loaded' ? 'sr-only' : 'admin-image-preview-message'}>
      {status === 'loading' ? <><span className="admin-spinner" aria-hidden="true" /><span>Cargando imagen…</span></>
        : status === 'error' ? 'No pudimos cargar la imagen. Revisa que la URL sea pública y apunte directamente a una imagen.'
          : 'Imagen cargada. Vista previa disponible.'}
    </output>
  </>;
}

export function ImagePreview({ url, alt }: { url: string; alt: string }) {
  const captionId = useId();
  const value = url.trim();
  const src = previewSource(value);

  return <figure className="admin-image-preview" aria-labelledby={captionId}>
    <figcaption id={captionId}>Vista previa</figcaption>
    <div className="admin-image-preview-frame">
      {src ? <RemoteImagePreview key={src} src={src} alt={alt} />
        : <output className="admin-image-preview-message" aria-live="polite">
          {value ? 'Usa una URL HTTPS válida para ver la imagen.' : 'Pega la URL de tu imagen para verla aquí antes de guardar.'}
        </output>}
    </div>
  </figure>;
}
