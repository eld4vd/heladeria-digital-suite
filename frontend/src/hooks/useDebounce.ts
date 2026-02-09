import { useEffect, useState, useRef, useCallback } from 'react';

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
 * Hook para throttle de funciones — usa useRef para valores transitorios (rule 5.12)
 * y useCallback para referencia de callback estable (rule 5.9)
 */
export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  delay: number = 500
): T {
  const readyRef = useRef(true);
  const callbackRef = useRef(callback);

  // Mantener referencia actualizada sin provocar re-renders (rule 5.12)
  callbackRef.current = callback;

  const throttledCallback = useCallback(
    ((...args: Parameters<T>) => {
      if (readyRef.current) {
        callbackRef.current(...args);
        readyRef.current = false;
        setTimeout(() => {
          readyRef.current = true;
        }, delay);
      }
    }) as T,
    [delay]
  );

  return throttledCallback;
}
