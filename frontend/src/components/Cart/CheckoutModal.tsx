import { useState } from 'react';
import { useCheckout } from '../../hooks/useCarrito';
import toast from 'react-hot-toast';
import type { CheckoutCarritoDto } from '../../services/carrito.service';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CheckoutModal({ isOpen, onClose, onSuccess }: CheckoutModalProps) {
  const [step, setStep] = useState<'method' | 'form' | 'processing'>('method');
  const [paymentMethod, setPaymentMethod] = useState<'qr' | 'debito' | null>(null);
  const [formData, setFormData] = useState({
    clienteNombre: '',
    direccionEntrega: '',
    telefono: '',
    numeroTarjeta: '',
    nombreTitular: '',
    cvv: '',
  });

  const checkout = useCheckout();

  if (!isOpen) return null;

  const handleMethodSelect = (method: 'qr' | 'debito') => {
    setPaymentMethod(method);
    setStep('form');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!paymentMethod) return;

    const checkoutData: CheckoutCarritoDto = {
      metodoPago: paymentMethod,
      clienteNombre: formData.clienteNombre || undefined,
      direccionEntrega: formData.direccionEntrega || undefined,
      telefono: formData.telefono || undefined,
    };

    if (paymentMethod === 'debito') {
      checkoutData.datosTarjeta = {
        numeroTarjeta: formData.numeroTarjeta,
        nombreTitular: formData.nombreTitular,
        cvv: formData.cvv,
      };
    }

    setStep('processing');

    checkout.mutate(checkoutData, {
      onSuccess: () => {
        toast.success('¡Pedido confirmado! Llegará en 30 minutos 🍦', {
          duration: 5000,
          icon: '✅',
        });
        
        // Resetear estado
        setStep('method');
        setPaymentMethod(null);
        setFormData({
          clienteNombre: '',
          direccionEntrega: '',
          telefono: '',
          numeroTarjeta: '',
          nombreTitular: '',
          cvv: '',
        });

        onSuccess();
      },
      onError: (error) => {
        toast.error(error instanceof Error ? error.message : 'Error al procesar el pago');
        setStep('form');
      },
    });
  };

  const handleClose = () => {
    if (step !== 'processing') {
      setStep('method');
      setPaymentMethod(null);
      onClose();
    }
  };

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
        onClick={handleClose}
      >
        {/* Modal */}
        <div
          className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 rounded-t-2xl">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">
                {step === 'method' && '💳 Método de Pago'}
                {step === 'form' && (paymentMethod === 'qr' ? '📱 Pago con QR' : '💳 Pago con Débito')}
                {step === 'processing' && '⏳ Procesando...'}
              </h2>
              {step !== 'processing' && (
                <button
                  onClick={handleClose}
                  className="text-white/80 hover:text-white text-3xl"
                >
                  ×
                </button>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Step 1: Selección de método */}
            {step === 'method' && (
              <div className="space-y-4">
                <p className="text-gray-600 mb-6">
                  Selecciona tu método de pago preferido:
                </p>

                <button
                  onClick={() => handleMethodSelect('qr')}
                  className="w-full p-6 border-2 border-gray-200 rounded-xl hover:border-indigo-500 hover:bg-indigo-50 transition-all duration-200 group"
                >
                  <div className="flex items-center gap-4">
                    <div className="text-5xl">📱</div>
                    <div className="text-left">
                      <h3 className="font-bold text-lg group-hover:text-indigo-600">
                        Pago con QR
                      </h3>
                      <p className="text-sm text-gray-500">
                        Escanea el código QR con tu app bancaria
                      </p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => handleMethodSelect('debito')}
                  className="w-full p-6 border-2 border-gray-200 rounded-xl hover:border-purple-500 hover:bg-purple-50 transition-all duration-200 group"
                >
                  <div className="flex items-center gap-4">
                    <div className="text-5xl">💳</div>
                    <div className="text-left">
                      <h3 className="font-bold text-lg group-hover:text-purple-600">
                        Tarjeta de Débito
                      </h3>
                      <p className="text-sm text-gray-500">
                        Ingresa los datos de tu tarjeta
                      </p>
                    </div>
                  </div>
                </button>
              </div>
            )}

            {/* Step 2: Formulario */}
            {step === 'form' && (
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Información de entrega */}
                <div className="border-b pb-4">
                  <h3 className="font-semibold text-gray-700 mb-3">
                    Información de Entrega
                  </h3>

                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder="Tu nombre (opcional)"
                      value={formData.clienteNombre}
                      onChange={(e) =>
                        setFormData({ ...formData, clienteNombre: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />

                    <input
                      type="text"
                      placeholder="Dirección de entrega (opcional)"
                      value={formData.direccionEntrega}
                      onChange={(e) =>
                        setFormData({ ...formData, direccionEntrega: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />

                    <input
                      type="tel"
                      placeholder="Teléfono (opcional)"
                      value={formData.telefono}
                      onChange={(e) =>
                        setFormData({ ...formData, telefono: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Simulación de pago QR */}
                {paymentMethod === 'qr' && (
                  <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-xl">
                    <div className="text-center">
                      <p className="text-sm text-gray-600 mb-4">
                        Escanea este código QR con tu app bancaria:
                      </p>
                      <div className="bg-white p-6 rounded-lg inline-block">
                        <div className="w-48 h-48 bg-gray-200 flex items-center justify-center text-6xl">
                          📱
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mt-4">
                        (Simulación - No es un QR real)
                      </p>
                    </div>
                  </div>
                )}

                {/* Formulario de tarjeta */}
                {paymentMethod === 'debito' && (
                  <div className="space-y-3">
                    <h3 className="font-semibold text-gray-700">Datos de Tarjeta</h3>

                    <input
                      type="text"
                      placeholder="Número de tarjeta"
                      value={formData.numeroTarjeta}
                      onChange={(e) =>
                        setFormData({ ...formData, numeroTarjeta: e.target.value.replace(/\D/g, '').slice(0, 16) })
                      }
                      required
                      maxLength={16}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />

                    <input
                      type="text"
                      placeholder="Nombre del titular"
                      value={formData.nombreTitular}
                      onChange={(e) =>
                        setFormData({ ...formData, nombreTitular: e.target.value })
                      }
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />

                    <input
                      type="text"
                      placeholder="CVV"
                      value={formData.cvv}
                      onChange={(e) =>
                        setFormData({ ...formData, cvv: e.target.value.replace(/\D/g, '').slice(0, 3) })
                      }
                      required
                      maxLength={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />

                    <p className="text-xs text-gray-500 mt-2">
                      (Simulación - Datos no serán procesados)
                    </p>
                  </div>
                )}

                {/* Botones */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setStep('method')}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Volver
                  </button>

                  <button
                    type="submit"
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl font-semibold"
                  >
                    Confirmar Pedido
                  </button>
                </div>
              </form>
            )}

            {/* Step 3: Procesando */}
            {step === 'processing' && (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-200 border-t-indigo-600 mx-auto mb-4" />
                <p className="text-lg font-semibold text-gray-700">
                  Procesando tu pedido...
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Por favor espera un momento
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
