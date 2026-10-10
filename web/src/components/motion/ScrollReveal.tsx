'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { useLandingMotion } from './LandingExperience';
import styles from './ScrollReveal.module.css';

/** Una sola entrada para las imágenes editoriales; el contenido renderizado en el servidor sigue visible. */
export function ScrollReveal({ children, className = '' }: { children: ReactNode; className?: string }) {
  const elementRef = useRef<HTMLDivElement>(null);
  const enabled = useLandingMotion();

  useEffect(() => {
    const element = elementRef.current;
    if (!element || !enabled || typeof IntersectionObserver === 'undefined') return;

    // No oculta imágenes que ya estén visibles, tampoco al restaurar la posición de desplazamiento.
    if (element.getBoundingClientRect().top <= window.innerHeight) return;

    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        element.dataset.reveal = 'visible';
        observer.disconnect();
      }
    }, { threshold: 0, rootMargin: '0px 0px -24px 0px' });

    element.dataset.reveal = 'pending';
    observer.observe(element);
    return () => {
      observer.disconnect();
      delete element.dataset.reveal;
    };
  }, [enabled]);

  return <div ref={elementRef} className={`${styles.reveal} ${className}`}>{children}</div>;
}
