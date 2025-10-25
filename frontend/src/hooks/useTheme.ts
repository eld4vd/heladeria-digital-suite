import { useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

interface UseThemeOptions {
  scope?: 'global' | 'scoped';
}

export function useTheme({ scope = 'global' }: UseThemeOptions = {}) {
  const [theme, setTheme] = useState<Theme>(() => {
    const stored = localStorage.getItem('theme');
    if (stored === 'dark' || stored === 'light') return stored;
    // preferencia del sistema
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    return prefersDark ? 'dark' : 'light';
  });

  useEffect(() => {
    if (scope === 'global') {
      const root = document.documentElement;
      if (theme === 'dark') root.classList.add('dark');
      else root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
    // Notificar a quien escuche (p.ej., EmpleadoLayout) que el tema cambió
    try {
      const ev = new CustomEvent('app-theme-changed', { detail: { theme } });
      window.dispatchEvent(ev);
    } catch (error) {
      console.warn('No se pudo despachar el evento de cambio de tema', error);
    }
  }, [scope, theme]);

  const toggle = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'));

  return { theme, toggle };
}
