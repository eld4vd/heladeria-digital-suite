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
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-96 bg-white shadow-2xl z-50 transform transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MdShoppingCart className="h-6 w-6" />
            <h2 className="text-xl font-bold">Mi Carrito</h2>
            {count > 0 && (
              <span className="bg-white/20 px-2 py-1 rounded-full text-sm">
                {count} {count === 1 ? 'item' : 'items'}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/20 rounded-full transition-colors"
            aria-label="Cerrar carrito"
          >
            <span className="text-2xl">×</span>
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-col h-[calc(100%-64px)]">
          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-4">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-200 border-t-indigo-600" />
              </div>
            ) : items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <MdShoppingCart className="h-20 w-20 mb-4" />
                <p className="text-lg font-medium">Tu carrito está vacío</p>
                <p className="text-sm mt-2">¡Agrega tus helados favoritos!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="bg-gray-50 rounded-lg p-3 border border-gray-200 hover:border-indigo-300 transition-colors"
                  >
                    <div className="flex gap-3">
                      {/* Imagen */}
                      <img
                        src={item.producto?.imagenUrl || '/placeholder-ice-cream.jpg'}
                        alt={item.producto?.nombre || 'Producto'}
                        className="w-20 h-20 rounded-lg object-cover"
                      />

                      {/* Info */}
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800">
                          {item.producto?.nombre || 'Producto'}
                        </h3>
                        <p className="text-sm text-gray-600">
                          Bs. {item.producto?.precio.toFixed(2)}
                        </p>

                        {/* Controls */}
                        <div className="flex items-center gap-2 mt-2">
                          <button
                            onClick={() =>
                              handleUpdateQuantity(item.id, item.cantidad, -1)
                            }
                            disabled={item.cantidad <= 1 || actualizarItem.isPending}
                            className="p-1 bg-gray-200 hover:bg-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <span className="text-lg">−</span>
                          </button>

                          <span className="w-8 text-center font-semibold">
                            {item.cantidad}
                          </span>

                          <button
                            onClick={() =>
                              handleUpdateQuantity(item.id, item.cantidad, 1)
                            }
                            disabled={actualizarItem.isPending}
                            className="p-1 bg-gray-200 hover:bg-gray-300 rounded disabled:opacity-50"
                          >
                            <span className="text-lg">+</span>
                          </button>

                          <button
                            onClick={() => handleRemoveItem(item.id)}
                            disabled={eliminarItem.isPending}
                            className="ml-auto p-1 text-red-500 hover:bg-red-50 rounded"
                          >
                            <span className="text-lg">🗑️</span>
                          </button>
                        </div>
                      </div>

                      {/* Subtotal */}
                      <div className="text-right">
                        <p className="font-bold text-indigo-600">
                          Bs. {item.subtotal.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer con Total y Botón de Pago */}
          {items.length > 0 && (
            <div className="border-t border-gray-200 p-4 bg-gray-50">
              <div className="flex justify-between items-center mb-4">
                <span className="text-lg font-semibold text-gray-700">Total:</span>
                <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Bs. {total.toFixed(2)}
                </span>
              </div>

              <button
                onClick={() => setIsCheckoutOpen(true)}
                disabled={actualizarItem.isPending || eliminarItem.isPending}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="text-xl">💳</span>
                Proceder al Pago
              </button>
            </div>
          )}
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
