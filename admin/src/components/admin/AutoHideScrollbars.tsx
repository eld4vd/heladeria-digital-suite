'use client';

import { useEffect } from 'react';

const scrollers = '.admin-sidebar, .admin-table-wrap, .admin-tabs, .admin-modal, textarea.admin-input';

export function AutoHideScrollbars() {
  useEffect(() => {
    const root = document.documentElement;
    const timers = new Map<Element, number>();
    root.setAttribute('data-auto-scrollbars', '');

    function reveal(element: Element) {
      if (!element.hasAttribute('data-scroll-active')) element.setAttribute('data-scroll-active', '');
      const previous = timers.get(element);
      if (previous !== undefined) window.clearTimeout(previous);
      timers.set(element, window.setTimeout(() => {
        element.removeAttribute('data-scroll-active');
        timers.delete(element);
      }, 1200));
    }
    function onScroll(event: Event) {
      const element = event.target === document ? root : event.target;
      if (element instanceof Element && (element === root || element.matches(scrollers))) reveal(element);
    }
    function onPointerMove(event: PointerEvent) {
      if (event.pointerType !== 'mouse' && event.pointerType !== 'pen') return;
      const nearEdge = event.clientX >= window.innerWidth - 16 || event.clientY >= window.innerHeight - 16;
      root.toggleAttribute('data-scrollbar-edge', nearEdge);
    }
    function leaveWindow() { root.removeAttribute('data-scrollbar-edge'); }

    // Solo observa el desplazamiento nativo; no intercepta la rueda, los gestos táctiles ni el teclado.
    document.addEventListener('scroll', onScroll, { capture: true, passive: true });
    document.addEventListener('pointermove', onPointerMove, { passive: true });
    document.addEventListener('pointerleave', leaveWindow);
    window.addEventListener('blur', leaveWindow);
    return () => {
      document.removeEventListener('scroll', onScroll, true);
      document.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('pointerleave', leaveWindow);
      window.removeEventListener('blur', leaveWindow);
      for (const [element, timer] of timers) {
        window.clearTimeout(timer);
        element.removeAttribute('data-scroll-active');
      }
      root.removeAttribute('data-auto-scrollbars');
      root.removeAttribute('data-scrollbar-edge');
    };
  }, []);

  return null;
}
