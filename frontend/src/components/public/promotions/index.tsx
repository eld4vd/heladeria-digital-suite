import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { MdAccessTime, MdStar, MdCardGiftcard, MdFlashOn, MdGroup, MdCalendarToday } from 'react-icons/md';

interface Promotion {
  id: number;
  title: string;
  description: string;
  discount: string;
  validUntil: string;
  image: string;
  type: 'limited' | 'combo' | 'special' | 'seasonal';
  isHot?: boolean;
}

const typeStyles: Record<Promotion['type'], {
  overlayBg: string;
  overlayHoverBg: string;
  iconBg: string;
  badgeBg: string;
  textColor: string;
  buttonBg: string;
  buttonHover: string;
}> = {
  limited: {
    overlayBg: 'bg-rose-500/15',
    overlayHoverBg: 'bg-rose-500/25',
    iconBg: 'bg-rose-500',
    badgeBg: 'bg-rose-600',
    textColor: 'text-rose-600',
    buttonBg: 'bg-rose-500',
    buttonHover: 'hover:bg-rose-600',
  },
  combo: {
    overlayBg: 'bg-indigo-500/15',
    overlayHoverBg: 'bg-indigo-500/25',
    iconBg: 'bg-indigo-500',
    badgeBg: 'bg-indigo-600',
    textColor: 'text-indigo-600',
    buttonBg: 'bg-indigo-500',
    buttonHover: 'hover:bg-indigo-600',
  },
  special: {
    overlayBg: 'bg-teal-500/15',
    overlayHoverBg: 'bg-teal-500/25',
    iconBg: 'bg-teal-500',
    badgeBg: 'bg-teal-600',
    textColor: 'text-teal-600',
    buttonBg: 'bg-teal-500',
    buttonHover: 'hover:bg-teal-600',
  },
  seasonal: {
    overlayBg: 'bg-emerald-500/15',
    overlayHoverBg: 'bg-emerald-500/25',
    iconBg: 'bg-emerald-500',
    badgeBg: 'bg-emerald-600',
    textColor: 'text-emerald-600',
    buttonBg: 'bg-emerald-500',
    buttonHover: 'hover:bg-emerald-600',
  },
};

const typeIcons: Record<Promotion['type'], typeof MdAccessTime> = {
  limited: MdAccessTime,
  combo: MdGroup,
  special: MdStar,
  seasonal: MdCalendarToday,
};

type PromotionCardProps = {
  promotion: Promotion;
  index: number;
  prefersReducedMotion: boolean;
};

function PromotionCard({ promotion, index, prefersReducedMotion }: PromotionCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const Icon = typeIcons[promotion.type];
  const style = typeStyles[promotion.type];

  return (
    <div
      className={`relative group cursor-pointer transition-all duration-300 ${
        prefersReducedMotion ? '' : 'hover:-translate-y-1'
      } motion-reduce:transform-none motion-reduce:hover:translate-y-0`}
      style={{ animationDelay: `${index * 100}ms` }}
      onMouseEnter={() => !prefersReducedMotion && setIsHovered(true)}
      onMouseLeave={() => !prefersReducedMotion && setIsHovered(false)}
    >
      <div className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-200 hover:shadow-xl hover:border-gray-300 transition-all duration-300">
        {promotion.isHot && (
          <div className="absolute top-3 right-3 z-10">
            <div className={`${style.badgeBg} text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 shadow-sm`}>
              <MdFlashOn className="w-3.5 h-3.5" />
              DESTACADO
            </div>
          </div>
        )}

        <div className="relative h-48 overflow-hidden">
          <img
            src={promotion.image}
            alt={promotion.title}
            className={`w-full h-full object-cover transition-transform duration-700 ${
              isHovered ? 'scale-110' : 'scale-100'
            }`}
          />
          <div
            className={`absolute inset-0 transition-all duration-300 ${
              isHovered ? style.overlayHoverBg : style.overlayBg
            }`}
          />

          <div className="absolute top-3 left-3">
            <div className={`${style.iconBg} text-white p-2.5 rounded-xl shadow-md`}>
              <Icon className="w-5 h-5" />
            </div>
          </div>
        </div>

        <div className="p-5">
          <div className="flex justify-between items-start mb-3 gap-3">
            <h3 className="text-lg font-bold text-gray-900 group-hover:text-cyan-600 transition-colors duration-200 line-clamp-2">
              {promotion.title}
            </h3>
            <div className={`text-xl font-bold ${style.textColor} shrink-0`}>
              {promotion.discount}
            </div>
          </div>

          <p className="text-sm text-gray-600 mb-4 line-clamp-2">{promotion.description}</p>

          <div className="flex justify-between items-center gap-3">
            <div className="flex items-center text-xs text-gray-500">
              <MdAccessTime className="w-4 h-4 mr-1 shrink-0" />
              <span className="line-clamp-1">{promotion.validUntil}</span>
            </div>

            <Link
              to={`/contacto?promo=${promotion.id}`}
              className={`px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all duration-200 ${
                style.buttonBg
              } ${style.buttonHover} shadow-sm hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-cyan-500 shrink-0`}
              aria-label={`Solicitar información sobre ${promotion.title}`}
            >
              Ver más
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

type FloatingElementProps = {
  children: ReactNode;
  delay: number;
  prefersReducedMotion: boolean;
};

function FloatingElement({ children, delay, prefersReducedMotion }: FloatingElementProps) {
  return (
    <div
      className={`absolute opacity-10 ${prefersReducedMotion ? '' : 'animate-bounce'} motion-reduce:animate-none`}
      style={{
        animationDelay: `${delay}ms`,
        animationDuration: '3s',
      }}
    >
      {children}
    </div>
  );
}

function usePrefersReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) {
      return;
    }

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setPrefersReducedMotion(mediaQuery.matches);

    update();
    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', update);
      return () => mediaQuery.removeEventListener('change', update);
    }

    mediaQuery.addListener(update);
    return () => mediaQuery.removeListener(update);
  }, []);

  return prefersReducedMotion;
}

function Promociones() {
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [lastUpdated, setLastUpdated] = useState(() => new Date());
  const prefersReducedMotion = usePrefersReducedMotion();

  const formattedTimestamp = useMemo(() => {
    return new Intl.DateTimeFormat('es-BO', {
      dateStyle: 'long',
      timeStyle: 'short'
    }).format(lastUpdated);
  }, [lastUpdated]);

  const refreshTimestamp = useCallback(() => {
    setLastUpdated(new Date());
  }, []);

  const promotions: Promotion[] = [
    {
      id: 1,
      title: "¡Martes de Sabores!",
      description: "Todos los martes disfruta de 2 helados por el precio de 1. Válido para cualquier sabor de nuestra carta clásica.",
      discount: "2x1",
      validUntil: "Todos los martes",
      image: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400&h=300&fit=crop",
      type: "special",
      isHot: true
    },
    {
      id: 2,
      title: "Combo Familiar Gigante",
      description: "1 litro de helado + 4 conos + 2 toppings a elegir. Perfecto para compartir en familia.",
      discount: "30%",
      validUntil: "31 de Agosto",
      image: "https://images.unsplash.com/photo-1488900128323-21503983a07e?w=400&h=300&fit=crop",
      type: "combo"
    },
    {
      id: 3,
      title: "Hora Feliz de Smoothies",
      description: "De 3pm a 5pm todos los días, smoothies de frutas con 40% de descuento. ¡Refréscate!",
      discount: "40%",
      validUntil: "Diariamente",
      image: "https://images.unsplash.com/photo-1553909489-cd47e0ef937f?w=400&h=300&fit=crop",
      type: "limited",
      isHot: true
    },
    {
      id: 4,
      title: "Sabores de Temporada",
      description: "Prueba nuestros nuevos sabores de agosto: Mango-Chili, Lavanda-Miel y Maracuyá-Coco.",
      discount: "¡NUEVO!",
      validUntil: "Solo en Agosto",
      image: "https://images.unsplash.com/photo-1501443762994-82bd5dace89a?w=400&h=300&fit=crop",
      type: "seasonal"
    },
    {
      id: 5,
      title: "Estudiante VIP",
      description: "Presenta tu carnet estudiantil y obtén 25% de descuento en cualquier producto.",
      discount: "25%",
      validUntil: "Todo el año",
      image: "https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=400&h=300&fit=crop",
      type: "special"
    },
    {
      id: 6,
      title: "Cumpleañeros de la Casa",
      description: "¡Es tu cumpleaños? Trae tu cédula y recibe un helado completamente GRATIS + vela de regalo.",
      discount: "GRATIS",
      validUntil: "Solo el día de tu cumpleaños",
      image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=300&fit=crop",
      type: "special",
      isHot: true
    }
  ];

  const filters = [
    { id: 'all', label: 'Todas las Promociones', icon: MdCardGiftcard },
    { id: 'limited', label: 'Tiempo Limitado', icon: MdAccessTime },
    { id: 'combo', label: 'Combos', icon: MdGroup },
    { id: 'special', label: 'Especiales', icon: MdStar },
    { id: 'seasonal', label: 'De Temporada', icon: MdCalendarToday }
  ];

  const filteredPromotions = selectedFilter === 'all' 
    ? promotions 
    : promotions.filter(p => p.type === selectedFilter);

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden">
      {/* Elementos flotantes decorativos */}
      <FloatingElement delay={0} prefersReducedMotion={prefersReducedMotion}>
        <div className="absolute w-20 h-20 rounded-full bg-indigo-200 top-10 left-10" />
      </FloatingElement>
      <FloatingElement delay={1000} prefersReducedMotion={prefersReducedMotion}>
        <div className="absolute w-16 h-16 rounded-full bg-cyan-200 top-32 right-20" />
      </FloatingElement>
      <FloatingElement delay={2000} prefersReducedMotion={prefersReducedMotion}>
        <div className="absolute w-12 h-12 rounded-full bg-teal-200 bottom-20 left-1/4" />
      </FloatingElement>

      <div className="container mx-auto px-4 py-12 relative z-10">
        {/* Header de la página */}
        <div className="text-center mb-12 max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold mb-4 text-gray-900">
            Promociones Especiales
          </h1>
          <p className="text-lg md:text-xl text-gray-600 leading-relaxed">
            Descubre nuestras increíbles ofertas. ¡Cada día una nueva oportunidad para disfrutar más!
          </p>
          
          {/* Contador en vivo */}
          <div className="mt-6 inline-flex flex-wrap items-center justify-center gap-3 bg-white rounded-lg px-5 py-3 shadow-sm border border-gray-200">
            <MdAccessTime className="text-cyan-600 w-5 h-5" />
            <span className="text-sm text-gray-700 font-medium">
              Actualizado: {formattedTimestamp}
            </span>
            <button
              type="button"
              onClick={refreshTimestamp}
              className="text-sm font-semibold text-cyan-600 hover:text-cyan-700 transition-colors"
            >
              Refrescar
            </button>
          </div>
        </div>

        {/* Filtros */}
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          {filters.map(filter => {
            const Icon = filter.icon;
            const isActive = selectedFilter === filter.id;
            return (
              <button
                key={filter.id}
                onClick={() => setSelectedFilter(filter.id)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200 ${
                  isActive
                    ? 'bg-cyan-600 text-white shadow-md'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                {filter.label}
              </button>
            );
          })}
        </div>

        {/* Grid de promociones */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {filteredPromotions.map((promotion, index) => (
            <PromotionCard
              key={promotion.id}
              promotion={promotion}
              index={index}
              prefersReducedMotion={prefersReducedMotion}
            />
          ))}
        </div>

        {/* Sección de CTA final */}
        <div className="bg-gradient-to-br from-cyan-600 to-indigo-700 rounded-2xl p-10 md:p-12 text-center text-white relative overflow-hidden shadow-xl">
          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">¿Buscas algo más?</h2>
            <p className="text-lg md:text-xl mb-8 text-white/90 max-w-2xl mx-auto">
              Síguenos en redes para promociones flash y ofertas exclusivas
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a
                href="https://www.instagram.com/heladeriasimple"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-white text-cyan-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-all duration-200 shadow-md"
              >
                📱 Instagram
              </a>
              <a
                href="https://www.pedidosya.com.bo"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-white text-rose-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-all duration-200 shadow-md"
              >
                � PedidosYa
              </a>
            </div>
          </div>
          
          {/* Decoración de fondo */}
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white/5 -translate-y-32 translate-x-32" />
          <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-white/5 translate-y-24 -translate-x-24" />
        </div>
      </div>
    </div>
  );
}

export default Promociones;