import { useEffect, useMemo, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { detalleVentaService } from '../../../../../services/detalle-venta.service';
import type {
  DetalleVenta,
  CreateDetalleVentaDto,
  UpdateDetalleVentaDto,
} from '../../../../../models/detalle-venta.model';
import type { Producto } from '../../../../../models/Producto';
// Ajuste de stock ahora lo maneja el backend de forma transaccional
import { productService } from '../../../../../services/producto.service';
import { ventaService } from '../../../../../services/venta.service';
import toast from 'react-hot-toast';
import { isApiErrorResponse } from '../../../../../services/api.service';

interface Props {
  ventaId: number;
  ventaInfo?: { cliente?: string | null; metodo?: string; fecha?: string | null; total?: number | string | null };
  abierto: boolean;
  onCerrar: () => void;
}

const currency = (v: number | string) =>
  new Intl.NumberFormat('es-BO', { style: 'currency', currency: 'BOB' }).format(
    typeof v === 'string' ? Number(v) : v,
  );

export default function PanelDetallesVenta({ ventaId, ventaInfo, abierto, onCerrar }: Props) {
  const qc = useQueryClient();
  const [modalAdd, setModalAdd] = useState(false);
  const [editTarget, setEditTarget] = useState<DetalleVenta | null>(null);

  const { data: detalles, isLoading, error, refetch, isFetching } = useQuery<DetalleVenta[], Error>({
    queryKey: ['detalles-ventas', 'venta', ventaId],
    queryFn: async () => {
      const all = await detalleVentaService.getDetalles();
      return all.filter((d) => d.ventaId === ventaId);
    },
    staleTime: 60_000,
    refetchOnWindowFocus: false,
    enabled: abierto,
  });

  const suma = useMemo(() => (detalles || []).reduce((acc, d) => acc + (Number(d.subtotal) || 0), 0), [detalles]);

  // Mantener sincronizado el total de la venta en el backend cuando cambian los detalles
  const prevSumaRef = useRef<number | null>(null);
  const updateTotalMut = useMutation({
    mutationFn: (total: number) => ventaService.updateVenta(ventaId, { total: round2(total) }),
    onSuccess: () => {
      // Refrescar la lista de ventas para mostrar el total actualizado
      qc.invalidateQueries({ queryKey: ['ventas'] });
      qc.invalidateQueries({ predicate: ({ queryKey }) => Array.isArray(queryKey) && queryKey[0] === 'reportes' });
    },
  });

  useEffect(() => {
    if (!abierto) return; // Solo cuando el panel está abierto
    if (detalles == null) return; // Esperar carga
    const current = round2(suma);
    if (prevSumaRef.current === null) {
      // Inicializar referencia sin disparar actualización si no cambió
      prevSumaRef.current = current;
      return;
    }
    if (prevSumaRef.current !== current) {
      prevSumaRef.current = current;
      updateTotalMut.mutate(current);
    }
  }, [abierto, detalles, suma, updateTotalMut]);

  const onDeleted = () => {
    qc.invalidateQueries({ queryKey: ['detalles-ventas', 'venta', ventaId] });
    // Si tu tabla Ventas muestra totales derivados, también invalida ventas
    qc.invalidateQueries({ queryKey: ['ventas'] });
    qc.invalidateQueries({ queryKey: ['productos'] });
    qc.invalidateQueries({ predicate: ({ queryKey }) => Array.isArray(queryKey) && queryKey[0] === 'reportes' });
  };

  const delMut = useMutation({
    mutationFn: async (id: number) => {
      await detalleVentaService.deleteDetalle(id);
    },
    onSuccess: () => {
      onDeleted();
      toast.success('Detalle eliminado');
    },
    onError: (error: unknown) => {
      if (isApiErrorResponse(error)) {
        toast.error(error.message || 'Error al eliminar');
        return;
      }
      if (error instanceof Error) {
        toast.error(error.message);
        return;
      }
      toast.error('Error al eliminar');
    },
  });

  if (!abierto) return null;

  return (
    <div className="fixed inset-0 z-[60] flex">
      <div className="flex-1 bg-black/40" onClick={onCerrar} />
      <div className="w-full max-w-3xl h-full bg-white shadow-xl border-l flex flex-col">
    <div className="p-4 border-b flex items-center justify-between">
          <div>
      <h3 className="text-lg font-semibold">Detalles de la venta</h3>
            <p className="text-sm text-gray-600">
              {ventaInfo?.fecha ? new Date(ventaInfo.fecha).toLocaleString('es-BO') : '-'} | {ventaInfo?.cliente || '-'} | {ventaInfo?.metodo || '-'} | Total: {currency(suma)}
            </p>
          </div>
          <button onClick={onCerrar} className="text-2xl text-gray-500 hover:text-gray-700" aria-label="Cerrar">×</button>
        </div>

        <div className="p-4 flex items-center gap-3 border-b">
          <button onClick={() => setModalAdd(true)} className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">+ Agregar detalle</button>
          <button onClick={() => refetch()} disabled={isFetching} className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">{isFetching ? 'Actualizando...' : 'Refrescar'}</button>
          <div className="ml-auto text-sm text-gray-700">Total líneas: <span className="font-semibold">{currency(suma)}</span></div>
        </div>

        <div className="p-4 overflow-auto">
          {isLoading ? (
            <div>Cargando detalles...</div>
          ) : error ? (
            <div className="text-red-600">Error: {error.message}</div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">#</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Producto</th>
                  <th className="px-4 py-2 text-right text-xs font-semibold text-gray-600">Cantidad</th>
                  <th className="px-4 py-2 text-right text-xs font-semibold text-gray-600">Precio</th>
                  <th className="px-4 py-2 text-right text-xs font-semibold text-gray-600">Subtotal</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {(detalles || []).map((d, i) => (
                  <tr key={d.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 text-sm text-gray-600">{i + 1}</td>
                    <td className="px-4 py-2 text-sm text-gray-800 flex items-center gap-3">
                      {d.producto?.imagenUrl ? (
                        <img src={d.producto.imagenUrl} alt={d.producto?.nombre || ''} className="w-10 h-10 rounded object-cover border" />
                      ) : (
                        <div className="w-10 h-10 rounded bg-gray-100 border" />
                      )}
                      <div>
                        <div className="font-medium">{d.producto?.nombre || `Producto`}</div>
                      </div>
                    </td>
                    <td className="px-4 py-2 text-sm text-right">{d.cantidad}</td>
                    <td className="px-4 py-2 text-sm text-right">{currency(d.precioUnitario)}</td>
                    <td className="px-4 py-2 text-sm text-right font-semibold">{currency(d.subtotal)}</td>
                    <td className="px-4 py-2 text-sm">
                      <div className="flex items-center gap-2">
                        <button onClick={() => setEditTarget(d)} className="px-3 py-1.5 text-xs rounded-md border bg-white hover:bg-gray-50">Editar</button>
                        <button onClick={() => delMut.mutate(d.id)} disabled={delMut.isPending} className="px-3 py-1.5 text-xs rounded-md border border-red-300 text-red-700 hover:bg-red-50">{delMut.isPending ? 'Eliminando...' : 'Eliminar'}</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {(detalles || []).length === 0 && !isLoading && !error && (
            <div className="text-center text-gray-600 py-8">Sin detalles aún. Agrega el primero.</div>
          )}
        </div>

        {modalAdd && (
          <ModalDetalle
            ventaId={ventaId}
            onClose={() => setModalAdd(false)}
            onSaved={() => {
              qc.invalidateQueries({ queryKey: ['detalles-ventas', 'venta', ventaId] });
              qc.invalidateQueries({ queryKey: ['ventas'] });
              qc.invalidateQueries({ predicate: ({ queryKey }) => Array.isArray(queryKey) && queryKey[0] === 'reportes' });
            }}
          />
        )}

        {editTarget && (
          <ModalDetalle
            ventaId={ventaId}
            detalle={editTarget}
            onClose={() => setEditTarget(null)}
            onSaved={() => {
              qc.invalidateQueries({ queryKey: ['detalles-ventas', 'venta', ventaId] });
              qc.invalidateQueries({ queryKey: ['ventas'] });
              qc.invalidateQueries({ predicate: ({ queryKey }) => Array.isArray(queryKey) && queryKey[0] === 'reportes' });
            }}
          />
        )}
      </div>
    </div>
  );
}

function round2(n: number) {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

function ModalDetalle({ ventaId, detalle, onClose, onSaved }: { ventaId: number; detalle?: DetalleVenta | null; onClose: () => void; onSaved: () => void; }) {
  const isEdit = !!detalle;
  const { data: productos } = useQuery<Producto[]>({
    queryKey: ['productos'],
    queryFn: productService.getProductos,
    staleTime: 120_000,
    refetchOnWindowFocus: false,
  });

  const [productoId, setProductoId] = useState<number>(detalle?.productoId || (productos?.[0]?.id ?? 0));
  const [cantidad, setCantidad] = useState<number>(detalle?.cantidad || 1);
  const [precio, setPrecio] = useState<number>(detalle?.precioUnitario || (productos ? Number(productos.find(p => p.id === productoId)?.precio || 0) : 0));

  // recalc precio si cambia producto y no estamos editando (para altas), o si el usuario aún no lo tocó
  const derivedPrecio = useMemo(() => {
    if (!productos) return precio;
    const base = productos.find(p => p.id === productoId);
    const parsed = Number(base?.precio || 0);
    return isEdit ? precio : parsed;
  }, [productos, productoId, precio, isEdit]);

  const subtotal = useMemo(() => round2((Number(derivedPrecio) || 0) * (Number(cantidad) || 0)), [derivedPrecio, cantidad]);

  const createMut = useMutation({
    mutationFn: async (data: CreateDetalleVentaDto) => detalleVentaService.createDetalle(data),
    onSuccess: () => {
      toast.success('Detalle agregado');
      onSaved();
      onClose();
    },
    onError: (error: unknown) => {
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
      if (isApiErrorResponse(error)) {
        toast.error(error.message || 'Error al crear');
        return;
      }
      if (error instanceof Error) {
        toast.error(error.message);
        return;
      }
      toast.error('Error al crear');
    },
  });
  const updateMut = useMutation({
    mutationFn: async (vars: { id: number; data: UpdateDetalleVentaDto }) =>
      detalleVentaService.updateDetalle(vars.id, vars.data),
    onSuccess: () => {
      toast.success('Detalle actualizado');
      onSaved();
      onClose();
    },
    onError: (error: unknown) => {
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
      if (isApiErrorResponse(error)) {
        toast.error(error.message || 'Error al actualizar');
        return;
      }
      if (error instanceof Error) {
        toast.error(error.message);
        return;
      }
      toast.error('Error al actualizar');
    },
  });

  const validar = () => {
    if (!ventaId) return 'Venta no válida';
    if (!productoId || productoId <= 0) return 'Producto inválido';
    if (!cantidad || cantidad < 1 || !Number.isInteger(Number(cantidad))) return 'Cantidad debe ser entero >= 1';
    if (derivedPrecio < 0) return 'Precio no puede ser negativo';
    if (subtotal < 0) return 'Subtotal inválido';
    return '';
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const msg = validar();
    if (msg) return toast.error(msg);
    const basePayload: CreateDetalleVentaDto = {
      ventaId,
      productoId: Number(productoId),
      cantidad: Number(cantidad),
      precioUnitario: round2(Number(derivedPrecio)),
      subtotal,
    };
    if (isEdit && detalle) {
      const updatePayload: UpdateDetalleVentaDto = { ...basePayload };
      updateMut.mutate({ id: detalle.id, data: updatePayload });
    } else {
      createMut.mutate(basePayload);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b sticky top-0 bg-white z-10">
          <h3 className="text-lg font-semibold">{isEdit ? 'Editar detalle' : 'Agregar detalle'}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl" aria-label="Cerrar">×</button>
        </div>
        <form onSubmit={onSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Producto</label>
            <select value={productoId} onChange={e => setProductoId(Number(e.target.value))} className="w-full px-3 py-2 border rounded-md bg-white">
              {(productos || []).map(p => (
                <option key={p.id} value={p.id}>{p.nombre}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cantidad</label>
              <input type="number" min={1} step={1} value={cantidad} onChange={e => setCantidad(Number(e.target.value))} className="w-full px-3 py-2 border rounded-md" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Precio unitario</label>
              <input
                type="number"
                min={0}
                step={0.01}
                value={derivedPrecio}
                onChange={(e) => {
                  const value = Number(e.target.value);
                  setPrecio(value);
                }}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subtotal</label>
              <input readOnly value={subtotal} className="w-full px-3 py-2 border rounded-md bg-gray-50" />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-5 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">Cancelar</button>
            <button type="submit" className="px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
              {isEdit ? 'Guardar cambios' : 'Agregar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
