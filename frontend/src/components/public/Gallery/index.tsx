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
  const stockBajo = producto.stock <= 10;
  const stockCritico = producto.stock <= 5;
  
  return (
    <article className={`group relative flex flex-col rounded-2xl bg-white border border-slate-200/60 shadow-sm hover:shadow-2xl hover:shadow-cyan-500/10 transition-all duration-500 overflow-hidden hover:-translate-y-2 ${fullscreen ? 'h-full' : ''}`}>
      {/* Link a detalles - toda la imagen es clickeable */}
      <Link to={`/detalle/${producto.id}`} className="relative aspect-[3/4] overflow-hidden bg-gradient-to-br from-slate-100 to-slate-50 block">
        <img
          src={producto.imagenUrl || "https://placehold.co/600x600/f3f4f6/9ca3af?text=Sin+Imagen"}
          alt={producto.nombre}
          width={600}
          height={800}
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110 group-hover:rotate-1"
          onError={(e) => {
            e.currentTarget.src = "https://placehold.co/600x600/f3f4f6/9ca3af?text=Sin+Imagen";
          }}
        />
        
        {/* Overlay oscuro en hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Badge de categoría */}
        <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-xl text-xs font-bold text-cyan-700 shadow-lg border border-white/60">
          <span className="h-1.5 w-1.5 rounded-full bg-cyan-500 animate-pulse" />
          {producto.categoria.nombre}
        </span>

        {/* Botón "Agregar al Carrito" flotante - aparece en hover */}
        <button
          onClick={(e) => {
            e.preventDefault(); // Evita que el link se active
            e.stopPropagation();
            onAddToCart(producto);
          }}
          disabled={isAddingToCart}
          className="absolute inset-x-4 bottom-4 inline-flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl bg-gradient-to-r from-cyan-600 to-cyan-700 text-white font-bold text-base shadow-2xl shadow-cyan-500/50 border-2 border-white/20 backdrop-blur-sm opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-300 hover:scale-[1.03] active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-cyan-600 z-10"
        >
          {isAddingToCart ? (
            <>
              <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Agregando...
            </>
          ) : (
            <>
              <MdShoppingCart className="h-5 w-5" />
              Agregar al Carrito
            </>
          )}
        </button>

        {/* Icono sutil de "ver más" en la esquina superior derecha */}
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-white/90 backdrop-blur-xl text-xs font-semibold text-slate-700 shadow-lg border border-white/60">
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            Ver
          </div>
        </div>
      </Link>

      {/* Contenido compacto - también clickeable */}
      <Link to={`/detalle/${producto.id}`} className="p-4 flex flex-col gap-2">
        {/* Título */}
        <h4 className="text-base font-bold leading-tight line-clamp-2 text-slate-900 group-hover:text-cyan-700 transition-colors duration-200">
          {producto.nombre}
        </h4>
        
        {/* Fila: Precio + Sabor */}
        <div className="flex items-center justify-between gap-3">
          <span className="text-2xl font-black bg-gradient-to-br from-slate-900 to-slate-700 bg-clip-text text-transparent tracking-tight">
            Bs {Number(producto.precio).toFixed(2)}
          </span>
          
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 text-xs font-semibold text-slate-700 flex-shrink-0">
            <svg className="h-3 w-3 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            {producto.sabor}
          </span>
        </div>
      </Link>
    </article>
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
    <div className={`grid ${
      fullscreen 
        ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 sm:gap-4' 
        : 'grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-5 lg:gap-6'
    }`}>
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
  const [searchQuery, setSearchQuery] = useState("");

  // Carrito hooks
  const { clienteTempId, carritoId, setCarritoId } = useCart();
  const crearCarrito = useCrearCarrito();
  const agregarItem = useAgregarItem();

  const sections = productos?.sections ?? [];
  const sectionsById = productos?.sectionsById ?? {};
  const allProductos = productos?.flat ?? [];
  const countsByCategory = productos?.countsByCategory ?? {};
  
  // Filtrar productos por búsqueda
  const searchFilteredProductos = searchQuery.trim() 
    ? allProductos.filter(p => 
        p.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sabor.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : allProductos;

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

      toast.success('¡Producto agregado al carrito!', {
        duration: 2000,
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
    <div className={fullscreenMode ? 'space-y-4' : 'space-y-8'}>
      {/* Buscador sutil */}
      {!fullscreenMode && (
        <div className="relative max-w-md mx-auto">
          <input
            type="text"
            placeholder="Buscar helados por nombre o sabor..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-3 pl-11 pr-4 rounded-xl border-2 border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-200 text-sm"
          />
          <svg 
            className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-100 rounded-full transition-colors"
            >
              <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      )}

      {/* Categorías - Solo en modo normal (en fullscreen van en el header) */}
      {!fullscreenMode && !searchQuery && (
        <div className="sticky top-20 z-30 rounded-xl border-2 border-cyan-100 bg-gradient-to-b from-white to-cyan-50/30 backdrop-blur-xl shadow-lg shadow-cyan-100/50 px-4 py-4">
          {/* Indicador de scroll */}
          <div className="relative">
            <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white to-transparent pointer-events-none z-10 rounded-l-lg" />
            <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-cyan-50/30 to-transparent pointer-events-none z-10 rounded-r-lg" />
            
            <div
              className="flex gap-2 overflow-x-auto scroll-smooth scrollbar-thin pb-1"
              role="tablist"
              aria-label="Categorías de productos"
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
        </div>
      )}

      {/* Vista búsqueda */}
      {searchQuery && (
        <section className="space-y-5" key="search">
          <div className="flex items-center justify-between px-1 pb-3 border-b-2 border-slate-200">
            <div className="space-y-1">
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight bg-gradient-to-r from-cyan-600 to-cyan-700 bg-clip-text text-transparent">
                Resultados de búsqueda
              </h2>
              <p className="text-sm text-slate-600">"{searchQuery}"</p>
            </div>
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-br from-cyan-50 to-cyan-100 border-2 border-cyan-200 text-sm font-bold text-cyan-700 shadow-md">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              {searchFilteredProductos.length}
            </span>
          </div>
          {searchFilteredProductos.length > 0 ? (
            <ProductosGrid productos={searchFilteredProductos} fullscreen={fullscreenMode} onAddToCart={handleAddToCart} isAddingToCart={isAddingToCart} />
          ) : (
            <div className="flex flex-col items-center justify-center py-12 gap-4 rounded-xl bg-slate-50 border-2 border-slate-200">
              <svg className="h-12 w-12 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <p className="text-sm text-slate-600">No se encontraron resultados para "{searchQuery}"</p>
            </div>
          )}
        </section>
      )}

      {/* Vista Todo */}
      {categoriaSeleccionada === "all" && !searchQuery && (
        <section className="space-y-5" key="all">
          <div className="flex items-center justify-between px-1 pb-3 border-b-2 border-slate-200">
            <div className="space-y-1">
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight bg-gradient-to-r from-cyan-600 to-cyan-700 bg-clip-text text-transparent">
                Todos los sabores 🍦
              </h2>
              <p className="text-sm text-slate-600">Descubre nuestra colección completa</p>
            </div>
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-br from-cyan-50 to-cyan-100 border-2 border-cyan-200 text-sm font-bold text-cyan-700 shadow-md">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              {allProductos.length}
            </span>
          </div>
          <ProductosGrid productos={allProductos} fullscreen={fullscreenMode} onAddToCart={handleAddToCart} isAddingToCart={isAddingToCart} />
        </section>
      )}

      {/* Vista filtrada */}
      {categoriaSeleccionada !== "all" && !searchQuery &&
        filtered.map((sec) => {
          return (
            <section key={sec.id} className="space-y-5">
              <div className="flex items-center justify-between px-1 pb-3 border-b-2 border-slate-200">
                <div className="space-y-1">
                  <h2 className="text-2xl md:text-3xl font-bold tracking-tight bg-gradient-to-r from-cyan-600 to-cyan-700 bg-clip-text text-transparent">
                    {sec.nombre}
                  </h2>
                  <p className="text-sm text-slate-600">{sec.items.length} productos disponibles</p>
                </div>
                <button
                  onClick={() => setCategoriaSeleccionada("all")}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-cyan-200 bg-gradient-to-br from-cyan-50 to-cyan-100 text-sm font-bold text-cyan-700 transition-all duration-200 hover:from-cyan-100 hover:to-cyan-200 hover:border-cyan-300 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2"
                  aria-label="Ver todos los productos"
                >
                  Ver todo
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
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
        
        {/* Botón flotante para activar fullscreen - posición ajustada para no chocar con carrito */}
        <button
          onClick={() => setFullscreenMode(true)}
          className="fixed bottom-8 left-4 sm:left-8 z-40 group inline-flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl bg-gradient-to-br from-cyan-600 to-cyan-700 text-white font-bold shadow-xl shadow-cyan-500/30 hover:shadow-2xl hover:shadow-cyan-500/40 transition-all duration-300 hover:scale-[1.05] active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2"
          aria-label="Ver galería en pantalla completa"
          title="Presiona para ver la galería completa"
        >
          <MaximizeIcon className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="text-xs sm:text-sm hidden sm:inline">Ver Galería Completa</span>
          <span className="text-xs sm:hidden">Galería</span>
        </button>
      </div>
    );
  }

  // Modo Fullscreen
  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-b from-slate-50 to-slate-100 overflow-y-auto">
      {/* Header Fullscreen Mejorado */}
      <div className="sticky top-0 z-50 bg-white/98 backdrop-blur-xl border-b-2 border-cyan-100 shadow-lg">
        <div className="max-w-screen-2xl mx-auto px-4 py-4">
          {/* Primera fila: Logo + Info + Cerrar */}
          <div className="flex items-center justify-between gap-4 mb-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-cyan-600 to-cyan-700 flex items-center justify-center shadow-lg shadow-cyan-500/30">
                <svg className="h-6 w-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                </svg>
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-800">Galería Completa</h1>
                <p className="text-xs text-slate-500">
                  {categoriaSeleccionada === "all" 
                    ? `${allProductos.length} productos` 
                    : `${filtered[0]?.items.length || 0} en ${filtered[0]?.nombre || ''}`}
                </p>
              </div>
            </div>
            
            <button
              onClick={() => setFullscreenMode(false)}
              className="flex-shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-slate-200 bg-white text-slate-700 font-bold text-sm transition-all duration-200 hover:bg-slate-50 hover:border-slate-300 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500"
              aria-label="Cerrar galería completa (ESC)"
            >
              <CloseIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Cerrar</span>
              <kbd className="hidden md:inline-flex px-2 py-0.5 text-xs bg-slate-100 rounded border border-slate-300">ESC</kbd>
            </button>
          </div>
          
          {/* Segunda fila: Categorías con scroll visible */}
          <div className="relative">
            {/* Indicadores de scroll mejorados */}
            <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-white via-white/80 to-transparent pointer-events-none z-10 rounded-l-xl" />
            <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-white via-white/80 to-transparent pointer-events-none z-10 rounded-r-xl" />
            
            <div 
              className="flex gap-2 overflow-x-auto scroll-smooth scrollbar-thin pb-2 px-1"
            >
              <button
                onClick={() => setCategoriaSeleccionada("all")}
                className={`flex-shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all duration-200 whitespace-nowrap border-2 ${
                  categoriaSeleccionada === "all"
                    ? "bg-gradient-to-br from-cyan-600 to-cyan-700 text-white border-cyan-600 shadow-lg shadow-cyan-500/30"
                    : "bg-white hover:bg-cyan-50 text-slate-700 border-slate-200 hover:border-cyan-300 hover:shadow-md"
                }`}
              >
                Todo
                <span className={`inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-md text-xs font-extrabold ${
                  categoriaSeleccionada === "all" ? "bg-white/25 text-white" : "bg-slate-100 text-slate-600"
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
                    className={`flex-shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all duration-200 whitespace-nowrap border-2 ${
                      categoriaSeleccionada === c.id
                        ? "bg-gradient-to-br from-cyan-600 to-cyan-700 text-white border-cyan-600 shadow-lg shadow-cyan-500/30"
                        : "bg-white hover:bg-cyan-50 text-slate-700 border-slate-200 hover:border-cyan-300 hover:shadow-md"
                    }`}
                  >
                    {c.nombre}
                    <span className={`inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-md text-xs font-extrabold ${
                      categoriaSeleccionada === c.id ? "bg-white/25 text-white" : "bg-slate-100 text-slate-600"
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
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
    aria-label={`${label}${count !== undefined ? ` (${count} productos)` : ''}`}
    className={`group flex-shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all duration-200 whitespace-nowrap border-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2
      ${
        active
          ? "bg-cyan-600 text-white border-cyan-600 shadow-lg shadow-cyan-500/30 scale-[1.05]"
          : "bg-white hover:bg-cyan-50 text-slate-700 border-slate-200 hover:border-cyan-300 hover:shadow-md hover:scale-[1.02] active:scale-[0.98]"
      }
    `}
  >
    {label}
    {count !== undefined && (
      <span className={`inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-md text-xs font-extrabold transition-colors ${
        active 
          ? "bg-white/25 text-white" 
          : "bg-slate-100 text-slate-600 group-hover:bg-cyan-100 group-hover:text-cyan-700"
      }`}>
        {count}
      </span>
    )}
  </button>
);

export default GaleriaHelados;
