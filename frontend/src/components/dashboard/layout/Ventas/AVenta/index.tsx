import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import apiService, { isApiErrorResponse } from '../../../../../services/api.service';
import { ventaService } from '../../../../../services/venta.service';
import type { MetodoPago, Venta, CreateVentaDto } from '../../../../../models/Venta';
import type { AuthUser } from '../../../../../models/auth.model';
import { useAuth } from '../../../../../context/useAuth';
import { productService } from '../../../../../services/producto.service';
import { detalleVentaService } from '../../../../../services/detalle-venta.service';
import type { Producto } from '../../../../../models/Producto';
import { mapEmpleadoToAuthUser } from '../../../../../helpers';

interface Props {
  abierto: boolean;
  onCerrar: () => void;
}

const metodoOptions: { value: MetodoPago; label: string }[] = [
  { value: 'efectivo', label: 'Efectivo' },
  { value: 'tarjeta', label: 'Tarjeta' },
  { value: 'transferencia', label: 'Transferencia' },
  { value: 'qr', label: 'QR' },
];

const AVenta = ({ abierto, onCerrar }: Props) => {
  const qc = useQueryClient();
  const { user: authUser, empleado: authEmpleado } = useAuth();
  const [perfil, setPerfil] = useState<AuthUser | null>(authEmpleado ? mapEmpleadoToAuthUser(authEmpleado) : authUser);
  const [cargandoPerfil, setCargandoPerfil] = useState(true);

  const [cliente, setCliente] = useState('');
  const [metodo, setMetodo] = useState<MetodoPago>('efectivo');
  const [notas, setNotas] = useState('');
  const [fechaVenta, setFechaVenta] = useState<string>(''); // ISO local via datetime-local

  // Detalles locales previos a crear la venta
  interface LineaLocal {
    id: string; // local
    productoId: number;
    productoNombre: string;
    productoImagenUrl?: string | null;
    precioUnitario: number;
    cantidad: number;
    subtotal: number;
  }
  const [detalles, setDetalles] = useState<LineaLocal[]>([]);
  const totalCalculado = useMemo(() => detalles.reduce((acc, d) => acc + Number(d.subtotal || 0), 0), [detalles]);
  const [modalDetalle, setModalDetalle] = useState(false);
  const [editLinea, setEditLinea] = useState<LineaLocal | null>(null);

  const uid = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  const eliminarLinea = (id: string) => setDetalles(prev => prev.filter(l => l.id !== id));
  const editarLinea = (l: LineaLocal) => setEditLinea(l);

  useEffect(() => {
    if (!abierto) return;
    // inicializar campos y cargar perfil
    setCliente('');
    setMetodo('efectivo');
    setNotas('');
    setDetalles([]);
    // poner fecha actual en input datetime-local (YYYY-MM-DDTHH:mm)
    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    const local = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
    setFechaVenta(local);

    setPerfil(authEmpleado ? mapEmpleadoToAuthUser(authEmpleado) : authUser);
    setCargandoPerfil(true);
    apiService
      .getProfile()
      .then(({ user }) => {
        setPerfil(mapEmpleadoToAuthUser(user));
      })
      .catch(() => {
        setPerfil(authEmpleado ? mapEmpleadoToAuthUser(authEmpleado) : authUser ?? null);
      })
      .finally(() => setCargandoPerfil(false));
  }, [abierto, authEmpleado, authUser]);

  const createMutation = useMutation({
    mutationFn: (payload: CreateVentaDto) => ventaService.createVenta(payload),
    onSuccess: async (ventaCreada: Venta) => {
      // Crear detalles si existen
      if (detalles.length > 0 && ventaCreada?.id) {
        try {
          // Crear detalles y acumular ajustes de stock
          await Promise.all(
            detalles.map(async (d) => {
              await detalleVentaService.createDetalle({
                ventaId: Number(ventaCreada.id),
                productoId: d.productoId,
                cantidad: d.cantidad,
                precioUnitario: Number(d.precioUnitario.toFixed(2)),
                subtotal: Number(d.subtotal.toFixed(2)),
              });
            }),
          );
        } catch (error: unknown) {
          if (isApiErrorResponse(error) && error.status === 409) {
            const payload = (error.json as Record<string, unknown> | null) ?? null;
            const code = typeof payload?.code === 'string' ? payload.code : undefined;
            if (code === 'stock_insuficiente') {
              const resolveValue = (key: 'disponible' | 'solicitado') => {
                if (!payload || !(key in payload)) return 'N/D';
                const value = payload[key];
                if (typeof value === 'number') return value.toString();
                if (typeof value === 'string') return value;
                return 'N/D';
              };
              toast.error(
                `Stock insuficiente: disponible ${resolveValue('disponible')}, solicitado ${resolveValue('solicitado')}`,
              );
              return;
            }
          }
          toast.error('Venta creada, pero algunos detalles fallaron. Puedes añadirlos luego en "Ver detalles".');
        }
      }
      qc.invalidateQueries({ queryKey: ['ventas'] });
      qc.invalidateQueries({ queryKey: ['detalles-ventas', 'venta', ventaCreada?.id] });
      qc.invalidateQueries({ queryKey: ['productos'] });
      qc.invalidateQueries({
        predicate: ({ queryKey }) => Array.isArray(queryKey) && queryKey[0] === 'reportes',
      });
      onCerrar();
      toast.success('Venta registrada');
    },
    onError: (error: unknown) => {
      const fallback = 'Error al registrar venta';
      if (isApiErrorResponse(error)) {
        toast.error(`${fallback}: ${error.message}`);
        return;
      }
      if (error instanceof Error) {
        toast.error(`${fallback}: ${error.message}`);
        return;
      }
      toast.error(`${fallback}: desconocido`);
    },
  });

  const validar = (): string => {
    if (!perfil?.id) return 'No se pudo obtener el empleado autenticado';
    if (detalles.length === 0) return 'Agrega al menos un detalle para calcular el total';
    if (!metodo) return 'Selecciona un método de pago';
    if (cliente.length > 100) return 'El nombre del cliente excede 100 caracteres';
    return '';
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const msg = validar();
    if (msg) return toast.error(msg);
    const totalNum = Number(totalCalculado.toFixed(2));
    // convertir datetime-local a ISO si hay valor; si backend ya setea automáticamente, igual enviamos para registrar explícito
    const fechaIso = fechaVenta ? new Date(fechaVenta).toISOString() : undefined;

    const payload: CreateVentaDto = {
      empleadoId: perfil!.id,
      clienteNombre: cliente ? cliente.trim() : null,
      metodoPago: metodo,
      total: totalNum,
      notas: notas ? notas.trim() : null,
      fechaVenta: fechaIso || null,
    };

    createMutation.mutate(payload);
  };

  if (!abierto) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl w-full max-w-3xl shadow-xl max-h-[90vh] flex flex-col">{/* ancho ampliado */}
          <div className="flex items-center justify-between px-6 py-4 border-b sticky top-0 bg-white z-10">
            <h3 className="text-lg font-semibold text-gray-900">Registrar venta</h3>
            <button onClick={onCerrar} className="text-gray-500 hover:text-gray-700 text-2xl" aria-label="Cerrar">×</button>
          </div>

          <div className="p-6 overflow-y-auto flex-1">
            <form id="form-venta" onSubmit={onSubmit} className="grid grid-cols-1 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Empleado</label>
                <input
                  value={perfil ? (perfil.nombre || authUser?.nombre || 'Empleado') : cargandoPerfil ? 'Cargando...' : 'No disponible'}
                  readOnly
                  className="w-full px-3 py-2 border rounded-md bg-gray-50 text-gray-700"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Total (calculado)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={totalCalculado.toFixed(2)}
                    readOnly
                    className="w-full px-3 py-2 border rounded-md bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Método de pago *</label>
                  <select
                    value={metodo}
                    onChange={(e) => setMetodo(e.target.value as MetodoPago)}
                    className="w-full px-3 py-2 border rounded-md bg-white"
                    required
                  >
                    {metodoOptions.map((op) => (
                      <option key={op.value} value={op.value}>{op.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cliente (opcional)</label>
                <input
                  value={cliente}
                  onChange={(e) => setCliente(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="Nombre del cliente"
                  maxLength={100}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de la venta</label>
                <input
                  type="datetime-local"
                  value={fechaVenta}
                  readOnly
                  tabIndex={-1}
                  aria-readonly
                  className="w-full px-3 py-2 border rounded-md bg-gray-50 text-gray-700 cursor-not-allowed pointer-events-none select-none"
                />
                <p className="mt-1 text-xs text-gray-500">Se establece automáticamente y se muestra solo como referencia.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
                <textarea
                  value={notas}
                  onChange={(e) => setNotas(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="Observaciones adicionales (opcional)"
                />
              </div>

              {/* Detalles de venta previos a finalizar */}
              <div className="border-t pt-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold">Detalles de la venta</h4>
                  <button type="button" onClick={() => setModalDetalle(true)} className="px-3 py-1.5 text-sm rounded-md border bg-white hover:bg-gray-50">+ Agregar helado</button>
                </div>
                {detalles.length === 0 ? (
                  <p className="text-sm text-gray-500">Aún no agregaste detalles. Agrega al menos uno para calcular el total.</p>
                ) : (
                  <div className="overflow-auto rounded border">
                    <table className="min-w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-3 py-2 text-left">Producto</th>
                          <th className="px-3 py-2 text-right">Cantidad</th>
                          <th className="px-3 py-2 text-right">Precio</th>
                          <th className="px-3 py-2 text-right">Subtotal</th>
                          <th className="px-3 py-2 text-left">Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {detalles.map((d) => (
                          <tr key={d.id} className="border-t">
                            <td className="px-3 py-2">
                              <div className="flex items-center gap-2">
                                {d.productoImagenUrl ? (
                                  <img src={d.productoImagenUrl} alt={d.productoNombre} className="h-10 w-10 rounded object-cover" />
                                ) : (
                                  <div className="h-10 w-10 rounded bg-gray-100 flex items-center justify-center text-gray-400 text-xs">No img</div>
                                )}
                                <span>{d.productoNombre}</span>
                              </div>
                            </td>
                            <td className="px-3 py-2 text-right">{d.cantidad}</td>
                            <td className="px-3 py-2 text-right">{Number(d.precioUnitario).toFixed(2)}</td>
                            <td className="px-3 py-2 text-right font-semibold">{Number(d.subtotal).toFixed(2)}</td>
                            <td className="px-3 py-2">
                              <button type="button" onClick={() => editarLinea(d)} className="px-2 py-1 text-xs rounded border bg-white hover:bg-gray-50 mr-2">Editar</button>
                              <button type="button" onClick={() => eliminarLinea(d.id)} className="px-2 py-1 text-xs rounded border border-red-300 text-red-700 hover:bg-red-50">Quitar</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="bg-gray-50">
                          <td className="px-3 py-2 font-medium" colSpan={3}>Total</td>
                          <td className="px-3 py-2 text-right font-semibold">{totalCalculado.toFixed(2)}</td>
                          <td />
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                )}
              </div>
            </form>
          </div>

          <div className="px-6 py-4 border-t sticky bottom-0 bg-white z-10 flex justify-end gap-3">
            <button type="button" onClick={onCerrar} className="px-5 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
              Cancelar
            </button>
            <button
              type="submit"
              form="form-venta"
              disabled={createMutation.isPending || cargandoPerfil || !perfil?.id || detalles.length === 0}
              className="px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-60"
            >
              {createMutation.isPending ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </div>
      </div>

      {/* Modal para agregar/editar detalles locales */}
      <AVentaDetalleModal
        abierto={modalDetalle || !!editLinea}
        onCerrar={() => { setModalDetalle(false); setEditLinea(null); }}
        onSave={(d) => {
          if (editLinea) {
            setDetalles(prev => prev.map(l => l.id === editLinea.id ? { ...l, ...d, subtotal: Number(d.subtotal.toFixed(2)) } : l));
            setEditLinea(null);
          } else {
            const existente = detalles.find(l => l.productoId === d.productoId);
            if (existente) {
              toast.error('Este producto ya está en la lista. Usa "Editar" para cambiar la cantidad.');
              setEditLinea(existente);
              setModalDetalle(false);
              return;
            }
            setDetalles(prev => [
              ...prev,
              {
                id: uid(),
                productoId: d.productoId,
                productoNombre: d.productoNombre,
                productoImagenUrl: d.productoImagenUrl,
                precioUnitario: d.precioUnitario,
                cantidad: d.cantidad,
                subtotal: d.subtotal,
              },
            ]);
            setModalDetalle(false);
          }
        }}
  inicial={editLinea ? { productoId: editLinea.productoId, precioUnitario: editLinea.precioUnitario, cantidad: editLinea.cantidad } : undefined}
      />
    </>
  );
};

export default AVenta;

// ------- Modal para agregar/editar una línea local -------
function AVentaDetalleModal({
  abierto,
  onCerrar,
  onSave,
  inicial,
}: {
  abierto: boolean;
  onCerrar: () => void;
  onSave: (d: {
    productoId: number;
    productoNombre: string;
    productoImagenUrl?: string | null;
    precioUnitario: number;
    cantidad: number;
    subtotal: number;
  }) => void;
  inicial?: { productoId: number; precioUnitario: number; cantidad: number };
}) {
  const { data: productos } = useQuery<Producto[]>({
    queryKey: ['productos'],
    queryFn: productService.getProductos,
    staleTime: 120_000,
    refetchOnWindowFocus: false,
  });

  const [productoId, setProductoId] = useState<number>(inicial?.productoId || (productos?.[0]?.id ?? 0));
  const basePrecio = useMemo(() => {
    const p = (productos || []).find(p => p.id === productoId);
    return Number(p?.precio || 0);
  }, [productos, productoId]);
  const [cantidad, setCantidad] = useState<number>(inicial?.cantidad || 1);
  const [precio, setPrecio] = useState<number>(inicial?.precioUnitario ?? basePrecio);

  // Mantener el precio sincronizado con el producto seleccionado (no editable manualmente)
  useEffect(() => {
    setPrecio(basePrecio);
  }, [basePrecio]);

  const subtotal = useMemo(() => Number(((precio || 0) * (cantidad || 0)).toFixed(2)), [precio, cantidad]);

  const validar = () => {
    if (!productoId) return 'Producto inválido';
    if (!cantidad || cantidad < 1 || !Number.isInteger(Number(cantidad))) return 'Cantidad debe ser entero >= 1';
    if (precio < 0) return 'Precio no puede ser negativo';
  const prod = (productos || []).find(p => p.id === productoId);
  if (prod && Number(cantidad) > Number(prod.stock)) return `Cantidad supera el stock disponible (${prod.stock})`;
    return '';
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const err = validar();
    if (err) return toast.error(err);
    const prod = (productos || []).find(p => p.id === productoId);
    onSave({
      productoId,
      productoNombre: prod?.nombre || 'Producto',
      productoImagenUrl: prod?.imagenUrl ?? null,
      precioUnitario: Number(precio.toFixed(2)),
      cantidad: Number(cantidad),
      subtotal: Number(subtotal.toFixed(2)),
    });
  };

  if (!abierto) return null;

  const prodSel = (productos || []).find(p => p.id === productoId);

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b sticky top-0 bg-white z-10">
          <h3 className="text-lg font-semibold">Agregar helado</h3>
          <button onClick={onCerrar} className="text-gray-500 hover:text-gray-700 text-2xl" aria-label="Cerrar">×</button>
        </div>
        <form onSubmit={onSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Producto</label>
            <select value={productoId} onChange={e => setProductoId(Number(e.target.value))} className="w-full px-3 py-2 border rounded-md bg-white">
              {(productos || []).map(p => (
                <option key={p.id} value={p.id}>{p.nombre}</option>
              ))}
            </select>
            {prodSel?.imagenUrl && (
              <div className="mt-2 flex items-center gap-2">
                <img src={prodSel.imagenUrl} alt={prodSel.nombre} className="h-14 w-14 rounded object-cover" />
                <span className="text-xs text-gray-500">Vista previa</span>
              </div>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cantidad</label>
              <input type="number" min={1} step={1} value={cantidad} onChange={e => setCantidad(Number(e.target.value))} className="w-full px-3 py-2 border rounded-md" />
              {prodSel && (
                <p className="mt-1 text-xs text-gray-500">Stock disponible: {prodSel.stock}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Precio unitario</label>
              <input
                type="text"
                value={precio}
                readOnly
                tabIndex={-1}
                aria-readonly
                className="w-full px-3 py-2 border rounded-md bg-gray-50 text-gray-700 cursor-not-allowed pointer-events-none select-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subtotal</label>
              <input
                readOnly
                disabled
                value={subtotal}
                className="w-full px-3 py-2 border rounded-md bg-gray-50 text-gray-700 cursor-not-allowed pointer-events-none select-none"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onCerrar} className="px-5 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">Cancelar</button>
            <button type="submit" className="px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Agregar</button>
          </div>
        </form>
      </div>
    </div>
  );
}


