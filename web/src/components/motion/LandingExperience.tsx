'use client';

import {
  createContext,
  useContext,
  useEffect,
  useSyncExternalStore,
  type ReactNode,
} from 'react';
import 'lenis/dist/lenis.css';
import styles from './LandingExperience.module.css';

const REDUCED_MOTION = '(prefers-reduced-motion: reduce)';
const PRECISE_POINTER = '(hover: hover) and (pointer: fine)';
const SMOOTH_CLASS = styles.smoothRoot;
const NATIVE_SCROLL = 'input, textarea, select, [contenteditable]:not([contenteditable="false"]), dialog, [role="dialog"], [data-lenis-prevent]';

// Los valores primitivos estables conservan la hidratación estática y responden a los cambios del sistema.
function readEnvironment() {
  if (typeof window === 'undefined') return 0;
  return 1
    | (window.matchMedia(REDUCED_MOTION).matches ? 2 : 0)
    | (window.matchMedia(PRECISE_POINTER).matches ? 4 : 0);
}

function subscribeEnvironment(notify: () => void) {
  const preferences = [window.matchMedia(REDUCED_MOTION), window.matchMedia(PRECISE_POINTER)];
  preferences.forEach((preference) => preference.addEventListener('change', notify));
  return () => preferences.forEach((preference) => preference.removeEventListener('change', notify));
}

const serverEnvironment = () => 0;

type LandingMotion = { enabled: boolean };

const LandingMotionContext = createContext<LandingMotion | null>(null);

/** Permiso del sistema para animar las escenas; cada escena también controla los efectos del puntero. */
export function useLandingMotion() {
  return useContext(LandingMotionContext)?.enabled ?? false;
}

export function LandingExperience({ children }: { children: ReactNode }) {
  const environment = useSyncExternalStore(subscribeEnvironment, readEnvironment, serverEnvironment);
  const hydrated = Boolean(environment & 1);
  const reduced = Boolean(environment & 2);
  const precisePointer = Boolean(environment & 4);
  const enabled = hydrated && !reduced;

  useEffect(() => {
    if (!hydrated || enabled) return;
    const root = document.documentElement;
    root.classList.add(styles.nativeRoot);
    return () => root.classList.remove(styles.nativeRoot);
  }, [hydrated, enabled]);

  useEffect(() => {
    if (!enabled || !precisePointer) return;

    let disposed = false;
    let teardown: (() => void) | undefined;
    const dispose = () => {
      const cleanup = teardown;
      teardown = undefined;
      cleanup?.();
    };

    // Los dispositivos táctiles y los usuarios con movimiento reducido no cargan el motor de desplazamiento.
    void import('lenis').then(({ default: Lenis }) => {
      if (disposed) return;

      const root = document.documentElement;
      const alreadySmooth = root.classList.contains(SMOOTH_CLASS);
      const lenis = new Lenis({
        autoRaf: true,
        lerp: 0.09,
        syncTouch: false,
        respectReducedMotion: true,
        stopInertiaOnNavigate: true,
        // Los enlaces nativos conservan el historial y el foco; las anclas de la misma página se gestionan más abajo.
        anchors: false,
        prevent: (element) => Boolean(element.closest(NATIVE_SCROLL)),
      });
      root.classList.add(SMOOTH_CLASS);
      teardown = () => {
        lenis.destroy();
        if (!alreadySmooth) root.classList.remove(SMOOTH_CLASS);
      };

      const blocked = () => document.hidden || Array.from(
        document.querySelectorAll<HTMLElement>('dialog[open], [role="dialog"][aria-modal="true"]'),
      ).some((dialog) => !dialog.hidden && dialog.getAttribute('aria-hidden') !== 'true' && dialog.getClientRects().length > 0);

      const interrupt = () => {
        lenis.stop();
        if (!blocked()) lenis.start();
      };
      const updateAvailability = () => {
        if (blocked()) lenis.stop();
        else lenis.start();
      };
      const onKeyDown = (event: KeyboardEvent) => {
        if (['Tab', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'PageUp', 'PageDown', 'Home', 'End', ' ', 'Escape'].includes(event.key)) interrupt();
      };
      const onFocus = () => interrupt();
      const onClick = (event: MouseEvent) => {
        if (!(event.target instanceof Element)) return;
        const link = event.target.closest<HTMLAnchorElement>('a[href]');
        if (!link || event.button !== 0 || event.ctrlKey || event.metaKey || event.altKey || event.shiftKey || link.hasAttribute('download') || (link.target && link.target !== '_self')) return;

        interrupt();
        // No interviene en la navegación de Next.js ni en el enlace de salto accesible por teclado.
        if (event.defaultPrevented || link.classList.contains('skip-link')) return;
        const destination = new URL(link.href, window.location.href);
        const current = new URL(window.location.href);
        if (!destination.hash || destination.origin !== current.origin || destination.pathname !== current.pathname || destination.search !== current.search) return;

        let targetId: string;
        try { targetId = decodeURIComponent(destination.hash.slice(1)); }
        catch { return; }
        const target = document.getElementById(targetId);
        if (!target || target.id === 'contenido' || blocked()) return;

        event.preventDefault();
        if (destination.hash !== current.hash) {
          // Conserva el estado existente del historial de Next.js al añadir una entrada de ancla.
          window.history.pushState(window.history.state, '', destination.hash);
        }
        const scrollPadding = Number.parseFloat(window.getComputedStyle(root).scrollPaddingTop) || 0;
        const scrollMargin = Number.parseFloat(window.getComputedStyle(target).scrollMarginTop) || 0;
        lenis.scrollTo(target, {
          // Lenis tiene en cuenta ambos desplazamientos CSS, que reservan espacio para la misma cabecera fija.
          offset: Math.min(scrollPadding, scrollMargin),
          onComplete: () => {
            if (disposed) return;
            const temporaryTabIndex = !target.hasAttribute('tabindex');
            if (temporaryTabIndex) target.setAttribute('tabindex', '-1');
            target.focus({ preventScroll: true });
            if (temporaryTabIndex) target.removeAttribute('tabindex');
          },
        });
      };

      const modalObserver = new MutationObserver(updateAvailability);
      modalObserver.observe(document.body, {
        subtree: true,
        childList: true,
        attributes: true,
        attributeFilter: ['open', 'hidden', 'aria-hidden', 'aria-modal', 'data-state'],
      });
      document.addEventListener('visibilitychange', updateAvailability);
      document.addEventListener('keydown', onKeyDown, true);
      document.addEventListener('focusin', onFocus, true);
      window.addEventListener('click', onClick);
      updateAvailability();

      teardown = () => {
        modalObserver.disconnect();
        document.removeEventListener('visibilitychange', updateAvailability);
        document.removeEventListener('keydown', onKeyDown, true);
        document.removeEventListener('focusin', onFocus, true);
        window.removeEventListener('click', onClick);
        lenis.destroy();
        if (!alreadySmooth) root.classList.remove(SMOOTH_CLASS);
      };
    }).catch(() => {
      // Si falla un fragmento opcional, la página nativa debe seguir siendo completamente utilizable.
      dispose();
    });

    return () => { disposed = true; dispose(); };
  }, [enabled, precisePointer]);

  return (
    <LandingMotionContext.Provider value={{ enabled }}>
      <div className={styles.experience}>{children}</div>
    </LandingMotionContext.Provider>
  );
}

