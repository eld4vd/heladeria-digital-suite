'use client';

import { useCallback, useEffect, useId, useRef, useState, type ReactNode } from 'react';

function MissingThumbnail({ className }: { className: string }) {
  return <span className={className + ' admin-catalog-no-image'}><span aria-hidden="true">—</span><span className="sr-only">Sin foto</span></span>;
}

function ImageHover({ src, name, children }: { src: string; name: string; children: ReactNode }) {
  const id = useId();
  const trigger = useRef<HTMLButtonElement>(null);
  const preview = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [opened, setOpened] = useState(false);
  const [failed, setFailed] = useState(false);
  const [position, setPosition] = useState({ left: 0, top: 0, width: 280 });

  const cancelClose = useCallback(() => {
    if (closeTimer.current !== null) clearTimeout(closeTimer.current);
    closeTimer.current = null;
  }, []);
  const hide = useCallback(() => {
    cancelClose();
    if (preview.current?.matches(':popover-open')) preview.current.hidePopover();
  }, [cancelClose]);

  useEffect(() => cancelClose, [cancelClose]);
  useEffect(() => {
    if (!opened) return;
    // El cierre pasivo conserva el desplazamiento nativo de la tabla y de la página.
    window.addEventListener('scroll', hide, { capture: true, passive: true });
    window.addEventListener('resize', hide);
    window.addEventListener('blur', hide);
    return () => {
      window.removeEventListener('scroll', hide, true);
      window.removeEventListener('resize', hide);
      window.removeEventListener('blur', hide);
    };
  }, [opened, hide]);

  function positionPreview() {
    if (!trigger.current) return;
    const bounds = trigger.current.getBoundingClientRect();
    const margin = 12;
    const width = Math.max(24, Math.min(280, window.innerWidth - margin * 2, window.innerHeight - margin * 2 - 48));
    const height = width + 48;
    const right = bounds.right + 10;
    const left = right + width <= window.innerWidth - margin ? right : bounds.left - width - 10;
    setPosition({
      width,
      left: Math.max(margin, Math.min(left, window.innerWidth - width - margin)),
      top: Math.max(margin, Math.min(bounds.top + bounds.height / 2 - height / 2, window.innerHeight - height - margin)),
    });
  }
  function show() {
    cancelClose();
    if (!preview.current || preview.current.matches(':popover-open')) return;
    positionPreview();
    setFailed(false);
    preview.current.showPopover();
  }
  function scheduleClose() {
    cancelClose();
    // Permite cruzar el pequeño espacio entre la miniatura y la imagen ampliada.
    closeTimer.current = setTimeout(hide, 160);
  }

  return <>
    <button ref={trigger} type="button" popoverTarget={id} className="admin-catalog-image-trigger"
      aria-label={'Ver foto ampliada de ' + name} aria-expanded={opened} aria-controls={id} aria-describedby={opened ? id : undefined}
      onPointerEnter={event => { if (event.pointerType !== 'touch') show(); }}
      onPointerLeave={event => { if (event.pointerType !== 'touch') scheduleClose(); }}
      onFocus={event => { if (event.currentTarget.matches(':focus-visible')) show(); }}
      onBlur={hide}
      onClick={() => { cancelClose(); positionPreview(); setFailed(false); }}>
      {children}
    </button>
    <div ref={preview} id={id} popover="auto" role="tooltip" className="admin-catalog-image-popover"
      style={{ left: position.left, top: position.top, width: position.width, height: position.width + 48 }}
      onToggle={event => setOpened(event.currentTarget.matches(':popover-open'))}
      onPointerEnter={cancelClose} onPointerLeave={scheduleClose}>
      {opened && (failed ? <div className="admin-catalog-image-expanded admin-catalog-image-error">No se pudo cargar la foto.</div>
        : <img src={src} alt={'Foto ampliada de ' + name} width={280} height={280} decoding="async" className="admin-catalog-image-expanded" onError={() => setFailed(true)} />)}
      <p className="admin-catalog-image-caption">{name}</p>
    </div>
  </>;
}

function RemoteThumbnail({ src, className, size, preview, name }: { src: string; className: string; size: number; preview: boolean; name: string }) {
  const [failed, setFailed] = useState(false);
  if (failed) return <MissingThumbnail className={className} />;
  const image = <img src={src} alt="" width={size} height={size} loading="lazy" decoding="async" className={className} onError={() => setFailed(true)} />;
  return preview ? <ImageHover src={src} name={name}>{image}</ImageHover> : image;
}

export function CatalogThumbnail({ src, small = false, preview = false, name = 'helado' }: { src?: string | null; small?: boolean; preview?: boolean; name?: string }) {
  const className = 'admin-catalog-thumbnail' + (small ? ' admin-catalog-thumbnail-small' : '');
  return src ? <RemoteThumbnail key={src} src={src} className={className} size={small ? 32 : 48} preview={preview} name={name} /> : <MissingThumbnail className={className} />;
}
