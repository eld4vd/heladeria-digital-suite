import type { ReactNode } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useProducto } from '../../hooks/useProducto';
import useCategorias from '../../hooks/useCategorias';

const Detalle = () => {
  const { id } = useParams<{ id: string }>();
  const numericId = id ? Number(id) : undefined;
  const { data: producto, isLoading, error, refetch } = useProducto(numericId);
  const { data: categorias, isLoading: loadingCategorias } = useCategorias();

  const categoriaNombre = producto
    ? producto.categoria.nombre
      ?? categorias?.byId[producto.categoria.id ?? -1]?.nombre
      ?? (loadingCategorias ? 'Cargando…' : '')
    : '';

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-6 lg:px-8 py-6 md:py-10">
      {/* Breadcrumb */}
      <nav className="text-xs mb-4 flex items-center gap-1 text-gray-500" aria-label="Breadcrumb">
        <Link to="/menu" className="hover:text-cyan-600 transition-colors">Menú</Link>
        <span>/</span>
        {producto ? (
          <span className="text-gray-700 font-medium truncate max-w-[200px]" title={producto.nombre}>{producto.nombre}</span>
        ) : (
          <span className="text-gray-400">Detalle</span>
        )}
      </nav>

      {isLoading && (
        <div className="flex flex-col md:flex-row gap-8 animate-pulse">
          <div className="flex-1 aspect-[4/3] bg-slate-200 rounded-xl" />
          <div className="flex-1 space-y-4">
            <div className="h-8 w-2/3 bg-slate-200 rounded" />
            <div className="h-4 w-1/2 bg-slate-100 rounded" />
            <div className="h-4 w-5/6 bg-slate-100 rounded" />
            <div className="h-4 w-4/6 bg-slate-100 rounded" />
            <div className="h-24 w-full bg-slate-100 rounded" />
          </div>
        </div>
      )}

      {error && !isLoading && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center space-y-4">
          <p className="text-red-600 font-semibold">No se pudo cargar el producto.</p>
          <button onClick={() => refetch()} className="px-4 py-2 text-sm bg-cyan-600 text-white rounded-lg shadow hover:bg-cyan-700 transition-all">Reintentar</button>
        </div>
      )}

      {producto && !isLoading && (
        <div className="flex flex-col md:flex-row gap-8 lg:gap-12">
          {/* Imagen destacada */}
          <div className="flex-1">
            <div className="relative group rounded-xl overflow-hidden bg-white border border-slate-200 shadow-md">
              <img
                src={producto.imagenUrl || 'https://placehold.co/800x600/f3f4f6/9ca3af?text=Sin+Imagen'}
                alt={producto.nombre}
                width={800}
                height={600}
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover aspect-[4/3] md:aspect-[5/4] lg:aspect-[4/3] transition-transform duration-500 group-hover:scale-105"
                onError={(e) => { e.currentTarget.src = 'https://placehold.co/800x600/f3f4f6/9ca3af?text=Sin+Imagen'; }}
              />
              <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                {categoriaNombre && (
                  <span className="px-4 py-1 text-xs font-semibold rounded-lg bg-white/95 backdrop-blur text-cyan-700 border border-white/40 shadow-sm">
                    {categoriaNombre}
                  </span>
                )}
              </div>
            </div>
          </div>
          {/* Información amigable para cliente */}
          <div className="flex-1 flex flex-col gap-6">
            <header className="space-y-4">
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-800">{producto.nombre}</h1>
              <p className="text-base leading-relaxed text-slate-600 max-w-prose">
                {producto.descripcion || 'Disfruta de nuestro helado artesanal con textura cremosa y sabor auténtico, preparado con ingredientes cuidadosamente seleccionados.'}
              </p>
            </header>
            <section className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
              <InfoBadge label="Sabor" value={producto.sabor} />
              <InfoBadge label="Precio" value={`Bs ${Number(producto.precio).toFixed(2)}`} highlight />
              <InfoBadge label="Categoría" value={categoriaNombre || '—'} />
            </section>
            <div className="flex flex-wrap gap-3">
              <ActionButton variant="ghost" onClick={() => window.history.back()}>Volver al menú</ActionButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

interface InfoBadgeProps { label: string; value: string; highlight?: boolean; }
const InfoBadge = ({ label, value, highlight }: InfoBadgeProps) => {
  const base = 'flex flex-col p-3 rounded-lg border text-xs bg-white';
  const color = highlight
    ? 'border-emerald-200 bg-emerald-50'
    : 'border-slate-200';
  return (
    <div className={`${base} ${color}`}>
      <span className="font-medium text-slate-600 mb-0.5">{label}</span>
      <span className={`text-sm font-semibold ${highlight ? 'text-emerald-700' : 'text-slate-700'}`}>{value}</span>
    </div>
  );
};

type ActionButtonVariant = 'primary' | 'ghost';

interface ActionButtonProps {
  onClick?: () => void;
  children: ReactNode;
  variant?: ActionButtonVariant;
}

const ActionButton = ({ onClick, children, variant = 'primary' }: ActionButtonProps) => {
  const baseClasses = 'px-5 py-2.5 text-sm font-semibold rounded-lg border transition-all hover:shadow-md';
  const variantClasses =
    variant === 'ghost'
      ? 'border-slate-200 text-slate-700 bg-white hover:bg-slate-50'
      : 'border-transparent bg-cyan-600 text-white hover:bg-cyan-700';

  return (
    <button onClick={onClick} className={`${baseClasses} ${variantClasses}`}>
      {children}
    </button>
  );
};

export default Detalle;