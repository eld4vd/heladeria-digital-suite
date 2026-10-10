'use client';

import { useEffect, useRef, useSyncExternalStore, type ReactNode } from 'react';
import { useLandingMotion } from './LandingExperience';
import styles from './FloatingScene.module.css';

const PRECISE_POINTER = '(hover: hover) and (pointer: fine)';
const clamp = (value: number) => Math.max(-1, Math.min(1, value));
const serverPointer = () => false;
const readPointer = () => window.matchMedia(PRECISE_POINTER).matches;
function subscribePointer(notify: () => void) {
  const query = window.matchMedia(PRECISE_POINTER);
  query.addEventListener('change', notify);
  return () => query.removeEventListener('change', notify);
}

/** Un recorte sobre un plano de perspectiva superficial, no un modelo WebGL ni un contenedor de desplazamiento. */
export function FloatingScene({ children, label, variant = 'hero' }: {
  children?: ReactNode;
  label: string;
  variant?: 'hero' | 'story' | 'banner';
}) {
  const sceneRef = useRef<HTMLDivElement>(null);
  const layerRef = useRef<HTMLDivElement>(null);
  const enabled = useLandingMotion();
  const precisePointer = useSyncExternalStore(subscribePointer, readPointer, serverPointer);
  const hasImage = children != null;

  useEffect(() => {
    const scene = sceneRef.current;
    const layer = layerRef.current;
    if (!enabled || !precisePointer || !hasImage || !scene || !layer) return;

    let frame = 0;
    let lastTime = 0;
    let visible = true;
    let pointerInside = false;
    let pointerX = 0;
    let pointerY = 0;
    const current = { x: 0, y: 0, rx: 0, ry: 0 };

    const reset = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      lastTime = 0;
      Object.assign(current, { x: 0, y: 0, rx: 0, ry: 0 });
      layer.style.removeProperty('transform');
      delete scene.dataset.motion;
    };

    const draw = (time: number) => {
      frame = 0;
      if (!visible || document.hidden) return;
      // Lee el contenedor sin transformar antes de modificar la transformación de la capa de imagen.
      const rect = scene.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      if (!rect.width || !rect.height) return;
      const horizontal = pointerInside ? clamp((pointerX - rect.left) / rect.width * 2 - 1) : 0;
      const vertical = pointerInside ? clamp((pointerY - rect.top) / rect.height * 2 - 1) : 0;
      const progress = clamp((viewportHeight / 2 - rect.top - rect.height / 2) / (viewportHeight / 2 + rect.height / 2));
      const target = variant === 'banner'
        ? { x: horizontal * 4, y: progress * 12 + vertical * 3, rx: 0, ry: 0 }
        : { x: horizontal * 6, y: progress * 16 + vertical * 4, rx: -vertical * 3, ry: horizontal * 4 };
      const elapsed = lastTime ? Math.min(time - lastTime, 64) : 16.67;
      const easing = 1 - Math.pow(0.84, elapsed / 16.67);
      lastTime = time;
      let unsettled = false;
      for (const key of ['x', 'y', 'rx', 'ry'] as const) {
        const difference = target[key] - current[key];
        current[key] = Math.abs(difference) < 0.02 ? target[key] : current[key] + difference * easing;
        unsettled ||= Math.abs(difference) >= 0.02;
      }
      scene.dataset.motion = 'on';
      layer.style.transform = `translate3d(${current.x.toFixed(3)}px, ${current.y.toFixed(3)}px, 0) rotateX(${current.rx.toFixed(3)}deg) rotateY(${current.ry.toFixed(3)}deg)`;
      // Sin animación permanente: solo se ejecuta tras una interacción y hasta que se estabiliza la interpolación.
      if (unsettled) frame = requestAnimationFrame(draw);
      else lastTime = 0;
    };

    const schedule = () => {
      if (!frame && visible && !document.hidden) frame = requestAnimationFrame(draw);
    };
    const onPointer = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') return;
      pointerInside = true;
      pointerX = event.clientX;
      pointerY = event.clientY;
      schedule();
    };
    const onLeave = () => { pointerInside = false; schedule(); };
    const onVisibility = () => {
      if (document.hidden) { pointerInside = false; reset(); }
      else schedule();
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) schedule();
      else { pointerInside = false; reset(); }
    }, { rootMargin: '80px' });
    const resizeObserver = new ResizeObserver(schedule);
    observer.observe(scene);
    resizeObserver.observe(scene);
    scene.addEventListener('pointerenter', onPointer, { passive: true });
    scene.addEventListener('pointermove', onPointer, { passive: true });
    scene.addEventListener('pointerleave', onLeave, { passive: true });
    scene.addEventListener('pointercancel', onLeave, { passive: true });
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule, { passive: true });
    document.addEventListener('visibilitychange', onVisibility);
    schedule();

    return () => {
      observer.disconnect();
      resizeObserver.disconnect();
      scene.removeEventListener('pointerenter', onPointer);
      scene.removeEventListener('pointermove', onPointer);
      scene.removeEventListener('pointerleave', onLeave);
      scene.removeEventListener('pointercancel', onLeave);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      document.removeEventListener('visibilitychange', onVisibility);
      reset();
    };
  }, [enabled, precisePointer, hasImage, variant]);

  return (
    <div ref={sceneRef} className={styles.scene} data-variant={variant}>
      <span className={styles.groundShadow} aria-hidden="true" />
      <div ref={layerRef} className={styles.layer}>
        {hasImage ? children : (
          <div className={styles.placeholder}>
            <span>Tu imagen aquí</span>
            <small>Recorte transparente · PNG o WebP</small>
            <span className="sr-only">{label}</span>
          </div>
        )}
      </div>
    </div>
  );
}
