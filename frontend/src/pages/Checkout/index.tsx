import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart as useCartContext } from '../../context/CartContext';
import { useCarritoItems, useCheckout } from '../../hooks/useCarrito';
import toast from 'react-hot-toast';

const Checkout = () => {
  const navigate = useNavigate();
  const { carritoId } = useCartContext();
  const { data, isLoading } = useCarritoItems();
  const checkout = useCheckout();
  const [mostrarOverlay, setMostrarOverlay] = useState(false);
  const [metodoPago, setMetodoPago] = useState<'qr' | 'debito'>('qr');
  const [mesa, setMesa] = useState<string>(() => `M${Math.floor(Math.random() * 5) + 1}`);

  const items = data?.items || [];
  const total = data?.total || 0;

  const handleCheckout = async () => {
    if (!carritoId) {
      toast.error('No hay carrito activo');
      return;
    }

    try {
      await checkout.mutateAsync({
        metodoPago,
      });

      toast.success('¡Pedido procesado exitosamente!');
      setMostrarOverlay(true);
      setTimeout(() => {
        navigate('/menu');
      }, 2300);
    } catch (e: any) {
      toast.error(e?.message || 'Error al procesar el pedido');
    }
  };

  return (
    <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <h1 className="text-2xl font-bold mb-4">Checkout</h1>
      
      <div className="mb-4 text-sm text-gray-600">
        Mesa asignada: <span className="font-semibold">{mesa}</span>{' '}
        <button 
          onClick={() => setMesa(`M${Math.floor(Math.random() * 5) + 1}`)} 
          className="ml-2 text-xs px-2 py-1 border rounded hover:bg-gray-50"
        >
          Cambiar
        </button>
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-gray-600">Cargando carrito...</div>
      ) : items.length > 0 ? (
        <>
          <ul className="divide-y divide-gray-200">
            {items.map((item) => {
              const precioUnitario = item.producto?.precio || (item.subtotal / item.cantidad);
              return (
                <li key={item.id} className="py-3 flex items-center gap-3">
                  <div className="w-14 h-14 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                    {item.producto?.imagenUrl ? (
                      <img 
                        src={item.producto.imagenUrl} 
                        alt={item.producto.nombre} 
                        className="w-full h-full object-cover" 
                        onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} 
                      />
                    ) : null}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{item.producto?.nombre || `Producto #${item.productoId}`}</div>
                    <div className="text-sm text-gray-600">{item.cantidad} x {precioUnitario.toFixed(2)} Bs</div>
                  </div>
                  <div className="font-semibold">{item.subtotal.toFixed(2)} Bs</div>
                </li>
              );
            })}
          </ul>

          <div className="mt-4 flex items-center justify-between text-lg border-t pt-4">
            <span className="font-semibold">Total</span>
            <span className="font-bold text-emerald-600">{total.toFixed(2)} Bs</span>
          </div>

          <div className="mt-6 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Método de pago</label>
              <div className="flex gap-3">
                <button
                  onClick={() => setMetodoPago('qr')}
                  className={`flex-1 px-4 py-2 border rounded-md transition ${
                    metodoPago === 'qr' 
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-700 font-medium' 
                      : 'bg-white hover:bg-gray-50'
                  }`}
                >
                  � QR
                </button>
                <button
                  onClick={() => setMetodoPago('debito')}
                  className={`flex-1 px-4 py-2 border rounded-md transition ${
                    metodoPago === 'debito' 
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-700 font-medium' 
                      : 'bg-white hover:bg-gray-50'
                  }`}
                >
                  � Débito
                </button>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              disabled={checkout.isPending}
              className="w-full px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {checkout.isPending ? 'Procesando...' : 'Confirmar Pedido'}
            </button>
          </div>
        </>
      ) : (
        <div className="text-center py-8 text-gray-600">
          <p className="mb-4">Tu carrito está vacío</p>
          <a
            href="/menu"
            className="inline-block px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md"
          >
            Ver menú
          </a>
        </div>
      )}

      {mostrarOverlay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white/90 backdrop-blur-sm rounded-xl px-8 py-10 shadow-2xl text-center animate-fade-in">
            <div className="text-3xl mb-4">🍨</div>
            <h2 className="text-xl font-semibold mb-2">¡Pedido confirmado!</h2>
            <p className="text-sm text-gray-600 mb-4">Te redirigimos al menú...</p>
            <div className="w-40 h-1 bg-gray-200 rounded overflow-hidden mx-auto">
              <div className="h-full bg-emerald-500 animate-overlay-bar" />
            </div>
          </div>
        </div>
      )}

      {/* Animaciones utilitarias */}
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: scale(.95);} to { opacity:1; transform: scale(1);} }
        .animate-fade-in { animation: fadeIn .35s ease forwards; }
        @keyframes overlayBar { from { transform: translateX(-100%);} to { transform: translateX(0);} }
        .animate-overlay-bar { animation: overlayBar 2.2s linear forwards; }
      `}</style>
    </div>
  );
};

export default Checkout;
