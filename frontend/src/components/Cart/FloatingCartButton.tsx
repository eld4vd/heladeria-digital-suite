import { MdShoppingCart } from 'react-icons/md';
import { useState, useEffect, useRef } from 'react';
import { useCart } from '../../context/CartContext';
import CartDrawer from './CartDrawer';

export default function FloatingCartButton() {
  const { itemCount } = useCart();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const isFirstRender = useRef(true);

  // Asegurarse de que el drawer nunca se abra automáticamente
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    // No hacer nada cuando cambia itemCount - el drawer solo se abre manualmente
  }, [itemCount]);

  if (itemCount === 0) return null;

  return (
    <>
      <button
        onClick={() => setIsDrawerOpen(true)}
        className="fixed bottom-6 right-6 z-50 group"
        aria-label="Ver carrito"
      >
        <div className="relative">
          {/* Badge de contador estilo premium */}
          {itemCount > 0 && (
            <div className="absolute -top-2 -right-2 z-10">
              <div className="relative">
                {/* Pulso de fondo */}
                <div className="absolute inset-0 bg-gradient-to-br from-rose-400 to-pink-500 rounded-full animate-ping opacity-75" />
                {/* Badge principal */}
                <div className="relative bg-gradient-to-br from-rose-500 to-pink-600 text-white text-xs font-black rounded-full min-w-[24px] h-6 px-2 flex items-center justify-center shadow-lg border-2 border-white">
                  {itemCount}
                </div>
              </div>
            </div>
          )}

          {/* Botón principal con diseño único */}
          <div className="relative overflow-hidden">
            {/* Fondo con gradiente animado */}
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500 via-blue-600 to-indigo-600 rounded-2xl group-hover:scale-110 transition-transform duration-500" />
            
            {/* Brillo superior */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-2xl" />
            
            {/* Contenido del botón */}
            <div className="relative p-4 group-hover:scale-110 transition-transform duration-300">
              <MdShoppingCart className="h-7 w-7 text-white drop-shadow-lg" />
            </div>

            {/* Sombra y borde */}
            <div className="absolute inset-0 rounded-2xl shadow-xl group-hover:shadow-2xl transition-all duration-300 border border-white/20" />
          </div>

          {/* Texto flotante al hover */}
          <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none">
            <div className="bg-slate-900 text-white px-4 py-2 rounded-lg shadow-xl whitespace-nowrap font-semibold text-sm">
              Ver mi pedido
              <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 rotate-45 w-2 h-2 bg-slate-900" />
            </div>
          </div>
        </div>
      </button>

      <CartDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
    </>
  );
}
