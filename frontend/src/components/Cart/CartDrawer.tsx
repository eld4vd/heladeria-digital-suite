import { MdShoppingCart } from 'react-icons/md';
import { useState } from 'react';
import { useCarritoItems, useActualizarItem, useEliminarItem } from '../../hooks/useCarrito';
import CheckoutModal from "./CheckoutModal";
import toast from 'react-hot-toast';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { data, isLoading } = useCarritoItems();
  const actualizarItem = useActualizarItem();
  const eliminarItem = useEliminarItem();
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  const handleUpdateQuantity = (itemId: number, currentQuantity: number, change: number) => {
    const newQuantity = currentQuantity + change;
    if (newQuantity < 1) return;

    actualizarItem.mutate(
      { id: itemId, cantidad: newQuantity },
      {
        onError: () => {
          toast.error('Error al actualizar cantidad');
        },
      }
    );
  };

  const handleRemoveItem = (itemId: number) => {
    eliminarItem.mutate(itemId, {
      onSuccess: () => {
        toast.success('Producto eliminado del carrito');
      },
      onError: () => {
        toast.error('Error al eliminar producto');
      },
    });
  };

  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const count = data?.count ?? 0;

  return (
    <>
      {/* Overlay con animación */}
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-md z-50 transition-all duration-400 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Modal flotante centrado - Diseño tipo Recibo de Heladería */}
      <div
        className={`fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none transition-all duration-500 ${
          isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
      >
        <div
          className={`relative w-full max-w-2xl h-[85vh] max-h-[700px] pointer-events-auto transform transition-all duration-500 ${
            isOpen ? 'translate-y-0 rotate-0' : 'translate-y-8 -rotate-1'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Fondo con textura de papel y sombra premium */}
          <div className="h-full bg-gradient-to-br from-amber-50 via-orange-50 to-amber-50 rounded-3xl shadow-2xl relative overflow-hidden border-4 border-white">
            {/* Patrón de puntos decorativo */}
            <div className="absolute inset-0 opacity-[0.03]" style={{
              backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)',
              backgroundSize: '20px 20px'
            }} />
            
            {/* Borde perforado superior decorativo */}
            <div className="absolute top-0 left-0 right-0 h-6 bg-white rounded-t-3xl" style={{
              maskImage: 'radial-gradient(circle at 12px, transparent 6px, black 6px)',
              maskSize: '24px 100%',
              maskRepeat: 'repeat-x'
            }} />

            {/* Header compacto */}
            <div className="relative pt-5 pb-3 px-6 border-b-2 border-dashed border-amber-300">
              <button
                onClick={onClose}
                className="absolute top-3 right-4 p-1.5 hover:bg-amber-100 rounded-full transition-all duration-200 group"
                aria-label="Cerrar carrito"
              >
                <svg className="w-4 h-4 text-amber-800 group-hover:rotate-90 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl shadow-md transform -rotate-3">
                  <MdShoppingCart className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-900 to-orange-800">
                    Carrito
                  </h2>
                  {count > 0 && (
                    <span className="text-xs text-amber-700 font-semibold">
                      {count} {count === 1 ? 'producto' : 'productos'}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Content - Lista estilo recibo */}
            <div className="flex flex-col h-[calc(100%-75px)] relative">
              {/* Items List */}
              <div className="flex-1 overflow-y-auto px-6 py-3 space-y-2">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center h-full">
                  <div className="relative">
                    <div className="w-16 h-16 border-4 border-amber-200 border-t-cyan-500 rounded-full animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <MdShoppingCart className="h-6 w-6 text-cyan-600" />
                    </div>
                  </div>
                  <p className="mt-4 text-sm text-amber-800 font-medium">Cargando sabores...</p>
                </div>
              ) : items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full px-8">
                  <div className="relative mb-6">
                    <div className="w-24 h-24 bg-gradient-to-br from-amber-100 to-orange-100 rounded-full flex items-center justify-center">
                      <MdShoppingCart className="h-12 w-12 text-amber-400" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-cyan-500 rounded-full flex items-center justify-center transform rotate-12">
                      <span className="text-white text-xl">?</span>
                    </div>
                  </div>
                  <p className="text-lg font-bold text-amber-900 mb-2">¡Carrito vacío!</p>
                  <p className="text-sm text-amber-700 text-center leading-relaxed">
                    Explora nuestros deliciosos sabores y empieza a armar tu pedido perfecto
                  </p>
                </div>
              ) : (
                <>
                  {items.map((item) => (
                    <div key={item.id} className="relative group">
                      {/* Card de producto */}
                      <div className="relative bg-white/80 backdrop-blur-sm rounded-xl p-3 shadow-sm hover:shadow-md transition-all duration-200 border-l-4 border-cyan-500 group-hover:border-cyan-600">
                        <div className="flex gap-3 items-center">
                          {/* Imagen */}
                          <div className="relative flex-shrink-0">
                            <div className="w-16 h-16 bg-white p-1.5 rounded-lg shadow-md transform group-hover:scale-105 transition-transform">
                              <img
                                src={item.producto?.imagenUrl || '/placeholder-ice-cream.jpg'}
                                alt={item.producto?.nombre || 'Producto'}
                                className="w-full h-full rounded object-cover"
                              />
                            </div>
                          </div>

                          {/* Info del producto con más espacio */}
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-amber-900 text-base leading-tight truncate mb-1">
                              {item.producto?.nombre || 'Producto'}
                            </h3>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-mono text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
                                Bs. {item.producto?.precio.toFixed(2)}
                              </span>
                              <span className="text-xs text-amber-600 font-medium">× {item.cantidad}</span>
                            </div>
                          </div>

                          {/* Controles más espaciados */}
                          <div className="flex items-center gap-3">
                            <div className="inline-flex items-center bg-gradient-to-r from-amber-100 to-orange-100 rounded-full p-1 shadow-sm">
                              <button
                                onClick={() => handleUpdateQuantity(item.id, item.cantidad, -1)}
                                disabled={item.cantidad <= 1 || actualizarItem.isPending}
                                className="w-7 h-7 flex items-center justify-center hover:bg-white rounded-full disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                                aria-label="Disminuir cantidad"
                              >
                                <svg className="w-3.5 h-3.5 text-amber-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M20 12H4" />
                                </svg>
                              </button>
                              
                              <span className="w-8 text-center font-bold text-sm text-amber-900">
                                {item.cantidad}
                              </span>
                              
                              <button
                                onClick={() => handleUpdateQuantity(item.id, item.cantidad, 1)}
                                disabled={actualizarItem.isPending}
                                className="w-7 h-7 flex items-center justify-center hover:bg-white rounded-full disabled:opacity-40 transition-all"
                                aria-label="Aumentar cantidad"
                              >
                                <svg className="w-3.5 h-3.5 text-amber-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
                                </svg>
                              </button>
                            </div>

                            <button
                              onClick={() => handleRemoveItem(item.id)}
                              disabled={eliminarItem.isPending}
                              className="w-7 h-7 flex items-center justify-center text-red-600 hover:bg-red-50 rounded-full transition-all"
                              aria-label="Eliminar producto"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>

                          {/* Precio total más destacado */}
                          <div className="text-right flex-shrink-0 min-w-[80px]">
                            <p className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-br from-amber-900 to-orange-800 leading-none">
                              {item.subtotal.toFixed(2)}
                            </p>
                            <p className="text-[10px] text-amber-600 font-medium">Bolivianos</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>

              {/* Footer compacto */}
              {items.length > 0 && (
                <div className="relative px-6 pb-4 pt-3">
                  {/* Línea punteada de corte */}
                  <div className="absolute top-0 left-0 right-0 h-px border-t-2 border-dashed border-amber-300" />
                  
                  {/* Semicírculos decorativos */}
                  <div className="absolute -left-3 top-0 w-6 h-6 bg-white rounded-full transform -translate-y-1/2" />
                  <div className="absolute -right-3 top-0 w-6 h-6 bg-white rounded-full transform -translate-y-1/2" />

                  {/* Total simple */}
                  <div className="flex justify-between items-center mb-3 mt-2">
                    <div>
                      <p className="text-xs text-amber-600 font-medium mb-0.5">{count} productos</p>
                      <div className="flex items-baseline gap-1">
                        <span className="text-sm text-amber-700 font-semibold">Bs.</span>
                        <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-900 to-orange-800">
                          {total.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Botón de pago */}
                  <button
                    onClick={() => setIsCheckoutOpen(true)}
                    disabled={actualizarItem.isPending || eliminarItem.isPending}
                    className="group relative w-full bg-gradient-to-r from-cyan-500 via-blue-600 to-cyan-500 hover:from-cyan-600 hover:via-blue-700 hover:to-cyan-600 text-white font-bold py-3.5 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
                  >
                    {/* Efecto de brillo animado */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
                    
                    <div className="relative flex items-center justify-center gap-2.5">
                      <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      <span className="text-base tracking-wide">Confirmar Pedido</span>
                      <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </div>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        onSuccess={() => {
          setIsCheckoutOpen(false);
          onClose();
        }}
      />
    </>
  );
}
