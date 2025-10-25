import { useState } from 'react';
import { useCarritoItems, useActualizarItem, useEliminarItem } from '../../hooks/useCarrito';
import { useCart } from '../../context/CartContext';

const MiniCart = () => {
  const { itemCount } = useCart();
  const { data, isLoading } = useCarritoItems();
  const actualizarItem = useActualizarItem();
  const eliminarItem = useEliminarItem();
  const [open, setOpen] = useState(false);

  const items = data?.items || [];
  const total = data?.total || 0;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/90 text-gray-800 hover:bg-white shadow"
        aria-label="Carrito"
        title="Carrito"
      >
        ���
        {itemCount > 0 && (
          <span className="absolute -top-1 -right-1 text-xs bg-red-500 text-white px-1.5 rounded-full">{itemCount}</span>
        )}
      </button>

      {open && (
        <div className="fixed inset-0 z-[100] bg-black/40 flex items-center justify-center p-4" onClick={() => setOpen(false)}>
          <div
            className="w-full max-w-2xl bg-white text-gray-800 rounded-2xl shadow-2xl p-4 sm:p-6"
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold">Tu carrito</h3>
              <button aria-label="Cerrar" className="text-gray-500 hover:text-gray-700" onClick={() => setOpen(false)}>✕</button>
            </div>

            {isLoading ? (
              <div className="text-sm text-gray-600 text-center py-4">Cargando...</div>
            ) : items.length > 0 ? (
              <ul className="divide-y divide-gray-200 max-h-[55vh] overflow-auto">
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
                        <div className="text-sm font-medium truncate">{item.producto?.nombre || `Producto #${item.productoId}`}</div>
                        <div className="text-xs text-gray-500">{item.cantidad} x {precioUnitario.toFixed(2)} Bs</div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button 
                          className="px-2 py-1 border rounded hover:bg-gray-50" 
                          onClick={() => {
                            const newQty = Math.max(1, item.cantidad - 1);
                            actualizarItem.mutate({ id: item.id, cantidad: newQty });
                          }}
                          disabled={actualizarItem.isPending}
                        >
                          -
                        </button>
                        <span className="px-2">{item.cantidad}</span>
                        <button 
                          className="px-2 py-1 border rounded hover:bg-gray-50" 
                          onClick={() => actualizarItem.mutate({ id: item.id, cantidad: item.cantidad + 1 })}
                          disabled={actualizarItem.isPending}
                        >
                          +
                        </button>
                      </div>
                      <button 
                        className="ml-2 text-red-600 hover:text-red-800" 
                        onClick={() => eliminarItem.mutate(item.id)}
                        disabled={eliminarItem.isPending}
                      >
                        ✕
                      </button>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="text-sm text-gray-600">
                <div>Tu carrito está vacío</div>
                <a
                  href="/menu"
                  className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-md"
                >
                  Ver menú y añadir
                </a>
              </div>
            )}

            <div className="mt-4 flex items-center justify-between text-base">
              <span className="font-semibold">Total</span>
              <span className="font-bold">{total.toFixed(2)} Bs</span>
            </div>
            <div className="mt-4 flex flex-wrap gap-2 justify-end">
              {items.length > 0 && (
                <a href="/checkout" className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md">Procesar</a>
              )}
              <button onClick={() => setOpen(false)} className="px-4 py-2 border rounded-md">Cerrar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MiniCart;
