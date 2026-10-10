'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { useLandingMotion } from './LandingExperience';

const PRECISE_POINTER = '(hover: hover) and (pointer: fine)';

/** Efecto de profundidad fotográfica, no un modelo 3D. Los puntos de apoyo permanecen sobre el suelo. */
export function GroundedScene({ children, className }: { children: ReactNode; className: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const enabled = useLandingMotion();

  useEffect(() => {
    const scene = ref.current;
    if (!scene || !enabled) return;

    const pointer = window.matchMedia(PRECISE_POINTER);
    let frame = 0;
    let clientX = 0;
    let clientY = 0;

    const reset = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      scene.style.removeProperty('--stage-yaw');
      scene.style.removeProperty('--stage-pitch');
      scene.style.removeProperty('--cast-shift');
    };

    const draw = () => {
      frame = 0;
      const bounds = scene.getBoundingClientRect();
      if (!bounds.width || !bounds.height) return;
      const x = Math.max(-1, Math.min(1, (clientX - bounds.left) / bounds.width * 2 - 1));
      const y = Math.max(-1, Math.min(1, (clientY - bounds.top) / bounds.height * 2 - 1));
      scene.style.setProperty('--stage-yaw', `${x * 5}deg`);
      scene.style.setProperty('--stage-pitch', `${-y * 1.5}deg`);
      scene.style.setProperty('--cast-shift', `${x * 4}px`);
    };

    const move = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse' || !pointer.matches || document.hidden) return;
      clientX = event.clientX;
      clientY = event.clientY;
      // Agrupa los eventos del puntero en un repintado, sin bucles permanentes ni renderizados de React.
      if (!frame) frame = requestAnimationFrame(draw);
    };

    scene.addEventListener('pointermove', move, { passive: true });
    scene.addEventListener('pointerleave', reset);
    scene.addEventListener('pointercancel', reset);
    pointer.addEventListener('change', reset);
    document.addEventListener('visibilitychange', reset);

    return () => {
      scene.removeEventListener('pointermove', move);
      scene.removeEventListener('pointerleave', reset);
      scene.removeEventListener('pointercancel', reset);
      pointer.removeEventListener('change', reset);
      document.removeEventListener('visibilitychange', reset);
      reset();
    };
  }, [enabled]);

  return <div ref={ref} className={className}>{children}</div>;
}
