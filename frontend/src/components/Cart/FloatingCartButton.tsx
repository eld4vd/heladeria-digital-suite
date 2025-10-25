import { MdShoppingCart } from 'react-icons/md';
import { useState } from 'react';
import { useCart } from '../../context/CartContext';
import CartDrawer from './CartDrawer';

export default function FloatingCartButton() {
  const { itemCount } = useCart();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  if (itemCount === 0) return null;

  return (
    <>
      <button
        onClick={() => setIsDrawerOpen(true)}
        className="fixed bottom-6 right-6 z-50 group"
        aria-label="Ver carrito"
      >
        <div className="relative">
          {/* Badge de contador */}
          <div className="absolute -top-2 -right-2 bg-gradient-to-br from-rose-500 to-pink-600 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center shadow-lg animate-pulse z-10">
            {itemCount}
          </div>

          {/* Botón circular con gradiente */}
          <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-4 rounded-full shadow-2xl group-hover:shadow-indigo-500/50 transition-all duration-300 group-hover:scale-110 relative z-0">
            <MdShoppingCart className="h-6 w-6 text-white" />
          </div>

          {/* Glow effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-400 to-pink-400 rounded-full blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-300 -z-10" />
        </div>
      </button>

      <CartDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
    </>
  );
}
