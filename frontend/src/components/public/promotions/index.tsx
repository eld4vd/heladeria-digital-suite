import { useEffect, useState } from 'react';
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
      className="relative group cursor-pointer transition-all duration-300 hover:-translate-y-1"
      style={{ animationDelay: `${index * 100}ms` }}
      onMouseEnter={() => !prefersReducedMotion && setIsHovered(true)}
      onMouseLeave={() => !prefersReducedMotion && setIsHovered(false)}
    >
      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-slate-200 hover:shadow-md hover:border-cyan-300 transition-all duration-300">
        {promotion.isHot && (
          <div className="absolute top-3 right-3 z-10">
            <div className="bg-rose-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 shadow-sm">
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

        <div className="p-4">
          <div className="flex justify-between items-start mb-2 gap-3">
            <h3 className="text-[15px] font-semibold text-slate-900 group-hover:text-cyan-600 transition-colors duration-200 line-clamp-2">
              {promotion.title}
            </h3>
            <div className={`text-xl font-bold ${style.textColor} shrink-0`}>
              {promotion.discount}
            </div>
          </div>

          <p className="text-sm text-slate-600 mb-3 line-clamp-2">{promotion.description}</p>

          <div className="flex justify-between items-center gap-3">
            <div className="flex items-center text-xs text-slate-500">
              <MdAccessTime className="w-4 h-4 mr-1 shrink-0" />
              <span className="line-clamp-1">{promotion.validUntil}</span>
            </div>

            <Link
              to={`/contacto?promo=${promotion.id}`}
              className={`px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all duration-200 ${
                style.buttonBg
              } ${style.buttonHover} shadow-sm hover:shadow-md shrink-0`}
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

// FloatingElement y usePrefersReducedMotion removidos (no se usan)

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
  const prefersReducedMotion = usePrefersReducedMotion();

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
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-cyan-600 to-cyan-700 text-white py-16 md:py-20">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE0YzAtNC40MTgtMy41ODItOC04LThzLTggMy41ODItOCA4IDMuNTgyIDggOCA4IDgtMy41ODIgOC04em0wIDI4YzAtNC40MTgtMy41ODItOC04LThzLTggMy41ODItOCA4IDMuNTgyIDggOCA4IDgtMy41ODIgOC04em0yOCAwYzAtNC40MTgtMy41ODItOC04LThzLTggMy41ODItOCA4IDMuNTgyIDggOCA4IDgtMy41ODIgOC04ek0zNiAwYzAtNC40MTgtMy41ODItOC04LThzLTggMy41ODItOCA4IDMuNTgyIDggOCA4IDgtMy41ODIgOC04ek0wIDE0YzAtNC40MTggMy41ODItOCA4LThzOCAzLjU4MiA4IDgtMy41ODIgOC04IDgtOC0zLjU4Mi04LTh6bTAgMjhjMC00LjQxOCAzLjU4Mi04IDgtOHM4IDMuNTgyIDggOC0zLjU4MiA4LTggOC04LTMuNTgyLTgtOHpNMCAwYzAtNC40MTggMy41ODItOCA4LThzOCAzLjU4MiA4IDgtMy41ODIgOC04IDgtOC0zLjU4Mi04LTh6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-10" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
            Promociones Especiales
          </h1>
          <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto">
            Descubre nuestras increíbles ofertas
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* Filtros */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {filters.map(filter => {
            const Icon = filter.icon;
            const isActive = selectedFilter === filter.id;
            return (
              <button
                key={filter.id}
                onClick={() => setSelectedFilter(filter.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-200 border ${
                  isActive
                    ? 'bg-cyan-600 text-white border-cyan-600 shadow-md'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-cyan-50 hover:border-cyan-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                {filter.label}
              </button>
            );
          })}
        </div>

        {/* Grid de promociones */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {filteredPromotions.map((promotion, index) => (
            <PromotionCard
              key={promotion.id}
              promotion={promotion}
              index={index}
              prefersReducedMotion={prefersReducedMotion}
            />
          ))}
        </div>

        {/* CTA final */}
        <div className="bg-white rounded-xl p-8 md:p-10 text-center border border-slate-200 shadow-sm">
          <h2 className="text-2xl md:text-3xl font-bold mb-3 text-slate-900">¿Buscas algo más?</h2>
          <p className="text-slate-600 mb-6 max-w-2xl mx-auto">
            Síguenos en redes para promociones flash y ofertas exclusivas
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <a
              href="https://www.instagram.com/heladeriasimple"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg font-semibold text-sm hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-sm"
            >
              📱 Instagram
            </a>
            <a
              href="https://www.pedidosya.com.bo"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-rose-600 text-white px-6 py-3 rounded-lg font-semibold text-sm hover:bg-rose-700 transition-all duration-200 shadow-sm"
            >
              🍽️ PedidosYa
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Promociones;