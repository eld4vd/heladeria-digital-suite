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
        toast.success('¡Pedido confirmado! Llegará en 30 minutos', {
          duration: 5000,
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
          <div className="bg-slate-900 text-white p-6 rounded-t-2xl border-b border-slate-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {step === 'method' && (
                  <div className="p-2 bg-slate-800 rounded-lg">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                  </div>
                )}
                {step === 'form' && paymentMethod === 'qr' && (
                  <div className="p-2 bg-slate-800 rounded-lg">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                    </svg>
                  </div>
                )}
                {step === 'form' && paymentMethod === 'debito' && (
                  <div className="p-2 bg-slate-800 rounded-lg">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                  </div>
                )}
                {step === 'processing' && (
                  <div className="p-2 bg-slate-800 rounded-lg">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-slate-600 border-t-white" />
                  </div>
                )}
                <h2 className="text-xl font-bold">
                  {step === 'method' && 'Método de Pago'}
                  {step === 'form' && (paymentMethod === 'qr' ? 'Pago con QR' : 'Pago con Débito')}
                  {step === 'processing' && 'Procesando...'}
                </h2>
              </div>
              {step !== 'processing' && (
                <button
                  onClick={handleClose}
                  className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
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
                  className="w-full p-5 border-2 border-slate-200 rounded-xl hover:border-slate-900 hover:bg-slate-50 transition-all duration-200 group"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-slate-100 rounded-lg group-hover:bg-slate-900 transition-colors">
                      <svg className="w-8 h-8 text-slate-900 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                      </svg>
                    </div>
                    <div className="text-left">
                      <h3 className="font-bold text-lg text-slate-900">
                        Pago con QR
                      </h3>
                      <p className="text-sm text-slate-500">
                        Escanea el código con tu app bancaria
                      </p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => handleMethodSelect('debito')}
                  className="w-full p-5 border-2 border-slate-200 rounded-xl hover:border-slate-900 hover:bg-slate-50 transition-all duration-200 group"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-slate-100 rounded-lg group-hover:bg-slate-900 transition-colors">
                      <svg className="w-8 h-8 text-slate-900 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                    </div>
                    <div className="text-left">
                      <h3 className="font-bold text-lg text-slate-900">
                        Tarjeta de Débito
                      </h3>
                      <p className="text-sm text-slate-500">
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
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
                    />

                    <input
                      type="text"
                      placeholder="Dirección de entrega (opcional)"
                      value={formData.direccionEntrega}
                      onChange={(e) =>
                        setFormData({ ...formData, direccionEntrega: e.target.value })
                      }
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
                    />

                    <input
                      type="tel"
                      placeholder="Teléfono (opcional)"
                      value={formData.telefono}
                      onChange={(e) =>
                        setFormData({ ...formData, telefono: e.target.value })
                      }
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                {/* Simulación de pago QR */}
                {paymentMethod === 'qr' && (
                  <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                    <div className="text-center">
                      <p className="text-sm text-slate-600 mb-4 font-medium">
                        Escanea este código QR con tu app bancaria:
                      </p>
                      <div className="bg-white p-6 rounded-lg inline-block border-2 border-slate-300 shadow-sm">
                        <div className="w-48 h-48 bg-slate-100 flex items-center justify-center rounded-lg">
                          <svg className="w-32 h-32 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                          </svg>
                        </div>
                      </div>
                      <p className="text-xs text-slate-500 mt-4">
                        (Simulación - No es un QR real)
                      </p>
                    </div>
                  </div>
                )}

                {/* Formulario de tarjeta */}
                {paymentMethod === 'debito' && (
                  <div className="space-y-3">
                    <h3 className="font-semibold text-slate-700">Datos de Tarjeta</h3>

                    <input
                      type="text"
                      placeholder="Número de tarjeta"
                      value={formData.numeroTarjeta}
                      onChange={(e) =>
                        setFormData({ ...formData, numeroTarjeta: e.target.value.replace(/\D/g, '').slice(0, 16) })
                      }
                      required
                      maxLength={16}
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
                    />

                    <input
                      type="text"
                      placeholder="Nombre del titular"
                      value={formData.nombreTitular}
                      onChange={(e) =>
                        setFormData({ ...formData, nombreTitular: e.target.value })
                      }
                      required
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
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
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
                    />

                    <p className="text-xs text-slate-500 mt-2">
                      (Simulación - Datos no serán procesados)
                    </p>
                  </div>
                )}

                {/* Botones */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setStep('method')}
                    className="flex-1 px-4 py-3 border-2 border-slate-300 rounded-lg hover:bg-slate-50 transition-colors font-medium text-slate-700"
                  >
                    Volver
                  </button>

                  <button
                    type="submit"
                    className="flex-1 px-4 py-3 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl font-semibold"
                  >
                    Confirmar Pedido
                  </button>
                </div>
              </form>
            )}

            {/* Step 3: Procesando */}
            {step === 'processing' && (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-slate-200 border-t-slate-900 mx-auto mb-4" />
                <p className="text-lg font-semibold text-slate-900">
                  Procesando tu pedido...
                </p>
                <p className="text-sm text-slate-500 mt-2">
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
