import { useEffect, useState } from 'react';

/**
 * Hook para debounce de valores
 * Útil para inputs de búsqueda y filtros
 */
export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Hook para throttle de funciones
 * Útil para eventos de scroll, resize, etc.
 */
export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  delay: number = 500
): T {
  const [ready, setReady] = useState(true);

  const throttledCallback = ((...args: Parameters<T>) => {
    if (ready) {
      callback(...args);
      setReady(false);
      setTimeout(() => {
        setReady(true);
      }, delay);
    }
  }) as T;

  return throttledCallback;
}
