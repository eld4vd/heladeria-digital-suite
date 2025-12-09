import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ventaService } from "../../../../services/venta.service";
import type { Venta, MetodoPago } from "../../../../models/Venta";
import AVenta from "./AVenta";
import PanelDetallesVenta from "./DetallesVenta/Panel";

const currency = (v: number | string) =>
  new Intl.NumberFormat("es-BO", { style: "currency", currency: "BOB" }).format(
    typeof v === "string" ? Number(v) : v
  );

const pagoLabel: Record<MetodoPago, string> = {
  efectivo: "Efectivo",
  tarjeta: "Tarjeta",
  transferencia: "Transferencia",
  qr: "QR",
};

const Ventas = () => {
  const qc = useQueryClient();
  const [busqueda, setBusqueda] = useState("");
  const [metodo, setMetodo] = useState<"" | MetodoPago>("");
  const [modalNueva, setModalNueva] = useState(false);
  const [ventaSeleccionada, setVentaSeleccionada] = useState<Venta | null>(
    null
  );

  const { data, isLoading, error, refetch, isFetching } = useQuery<
    Venta[],
    Error
  >({
    queryKey: ["ventas"],
    queryFn: ventaService.getVentas,
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const ventas = useMemo(() => data ?? [], [data]);

  // Filtrar solo ventas del día actual (zona horaria local)
  const todayKey = new Date().toLocaleDateString("en-CA"); // YYYY-MM-DD
  const ventasDelDia = useMemo(
    () =>
      ventas.filter((v) =>
        v.fechaVenta
          ? new Date(v.fechaVenta).toLocaleDateString("en-CA") === todayKey
          : false
      ),
    [ventas, todayKey]
  );

  const lista = useMemo(() => {
      return ventasDelDia
        .filter((v) =>
          [v.id, v.clienteNombre || "", v.notas || "", v.metodoPago, v.total]
          .join(" ")
          .toString()
          .toLowerCase()
          .includes(busqueda.toLowerCase())
      )
      .filter((v) => (metodo ? v.metodoPago === metodo : true));
  }, [ventasDelDia, busqueda, metodo]);

  // Exportar PDF removido a petición: si se requiere de nuevo, implementar aquí con import("jspdf")/import("jspdf-autotable") bajo demanda.

  if (isLoading) {
    return <div className="p-6 text-sm text-slate-500">Cargando ventas...</div>;
  }
  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-600">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span>Error al cargar ventas: {error.message}</span>
          <button
            onClick={() => refetch()}
            className="inline-flex items-center justify-center rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-100"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="w-full space-y-7">
        <div className="flex flex-col gap-3 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 shadow-lg shadow-indigo-500/30">
              <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Ventas de Hoy</h2>
              <p className="text-xs text-slate-500">
                {new Date().toLocaleDateString("es-BO", { day: "numeric", month: "short" })} · {lista.length} {lista.length === 1 ? 'transacción' : 'transacciones'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => refetch()}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-60"
              disabled={isFetching}
            >
              <svg className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {isFetching ? "..." : "Refrescar"}
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-3 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:flex-row sm:items-end sm:justify-between">
          <div className="w-full sm:max-w-sm">
            <label className="block text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
              Buscar
            </label>
            <input
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Cliente, notas o monto"
              className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-100"
            />
          </div>
          <div className="w-full sm:max-w-xs">
            <label className="block text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
              Método de pago
            </label>
            <select
              value={metodo}
              onChange={(e) => setMetodo((e.target.value || "") as MetodoPago | "")}
              className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-100"
            >
              <option value="">Todos</option>
              <option value="efectivo">Efectivo</option>
              <option value="tarjeta">Tarjeta</option>
              <option value="transferencia">Transferencia</option>
              <option value="qr">QR</option>
            </select>
          </div>
          <button
            onClick={() => setModalNueva(true)}
            className="inline-flex items-center justify-center rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
          >
            + Nueva venta
          </button>
        </div>

        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
              <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  #
                </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Fecha
                </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Cliente
                </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Método
                </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Total
                </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Notas
                </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Acciones
                </th>
              </tr>
            </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {lista.map((v, idx) => {
                  return (
                    <tr key={v.id} className="transition hover:bg-slate-50">
                      <td className="px-4 py-3 text-sm font-semibold text-slate-600">
                        {idx + 1}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-700">
                        {v.fechaVenta
                          ? new Date(v.fechaVenta).toLocaleString("es-BO", {
                              year: "numeric",
                              month: "2-digit",
                              day: "2-digit",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "-"}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-700">
                        {v.clienteNombre || "-"}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                          {pagoLabel[v.metodoPago]}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-sm font-semibold text-slate-900">
                        {currency(v.total)}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-500">
                        <span className="line-clamp-1">{v.notas || ""}</span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <button
                          onClick={() => setVentaSeleccionada(v)}
                          className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600"
                        >
                          Ver detalles
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {lista.length === 0 && (
          <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500 shadow-sm">
            No hay ventas para mostrar.
          </div>
        )}
      </div>
      {/* Modal: crear venta */}
      <AVenta abierto={modalNueva} onCerrar={() => setModalNueva(false)} />
      {/* Panel: detalles de la venta seleccionada */}
      <PanelDetallesVenta
        abierto={!!ventaSeleccionada}
        ventaId={ventaSeleccionada?.id || 0}
        ventaInfo={{
          cliente: ventaSeleccionada?.clienteNombre ?? null,
          metodo: pagoLabel[ventaSeleccionada?.metodoPago || "efectivo"],
          fecha: ventaSeleccionada?.fechaVenta ?? null,
          total: ventaSeleccionada?.total ?? null,
        }}
        onCerrar={() => {
          setVentaSeleccionada(null);
          qc.invalidateQueries({ queryKey: ["ventas"] });
        }}
      />
    </>
  );
};

export default Ventas;
