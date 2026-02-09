import { useEffect, useState, useCallback } from 'react';

type Theme = 'light' | 'dark';

interface UseThemeOptions {
  scope?: 'global' | 'scoped';
}

// Cache en memoria para evitar lecturas repetidas a localStorage (rule 7.5)
let cachedTheme: Theme | null = null;

export function useTheme({ scope = 'global' }: UseThemeOptions = {}) {
  // Lazy state initialization con try-catch (rule 5.10, 4.4)
  const [theme, setTheme] = useState<Theme>(() => {
    if (cachedTheme) return cachedTheme;
    try {
      const stored = localStorage.getItem('theme');
      if (stored === 'dark' || stored === 'light') {
        cachedTheme = stored;
        return stored;
      }
    } catch {
      // localStorage no disponible (incógnito, iframe, etc.)
    }
    // preferencia del sistema
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const resolved = prefersDark ? 'dark' : 'light';
    cachedTheme = resolved;
    return resolved;
  });

  useEffect(() => {
    if (scope === 'global') {
      const root = document.documentElement;
      if (theme === 'dark') root.classList.add('dark');
      else root.classList.remove('dark');
    }
    try {
      localStorage.setItem('theme', theme);
      cachedTheme = theme;
    } catch {
      // Ignora errores de escritura
    }
    // Notificar a quien escuche (p.ej., EmpleadoLayout) que el tema cambió
    try {
      const ev = new CustomEvent('app-theme-changed', { detail: { theme } });
      window.dispatchEvent(ev);
    } catch (error) {
      console.warn('No se pudo despachar el evento de cambio de tema', error);
    }
  }, [scope, theme]);

  // Callback estable con functional setState (rule 5.9)
  const toggle = useCallback(() => setTheme((t) => (t === 'dark' ? 'light' : 'dark')), []);

  return { theme, toggle };
}
