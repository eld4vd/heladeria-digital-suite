// src/components/Contacto/LocationMap.tsx
import { memo, useCallback, useState } from 'react';

// Extrae la URL del iframe para mantenimiento (puedes moverla a env si cambia)
const MAP_IFRAME_SRC =
  'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3191.899288191703!2d-65.2600836!3d-19.0482651!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x93fbcf36656fb06b%3A0x5e4f23584d3c808f!2sPl.%2025%20de%20Mayo%2C%20Sucre!5e1!3m2!1ses-419!2sbo!4v1757426409517!5m2!1ses-419!2sbo';

// Imagen de fondo ligera (podrías reemplazar por un PNG reducido o static map)
const BgPattern = () => (
  <div
    aria-hidden="true"
    className="absolute inset-0 bg-gradient-to-br from-indigo-200/60 via-cyan-200/50 to-teal-200/40 dark:from-indigo-300/20 dark:via-cyan-300/20 dark:to-teal-300/20"
  />
);

const LocationMap = () => {
  const [active, setActive] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const activate = useCallback(() => {
    if (!active) setActive(true);
  }, [active]);

  return (
    <section aria-labelledby="ubicacion-heading" className="space-y-4">
      <div className="flex items-center justify-between">
        <h2
          id="ubicacion-heading"
          className="text-lg font-semibold tracking-tight bg-gradient-to-r from-indigo-600 via-cyan-500 to-teal-500 bg-clip-text text-transparent"
        >
          Dónde estamos
        </h2>
        <span className="text-[11px] text-gray-400">Mapa referencial</span>
      </div>
      <div className="relative rounded-2xl overflow-hidden border border-white/40 bg-white/70 dark:bg-white/10 backdrop-blur shadow-sm aspect-[16/9] sm:aspect-[21/9]">
        <BgPattern />
        {/* Capa interactiva / placeholder */}
        {!active && (
          <button
            type="button"
            onClick={activate}
            className="absolute inset-0 w-full h-full flex flex-col items-center justify-center gap-3 text-center px-6 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/70 bg-white/55 dark:bg-black/40 backdrop-blur-sm hover:bg-white/70 dark:hover:bg-black/55"
            aria-label="Activar mapa interactivo"
          >
            <svg
              className="w-12 h-12 text-cyan-600 drop-shadow"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M12 21s-6-5.686-6-11a6 6 0 0112 0c0 5.314-6 11-6 11z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-100">
              Click para cargar el mapa interactivo
            </span>
            <span className="text-[11px] text-gray-500 dark:text-gray-300">
              Ahorro de datos hasta que lo necesites
            </span>
          </button>
        )}

        {active && (
          <iframe
            key="map"
            title="Ubicación Heladería Plaza 25 de Mayo, Sucre"
            aria-label="Mapa interactivo de la ubicación de la heladería en Plaza 25 de Mayo, Sucre"
            src={MAP_IFRAME_SRC}
            className={`absolute inset-0 w-full h-full transition-opacity duration-700 ${loaded ? 'opacity-100' : 'opacity-0'}`}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            onLoad={() => setLoaded(true)}
            sandbox="allow-scripts allow-same-origin allow-popups"
            allowFullScreen
          />
        )}

        {/* Indicador de carga suave */}
        {active && !loaded && (
          <div
            aria-live="polite"
            className="absolute inset-0 flex items-center justify-center text-xs text-gray-600 dark:text-gray-300 bg-white/40 backdrop-blur-sm"
          >
            Cargando mapa…
          </div>
        )}
      </div>
    </section>
  );
};

export default memo(LocationMap);

// Notas:
// - Carga diferida sólo tras interacción -> menor coste inicial y mejor LCP.
// - sandbox reduce superficie de riesgo.
// - aria-label / title mejoran accesibilidad.
// - Fondo decorativo y CTA evitan layout shift.