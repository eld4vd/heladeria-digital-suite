import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import heroVideo from '../../assets/video/Hero.webm';
import ScrollingIceCream from '../../components/public/ScrollingIceCream';

const Home = () => {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);

  // Observar si el video está visible para pausar/reproducir automáticamente
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            video.play().catch(() => {
              // Ignorar errores de autoplay
            });
          } else {
            video.pause();
          }
        });
      },
      { threshold: 0.5 }
    );

    observer.observe(video);

    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    // Preload video para carga más rápida
    if (videoRef.current) {
      videoRef.current.load();
    }
  }, []);

  const handleVideoLoad = () => {
    setIsVideoLoaded(true);
  };

  // Memoizar los botones para evitar recreaciones
  const ctaButtons = useMemo(() => (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 max-w-2xl mx-auto">
      {/* CTA Primario - Cyan sólido moderno */}
      <button
        onClick={() => navigate('/menu')}
        className="w-full sm:flex-1 px-8 py-4 rounded-lg font-bold text-lg bg-cyan-600 text-white shadow-xl hover:bg-cyan-700 hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
      >
        Explorar Sabores
      </button>

      {/* CTA Secundario - Blanco limpio */}
      <button
        onClick={() => navigate('/promos')}
        className="w-full sm:flex-1 px-8 py-4 rounded-lg font-bold text-lg bg-white text-slate-900 shadow-xl hover:bg-slate-50 hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] border-2 border-white/80"
      >
        Ver Promociones
      </button>
    </div>
  ), [navigate]);

  return (
    <div className="relative w-full min-h-screen overflow-hidden">
      {/* Banner DEMO - Solo visible en GitHub Pages */}
      {typeof window !== 'undefined' && window.location.hostname.includes('github.io') && (
        <div className="fixed top-16 left-0 right-0 z-40 bg-cyan-600 text-white py-2 px-4 text-center text-sm shadow-lg">
          🎨 <strong>DEMO VISUAL</strong> - Frontend únicamente. Las funcionalidades requieren backend.
        </div>
      )}
      {/* Video Background con optimización - Ocupa toda la pantalla incluyendo navbar */}
      <div className="fixed inset-0 w-full h-full -z-10">
        {/* Fallback/Loading gradient - Colores Helado (Rosa Pastel + Azul Cielo + Turquesa) */}
        <div className={`absolute inset-0 bg-gradient-to-br from-pink-200 via-sky-300 to-cyan-300 transition-opacity duration-1000 ${isVideoLoaded ? 'opacity-0' : 'opacity-100'}`}>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-slate-800 text-center">
              <div className="w-16 h-16 border-4 border-slate-800/20 border-t-slate-800 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-xl font-bold" style={{ fontSize: '18px' }}>Preparando tu experiencia...</p>
            </div>
          </div>
        </div>

        {/* Video Hero */}
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          onLoadedData={handleVideoLoad}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${isVideoLoaded ? 'opacity-100' : 'opacity-0'}`}
          poster="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1920 1080'%3E%3Crect fill='%239333ea' width='1920' height='1080'/%3E%3C/svg%3E"
        >
          <source src={heroVideo} type="video/webm" />
          Tu navegador no soporta videos HTML5.
        </video>

        {/* Overlay gradiente optimizado para e-commerce de alimentos (menos oscuro) */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/50"></div>
        
        {/* Vignette sutil para dirigir la mirada al centro */}
        <div className="absolute inset-0 shadow-[inset_0_0_120px_rgba(0,0,0,0.3)]"></div>
      </div>

      {/* CTAs en la parte inferior - Respeta el contenido del video */}
      <div className="relative min-h-screen flex items-end justify-center pb-8 sm:pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto w-full">
          {/* CTAs modernizados pero respetuosos con el video */}
          {ctaButtons}
        </div>
      </div>

      {/* Sección de scroll con helado animado */}
      <ScrollingIceCream />
    </div>
  );
};

export default Home;