import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Hook para hacer scroll automático al inicio de la página cuando cambia la ruta
 * Útil para que al navegar entre páginas siempre se inicie desde arriba
 */
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'auto' // Cambio instantáneo compatible en todos los navegadores
    });
  }, [pathname]);

  return null;
};

export default ScrollToTop;
