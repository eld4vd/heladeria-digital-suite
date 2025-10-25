// Gallery modernizada con categorías, dos filas y tarjetas grandes
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import useProductos, {
  type ProductoResumen,
} from "../../../hooks/useProductos";
import useCategorias from "../../../hooks/useCategorias";
import { MdShoppingCart } from 'react-icons/md';
import { useCart } from "../../../context/CartContext";
import { useCrearCarrito, useAgregarItem } from "../../../hooks/useCarrito";
import toast from 'react-hot-toast';

interface ProductoCardProps {
  producto: ProductoResumen;
  fullscreen?: boolean;
  onAddToCart: (producto: ProductoResumen) => void;
  isAddingToCart?: boolean;
}

const MaximizeIcon = ({ className = "" }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M15 3H21V9"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M9 21H3V15"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M21 3L14 10"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M3 21L10 14"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const CloseIcon = ({ className = "" }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M18 6L6 18"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M6 6L18 18"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ProductoCard = ({ producto, fullscreen = false, onAddToCart, isAddingToCart = false }: ProductoCardProps) => {
  return (
    <div className={`group flex flex-col rounded-xl bg-white border border-slate-200/80 shadow-md hover:shadow-xl hover:shadow-slate-200/60 transition-all duration-300 overflow-hidden hover:-translate-y-1 ${fullscreen ? 'h-full' : ''}`}>
      <div className={`relative ${fullscreen ? 'aspect-[4/5]' : 'aspect-[4/5]'} overflow-hidden bg-slate-100`}>
        <img
          src={
            producto.imagenUrl ||
            "https://placehold.co/600x600/f3f4f6/9ca3af?text=Sin+Imagen"
          }
          alt={producto.nombre}
          width={600}
          height={750}
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          onError={(e) => {
            e.currentTarget.src =
              "https://placehold.co/600x600/f3f4f6/9ca3af?text=Sin+Imagen";
          }}
        />
        <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/95 backdrop-blur-md text-xs font-bold text-cyan-700 shadow-lg border border-white/50">
          <span className="h-1.5 w-1.5 rounded-full bg-cyan-500" />
          {producto.categoria.nombre}
        </span>
        <span className="absolute top-3 right-3 inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/95 backdrop-blur-md text-xs font-bold text-white shadow-lg">
          <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          Disponible
        </span>
      </div>
      <div className="p-5 flex flex-col gap-4 flex-1">
        <div className="space-y-3">
          <h4 className="text-lg font-bold leading-snug line-clamp-2 text-slate-900 group-hover:text-cyan-700 transition-colors">
            {producto.nombre}
          </h4>
          
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-xs font-semibold text-slate-700">
              <svg className="h-3.5 w-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              {producto.sabor}
            </span>
          </div>

          <div className="pt-1">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Bs {Number(producto.precio).toFixed(2)}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-2 mt-auto">
          <button
            onClick={() => onAddToCart(producto)}
            disabled={isAddingToCart}
            className="w-full inline-flex items-center justify-center gap-2 text-base font-bold px-4 py-3.5 rounded-lg bg-cyan-600 text-white shadow-md hover:bg-cyan-700 hover:shadow-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <MdShoppingCart className="h-5 w-5" />
            {isAddingToCart ? 'Agregando...' : 'Agregar al Carrito'}
          </button>
          <Link
            to={`/detalle/${producto.id}`}
            className="w-full inline-flex items-center justify-center gap-1.5 text-sm font-semibold px-3 py-2 rounded-lg text-cyan-700 hover:text-cyan-800 hover:bg-cyan-50 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500"
          >
            Ver detalles
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
};

const ProductosGrid = ({
  productos,
  fullscreen = false,
  onAddToCart,
  isAddingToCart,
}: {
  productos: ProductoResumen[];
  fullscreen?: boolean;
  onAddToCart: (producto: ProductoResumen) => void;
  isAddingToCart?: boolean;
}) => (
    <div className={`grid ${fullscreen ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5'}`}>
    {productos.map((p) => (
      <ProductoCard key={p.id} producto={p} fullscreen={fullscreen} onAddToCart={onAddToCart} isAddingToCart={isAddingToCart} />
    ))}
  </div>
);

const GaleriaHelados = () => {
  const {
    data: productos,
    isLoading: loadingProductos,
    error: errorProductos,
    refetch: refetchProductos,
  } = useProductos({ refetchInterval: 30_000 });
  const {
    data: categorias,
    isLoading: loadingCategorias,
    error: errorCategorias,
    refetch: refetchCategorias,
  } = useCategorias();
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<
    number | "all"
  >("all");
  const [fullscreenMode, setFullscreenMode] = useState(false);

  // Carrito hooks
  const { clienteTempId, carritoId, setCarritoId } = useCart();
  const crearCarrito = useCrearCarrito();
  const agregarItem = useAgregarItem();

  const sections = productos?.sections ?? [];
  const sectionsById = productos?.sectionsById ?? {};
  const allProductos = productos?.flat ?? [];
  const countsByCategory = productos?.countsByCategory ?? {};
  const filtered =
    categoriaSeleccionada === "all"
      ? sections
      : sectionsById[String(categoriaSeleccionada)]
      ? [sectionsById[String(categoriaSeleccionada)]]
      : [];

  const retry = () => {
    refetchProductos();
    refetchCategorias();
  };

  // Función para agregar al carrito
  const handleAddToCart = async (producto: ProductoResumen) => {
    try {
      let targetCarritoId = carritoId;

      // Si no hay carrito, crear uno primero y obtener su ID
      if (!targetCarritoId) {
        const nuevoCarrito = await crearCarrito.mutateAsync({ clienteTempId });
        targetCarritoId = nuevoCarrito.id;
        setCarritoId(nuevoCarrito.id);
      }

      if (!targetCarritoId) {
        throw new Error('No se pudo obtener el carrito');
      }

      const precio = Number(producto.precio);
      if (Number.isNaN(precio)) {
        throw new Error('Precio inválido para el producto');
      }
      const subtotal = Number((precio * 1).toFixed(2));

      // Ahora agregar el producto (se pasa el carritoId para evitar race conditions)
      await agregarItem.mutateAsync({
        carritoId: targetCarritoId,
        productoId: producto.id,
        cantidad: 1,
        subtotal,
      });

      toast.success('¡Producto agregado al carrito! 🍦', {
        duration: 2000,
        icon: '✅',
      });
    } catch (error) {
      console.error('Error al agregar al carrito:', error);
      toast.error('Error al agregar al carrito');
    }
  };

  const isAddingToCart = crearCarrito.isPending || agregarItem.isPending;

  // Efecto para manejar ESC en modo fullscreen
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && fullscreenMode) {
        setFullscreenMode(false);
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [fullscreenMode]);

  // Estados base
  if (loadingProductos || loadingCategorias) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <div className="flex gap-2">
          <div className="w-3 h-3 rounded-full bg-indigo-500 animate-bounce" />
          <div className="w-3 h-3 rounded-full bg-cyan-500 animate-bounce [animation-delay:150ms]" />
          <div className="w-3 h-3 rounded-full bg-teal-500 animate-bounce [animation-delay:300ms]" />
        </div>
        <p className="text-sm font-semibold text-slate-600">Cargando deliciosos sabores...</p>
      </div>
    );
  }
  if (errorProductos || errorCategorias) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-6 rounded-[24px] border border-red-200 bg-red-50 p-8">
        <svg className="h-16 w-16 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div className="text-center space-y-2">
          <p className="text-lg font-bold text-red-700">Error al cargar el menú</p>
          <p className="text-sm text-red-600">No pudimos cargar los productos. Intenta nuevamente.</p>
        </div>
        <button
          onClick={retry}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-br from-red-600 to-red-700 text-white font-bold shadow-lg shadow-red-200/50 transition-all duration-200 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Reintentar
        </button>
      </div>
    );
  }
  if (!productos || productos.flat.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4 rounded-[24px] border border-slate-200 bg-slate-50 p-8">
        <svg className="h-16 w-16 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
        <div className="text-center space-y-2">
          <p className="text-lg font-bold text-slate-700">Sin productos disponibles</p>
          <p className="text-sm text-slate-500">No hay productos para mostrar en este momento.</p>
        </div>
      </div>
    );
  }

  const galeriaContent = (
    <div className={`space-y-${fullscreenMode ? '4' : '8'}`}>
      {/* Categorías */}
      <div className={`${fullscreenMode ? 'relative' : 'sticky top-20'} z-30 rounded-xl border border-slate-200/80 bg-white/90 backdrop-blur-xl shadow-md shadow-slate-200/50 px-3 py-3`}>
        <div
          className="flex gap-2 overflow-x-auto no-scrollbar scroll-smooth"
          role="tablist"
          aria-label="Categorías"
        >
          <CategoriaButton
            active={categoriaSeleccionada === "all"}
            label="Todo"
            count={allProductos.length}
            onClick={() => setCategoriaSeleccionada("all")}
          />
          {categorias?.list.map((c) => {
            const count = countsByCategory[String(c.id)] ?? 0;
            return (
              <CategoriaButton
                key={c.id}
                active={categoriaSeleccionada === c.id}
                label={c.nombre}
                count={count}
                onClick={() => setCategoriaSeleccionada(c.id)}
              />
            );
          })}
        </div>
      </div>

      {/* Vista Todo */}
      {categoriaSeleccionada === "all" && (
        <section className="space-y-4" key="all">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-800">
              Todos los sabores
            </h2>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-50 border border-cyan-200 text-xs font-bold text-cyan-700 shadow-sm">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              {allProductos.length}
            </span>
          </div>
          <ProductosGrid productos={allProductos} fullscreen={fullscreenMode} onAddToCart={handleAddToCart} isAddingToCart={isAddingToCart} />
        </section>
      )}

      {/* Vista filtrada */}
      {categoriaSeleccionada !== "all" &&
        filtered.map((sec) => {
          return (
            <section key={sec.id} className="space-y-4">
              <div className="flex items-center justify-between px-1">
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-800">
                  {sec.nombre}
                </h2>
                <button
                  onClick={() => setCategoriaSeleccionada("all")}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-cyan-200 bg-cyan-50 text-xs font-bold text-cyan-700 transition-all duration-200 hover:bg-cyan-100 hover:border-cyan-300 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500"
                >
                  Ver todo
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
              <ProductosGrid productos={sec.items} fullscreen={fullscreenMode} onAddToCart={handleAddToCart} isAddingToCart={isAddingToCart} />
            </section>
          );
        })}
    </div>
  );

  // Modo Normal
  if (!fullscreenMode) {
    return (
      <div className="relative">
        {galeriaContent}
        
        {/* Botón flotante para activar fullscreen - ajustado para no chocar con carrito */}
        <button
          onClick={() => setFullscreenMode(true)}
          className="fixed bottom-8 left-8 z-40 group inline-flex items-center gap-3 px-6 py-3 rounded-lg bg-cyan-600 text-white font-semibold shadow-xl hover:bg-cyan-700 hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500"
          aria-label="Ver galería completa"
        >
          <MaximizeIcon className="w-5 h-5" />
          <span className="text-sm">Ver Galería Completa</span>
        </button>
      </div>
    );
  }

  // Modo Fullscreen
  return (
    <div className="fixed inset-0 z-50 bg-slate-50 overflow-y-auto">
      {/* Header Fullscreen Compacto */}
      <div className="sticky top-0 z-50 bg-white/98 backdrop-blur-xl border-b border-slate-200/80 shadow-sm">
        <div className="max-w-screen-2xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          {/* Logo compacto + Categorías integradas */}
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-shrink-0">
              <div className="h-8 w-8 rounded-lg bg-cyan-600 flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-sm">H</span>
              </div>
              <span className="text-sm font-bold text-cyan-600 hidden sm:inline">
                Galería
              </span>
            </div>
            
            {/* Categorías en línea con header */}
            <div className="flex-1 min-w-0 overflow-x-auto no-scrollbar">
              <div className="flex gap-2">
                <button
                  onClick={() => setCategoriaSeleccionada("all")}
                  className={`flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 whitespace-nowrap ${
                    categoriaSeleccionada === "all"
                      ? "bg-cyan-600 text-white shadow-md"
                      : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                  }`}
                >
                  Todo
                  <span className={`inline-flex items-center justify-center min-w-[18px] h-4 px-1 rounded text-[10px] font-bold ${
                    categoriaSeleccionada === "all" ? "bg-white/20 text-white" : "bg-slate-200 text-slate-600"
                  }`}>
                    {allProductos.length}
                  </span>
                </button>
                {categorias?.list.map((c) => {
                  const count = countsByCategory[String(c.id)] ?? 0;
                  return (
                    <button
                      key={c.id}
                      onClick={() => setCategoriaSeleccionada(c.id)}
                      className={`flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 whitespace-nowrap ${
                        categoriaSeleccionada === c.id
                          ? "bg-cyan-600 text-white shadow-md"
                          : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                      }`}
                    >
                      {c.nombre}
                      <span className={`inline-flex items-center justify-center min-w-[18px] h-4 px-1 rounded text-[10px] font-bold ${
                        categoriaSeleccionada === c.id ? "bg-white/20 text-white" : "bg-slate-200 text-slate-600"
                      }`}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
          
          {/* Botón cerrar compacto */}
          <button
            onClick={() => setFullscreenMode(false)}
            className="flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 font-bold text-xs transition-all duration-200 hover:bg-slate-50 hover:border-slate-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500"
          >
            <CloseIcon className="w-4 h-4" />
            <span className="hidden sm:inline">ESC</span>
          </button>
        </div>
      </div>

      {/* Contenido Fullscreen sin categorías duplicadas */}
      <div className="max-w-screen-2xl mx-auto px-4 py-4">
        {/* Vista Todo */}
        {categoriaSeleccionada === "all" && (
          <section className="space-y-4" key="all">
            <ProductosGrid productos={allProductos} fullscreen={fullscreenMode} onAddToCart={handleAddToCart} isAddingToCart={isAddingToCart} />
          </section>
        )}

        {/* Vista filtrada */}
        {categoriaSeleccionada !== "all" &&
          filtered.map((sec) => {
            return (
              <section key={sec.id} className="space-y-4">
                <ProductosGrid productos={sec.items} fullscreen={fullscreenMode} onAddToCart={handleAddToCart} isAddingToCart={isAddingToCart} />
              </section>
            );
          })}
      </div>
    </div>
  );
};

const CategoriaButton = ({
  active,
  label,
  onClick,
  count,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
  count?: number;
}) => (
  <button
    onClick={onClick}
    role="tab"
    aria-selected={active}
    className={`group flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 whitespace-nowrap border shadow-sm
      ${
        active
          ? "bg-cyan-600 text-white border-cyan-600 shadow-md scale-[1.02]"
          : "bg-white hover:bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300 hover:shadow"
      }
    `}
  >
    {label}
    {count !== undefined && (
      <span className={`inline-flex items-center justify-center min-w-[18px] h-4 px-1 rounded text-[10px] font-bold ${
        active 
          ? "bg-white/20 text-white" 
          : "bg-slate-100 text-slate-600 group-hover:bg-slate-200"
      }`}>
        {count}
      </span>
    )}
  </button>
);

export default GaleriaHelados;
