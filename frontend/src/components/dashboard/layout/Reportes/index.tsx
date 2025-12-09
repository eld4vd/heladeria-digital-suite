import { Fragment, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../../../services/api.service';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { es } from 'date-fns/locale';
import { parseISO } from 'date-fns';
// Cargar jsPDF y autotable bajo demanda al exportar

type DiaCalendario = {
  date: string;
  ventasCount: number;
  importeTotal: number;
  itemsVendidos: number;
  empleadosUnicos: number;
};

interface VentaDetalle {
  id: number;
  fechaHora: string;
  total: number | string;
  estado: string;
  empleadoNombreSnapshot: string;
  detallesVentas?: Array<{
    id: number;
    productoId: number;
    cantidad: number;
    precioUnitario: number | string;
    subtotal: number | string;
    producto?: { id: number; nombre: string; precio?: number | string };
  }>;
}

interface DiaDetalle {
  date: string;
  ventas: VentaDetalle[];
  resumenPorEmpleado?: Record<string, { ventasCount: number; importeTotal: number }>;
  totalesDelDia?: { ventasCount: number; importeTotal: number; itemsVendidos: number };
}

interface DiaDetalleResult extends DiaDetalle {
  computedTotals: { ventasCount: number; importeTotal: number; itemsVendidos: number } | null;
}

interface VentaAutoTableRow {
  hora: string;
  venta: number;
  vendedor: string;
  producto: string;
  cantidad: number;
  precioUnitario: string;
  subtotal: string;
  total_venta: string;
}

const Reportes = () => {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date(today.getFullYear(), today.getMonth(), 1));
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth() + 1;
  const [selectedDate, setSelectedDate] = useState<string>(() => new Date().toLocaleDateString('en-CA'));
  const [expandedVenta, setExpandedVenta] = useState<number | null>(null);
  const [showCalendar, setShowCalendar] = useState(false);

  const calendarQuery = useQuery<DiaCalendario[], Error>({
    queryKey: ['reportes', 'calendario', year, month],
    queryFn: () => api.get<DiaCalendario[]>(`/reportes/calendario?year=${year}&month=${month}`),
    staleTime: 120_000,
    gcTime: 300_000,
  });

  const dayQuery = useQuery<DiaDetalle | null, Error, DiaDetalleResult>({
    queryKey: ['reportes', 'dia', selectedDate],
    queryFn: () =>
      selectedDate
        ? api.get<DiaDetalle>(`/reportes/dia?date=${selectedDate}&includeDetalles=true`)
        : Promise.resolve(null),
    enabled: Boolean(selectedDate),
    staleTime: 60_000,
    select: (data) => {
      if (!data) {
        return {
          date: selectedDate ?? '',
          ventas: [],
          resumenPorEmpleado: undefined,
          totalesDelDia: undefined,
          computedTotals: null,
        } satisfies DiaDetalleResult;
      }

      const ventasNormalizadas: VentaDetalle[] = (data.ventas ?? [])
        .map((venta) => ({
          ...venta,
          total: Number(venta.total ?? 0),
          detallesVentas: venta.detallesVentas?.map((detalle) => ({
            ...detalle,
            cantidad: Number(detalle.cantidad ?? 0),
            precioUnitario: Number(detalle.precioUnitario ?? 0),
            subtotal: Number(detalle.subtotal ?? 0),
          })),
        }))
        .sort((a, b) => new Date(a.fechaHora).getTime() - new Date(b.fechaHora).getTime());

      const fallbackTotals = (() => {
        const ventasCount = ventasNormalizadas.length;
        const importeTotal = ventasNormalizadas.reduce((acc, venta) => acc + Number(venta.total ?? 0), 0);
        const itemsVendidos = ventasNormalizadas.reduce((acc, venta) => {
          const detalles = venta.detallesVentas ?? [];
          return acc + detalles.reduce((inner, detalle) => inner + Number(detalle.cantidad ?? 0), 0);
        }, 0);
        return { ventasCount, importeTotal, itemsVendidos };
      })();

      return {
        ...data,
        ventas: ventasNormalizadas,
        computedTotals: data.totalesDelDia ?? fallbackTotals,
      } satisfies DiaDetalleResult;
    },
  });

  const days = calendarQuery.data ?? [];
  const loading = calendarQuery.isLoading;
  const error = calendarQuery.error?.message ?? null;
  const dayData = dayQuery.data ?? null;
  const dayLoading = dayQuery.isLoading;
  const dayError = dayQuery.error?.message ?? null;

  const computedTotals = dayData?.computedTotals ?? null;

  // Helpers de exportación
  const downloadFile = (blob: Blob, fileName: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const exportSelectedDayToCSV = () => {
    if (!selectedDate || !dayData) return;
    // CSV de detalles por línea
    const headers = [
      'date','venta_id','hora','vendedor','estado','producto_id','producto','cantidad','precio_unitario','subtotal','total_venta'
    ];
    const rows: string[] = [];
    dayData.ventas?.forEach((v) => {
      const hora = new Date(v.fechaHora).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
      if (v.detallesVentas && v.detallesVentas.length > 0) {
        v.detallesVentas.forEach((d) => {
          rows.push([
            selectedDate,
            String(v.id),
            hora,
            v.empleadoNombreSnapshot,
            v.estado,
            String(d.productoId),
            d.producto?.nombre ?? '',
            String(d.cantidad),
            Number(d.precioUnitario).toFixed(2),
            Number(d.subtotal).toFixed(2),
            Number(v.total).toFixed(2)
          ].map((x) => `"${(x ?? '').toString().replace(/"/g, '""')}"`).join(','));
        });
      } else {
        // Venta sin detalles
        rows.push([
          selectedDate,
          String(v.id),
          hora,
          v.empleadoNombreSnapshot,
          v.estado,
          '', '', '0', '0.00', '0.00', Number(v.total).toFixed(2)
        ].map((x) => `"${(x ?? '').toString().replace(/"/g, '""')}"`).join(','));
      }
    });
    const csv = [headers.join(','), ...rows].join('\n');
    downloadFile(new Blob([csv], { type: 'text/csv;charset=utf-8;' }), `reporte_${selectedDate}.csv`);
  };

  const exportSelectedDayToPDF = async () => {
    if (!selectedDate || !dayData) return;
    const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([
      import('jspdf'),
      import('jspdf-autotable'),
    ]);
    const doc = new jsPDF();
    const marginLeft = 14;
    doc.setFontSize(14);
    doc.text(`Reporte de ventas - ${selectedDate}`, marginLeft, 16);

    if (computedTotals) {
      doc.setFontSize(10);
      doc.text(`Ventas: ${computedTotals.ventasCount}`, marginLeft, 24);
      doc.text(`Importe total: ${Number(computedTotals.importeTotal).toFixed(2)}`, marginLeft + 60, 24);
      doc.text(`Items: ${computedTotals.itemsVendidos}`, marginLeft + 130, 24);
    }

    const columns = [
      { header: 'Hora', dataKey: 'hora' },
      { header: 'Venta', dataKey: 'venta' },
      { header: 'Vendedor', dataKey: 'vendedor' },
      { header: 'Producto', dataKey: 'producto' },
      { header: 'Cant.', dataKey: 'cantidad' },
      { header: 'P.Unit', dataKey: 'precioUnitario' },
      { header: 'Subtotal', dataKey: 'subtotal' },
      { header: 'Total Venta', dataKey: 'total_venta' },
    ];
    const rows: VentaAutoTableRow[] = [];

    dayData.ventas?.forEach((venta) => {
      const hora = new Date(venta.fechaHora).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
      if (venta.detallesVentas && venta.detallesVentas.length > 0) {
        venta.detallesVentas.forEach((detalle) => {
          rows.push({
            hora,
            venta: venta.id,
            vendedor: venta.empleadoNombreSnapshot,
            producto: detalle.producto?.nombre ?? `#${detalle.productoId}`,
            cantidad: detalle.cantidad,
            precioUnitario: Number(detalle.precioUnitario).toFixed(2),
            subtotal: Number(detalle.subtotal).toFixed(2),
            total_venta: Number(venta.total).toFixed(2),
          });
        });
      } else {
        rows.push({
          hora,
          venta: venta.id,
          vendedor: venta.empleadoNombreSnapshot,
          producto: '-',
          cantidad: 0,
          precioUnitario: '0.00',
          subtotal: '0.00',
          total_venta: Number(venta.total).toFixed(2),
        });
      }
    });

    const columnStyles: Record<string, { halign: 'left' | 'center' | 'right' }> = {
      cantidad: { halign: 'right' },
      precioUnitario: { halign: 'right' },
      subtotal: { halign: 'right' },
      total_venta: { halign: 'right' },
    };

    autoTable(doc, {
      head: [columns.map((c) => c.header)],
      body: rows.map((r) => [r.hora, r.venta, r.vendedor, r.producto, r.cantidad, r.precioUnitario, r.subtotal, r.total_venta]),
      startY: computedTotals ? 32 : 20,
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [79, 70, 229] },
      columnStyles,
      didDrawPage: () => {
        const pageSize = doc.internal.pageSize;
        const pageHeight = pageSize.getHeight();
        doc.setFontSize(8);
        doc.text(`Generado: ${new Date().toLocaleString()}`, marginLeft, pageHeight - 8);
      },
    });

    doc.save(`reporte_${selectedDate}.pdf`);
  };

  const currency = (v: number) =>
    new Intl.NumberFormat('es-BO', { style: 'currency', currency: 'BOB' }).format(v);

  return (
    <div className="space-y-5">
      {/* Header con selector de fecha integrado */}
      <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-md">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 shadow-lg shadow-indigo-500/30">
              <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Reportes de Ventas</h2>
              <p className="text-xs text-slate-500">Análisis y exportación de datos</p>
            </div>
          </div>

          {/* Botón selector de fecha */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowCalendar(!showCalendar)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-slate-200 bg-white text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 hover:border-indigo-300 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            >
              <svg className="h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="hidden sm:inline">
                {new Date(selectedDate + 'T12:00:00').toLocaleDateString('es-ES', { 
                  day: 'numeric', 
                  month: 'short',
                  year: 'numeric'
                })}
              </span>
              <span className="sm:hidden">Fecha</span>
              <svg className={`h-4 w-4 text-slate-400 transition-transform ${showCalendar ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {loading && <span className="text-xs text-slate-500">Cargando...</span>}
          </div>
        </div>
        {error && (
          <div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
            <span className="font-semibold">Error:</span> {error}
          </div>
        )}
      </section>

      {/* Calendario colapsable */}
      {showCalendar && (
        <section className="rounded-2xl border border-slate-200/80 bg-white shadow-md overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="bg-gradient-to-br from-slate-50 to-slate-100/60 px-5 py-3 border-b border-slate-200/80 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">
              📅 Seleccionar fecha
            </h3>
            <button
              onClick={() => setShowCalendar(false)}
              className="text-slate-400 hover:text-slate-600 transition-colors"
              aria-label="Cerrar calendario"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="p-4">
          <div className="mx-auto max-w-2xl">
            <style>{`
              .rdp {
                --rdp-cell-size: 40px;
                --rdp-accent-color: rgb(79 70 229);
                --rdp-background-color: rgb(238 242 255);
                margin: 0;
              }
              .rdp-months {
                justify-content: center;
              }
              .rdp-month {
                width: 100%;
              }
              .rdp-table {
                max-width: 100%;
                margin: 0 auto;
              }
              .rdp-head_cell {
                font-weight: 700;
                font-size: 0.75rem;
                color: rgb(100 116 139);
                text-transform: uppercase;
                letter-spacing: 0.05em;
              }
              .rdp-cell {
                padding: 2px;
              }
              .rdp-day {
                border-radius: 0.75rem;
                font-weight: 600;
                font-size: 0.875rem;
                transition: all 0.2s;
                border: 2px solid transparent;
              }
              .rdp-day:hover:not(.rdp-day_disabled):not(.rdp-day_selected) {
                background-color: rgb(241 245 249);
              }
              .rdp-day_selected {
                background: linear-gradient(135deg, rgb(79 70 229), rgb(67 56 202));
                color: white;
                font-weight: 700;
                box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.3);
              }
              .rdp-day_today:not(.rdp-day_selected) {
                background-color: rgb(241 245 249);
                font-weight: 700;
                box-shadow: 0 0 0 2px rgb(148 163 184);
              }
              .rdp-day_outside {
                color: rgb(203 213 225);
                opacity: 0.5;
              }
              .day-has-sales:not(.rdp-day_selected) {
                background: linear-gradient(135deg, rgb(238 242 255), rgb(224 231 255));
                color: rgb(67 56 202);
                font-weight: 700;
                border: 2px solid rgb(199 210 254);
                box-shadow: 0 1px 3px rgba(79, 70, 229, 0.1);
              }
              .day-has-sales:hover:not(.rdp-day_selected) {
                box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.2);
                transform: translateY(-1px);
              }
              .rdp-caption_label {
                font-size: 1rem;
                font-weight: 700;
                color: rgb(15 23 42);
              }
              .rdp-nav_button {
                width: 2.5rem;
                height: 2.5rem;
                border-radius: 0.75rem;
                border: 1px solid rgb(226 232 240);
                background: white;
                transition: all 0.2s;
              }
              .rdp-nav_button:hover {
                background-color: rgb(248 250 252);
                box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
              }
              .rdp-caption_dropdowns {
                gap: 0.5rem;
              }
              .rdp-dropdown {
                font-size: 0.875rem;
                font-weight: 600;
                padding: 0.375rem 0.5rem;
                border-radius: 0.5rem;
                border: 1px solid rgb(226 232 240);
                background: white;
              }
            `}</style>
            <DayPicker
              mode="single"
              locale={es}
              selected={selectedDate ? parseISO(selectedDate) : undefined}
              onSelect={(date) => {
                if (!date) return;
                const isoLocal = date.toLocaleDateString('en-CA');
                setSelectedDate(isoLocal);
                setShowCalendar(false); // Cerrar calendario al seleccionar
              }}
              month={currentMonth}
              onMonthChange={setCurrentMonth}
              showOutsideDays
              fixedWeeks
              modifiers={{
                hasSales: (days as DiaCalendario[]).filter(d => d.ventasCount > 0).map(d => parseISO(d.date))
              }}
              modifiersClassNames={{
                hasSales: 'day-has-sales'
              }}
              captionLayout="dropdown"
              fromYear={today.getFullYear() - 2}
              toYear={today.getFullYear() + 1}
            />
          </div>
          
          {/* Leyenda compacta */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-3 rounded-lg bg-slate-50 px-3 py-2 text-xs">
            <div className="flex items-center gap-1.5">
              <div className="h-4 w-4 rounded border-2 border-indigo-200 bg-indigo-50"></div>
              <span className="font-medium text-slate-700">Ventas</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-4 w-4 rounded bg-indigo-600"></div>
              <span className="font-medium text-slate-700">Selección</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-4 w-4 rounded bg-slate-100 ring-2 ring-slate-400"></div>
              <span className="font-medium text-slate-700">Hoy</span>
            </div>
          </div>
        </div>
      </section>
      )}

      {/* Detalles del día seleccionado */}
      {selectedDate && (
        <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-md">
          {/* Header del día compacto */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-900">
                  {new Date(selectedDate + 'T12:00:00').toLocaleDateString('es-ES', { 
                    day: 'numeric', 
                    month: 'short', 
                    year: 'numeric' 
                  })}
                </h3>
                {dayLoading && (
                  <div className="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600">
                    <svg className="h-3 w-3 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Cargando...
                  </div>
                )}
              </div>
              <p className="mt-2 text-sm text-slate-600">
                Incluye totales, desglose por vendedor y listado completo de transacciones.
              </p>
              {dayError && (
                <div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                  <span className="font-bold">Error:</span> {dayError}
                </div>
              )}
            </div>
            
            {/* Botones de exportación */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={exportSelectedDayToPDF}
                disabled={!dayData || dayLoading}
                className="inline-flex items-center gap-2 justify-center rounded-xl bg-gradient-to-br from-rose-500 to-rose-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-rose-200/50 transition-all duration-200 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                PDF
              </button>
              <button
                onClick={exportSelectedDayToCSV}
                disabled={!dayData || dayLoading}
                className="inline-flex items-center gap-2 justify-center rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-700 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-emerald-200/50 transition-all duration-200 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                CSV
              </button>
            </div>
          </div>

          {/* Tarjetas de métricas principales */}
          {computedTotals && (
            <div className="mt-6 grid gap-5 sm:grid-cols-3">
              <div className="group relative overflow-hidden rounded-[20px] border border-slate-200/80 bg-white p-6 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/0 to-indigo-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative">
                  <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-slate-400 leading-none">Transacciones</p>
                  <p className="mt-3 text-4xl font-bold bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 bg-clip-text text-transparent">
                    {computedTotals.ventasCount}
                  </p>
                  <p className="mt-2 text-xs text-slate-500">
                    {computedTotals.ventasCount === 1 ? 'venta registrada' : 'ventas registradas'}
                  </p>
                </div>
              </div>
              
              <div className="group relative overflow-hidden rounded-[20px] border border-slate-200/80 bg-white p-6 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/0 to-emerald-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative">
                  <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-slate-400 leading-none">Ingresos totales</p>
                  <p className="mt-3 text-4xl font-bold bg-gradient-to-br from-emerald-700 via-emerald-600 to-emerald-700 bg-clip-text text-transparent">
                    {currency(computedTotals.importeTotal)}
                  </p>
                  <p className="mt-2 text-xs text-slate-500">En bolivianos (BOB)</p>
                </div>
              </div>
              
              <div className="group relative overflow-hidden rounded-[20px] border border-slate-200/80 bg-white p-6 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/0 to-indigo-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative">
                  <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-slate-400 leading-none">Productos vendidos</p>
                  <p className="mt-3 text-4xl font-bold bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 bg-clip-text text-transparent">
                    {computedTotals.itemsVendidos}
                  </p>
                  <p className="mt-2 text-xs text-slate-500">Unidades en total</p>
                </div>
              </div>
            </div>
          )}

          {/* Tabla por vendedor */}
          {dayData?.resumenPorEmpleado && Object.keys(dayData.resumenPorEmpleado).length > 0 && (
            <div className="mt-8 overflow-hidden rounded-[22px] border border-slate-200/80 shadow-md">
              <div className="bg-gradient-to-br from-slate-50 to-slate-100/60 px-6 py-4 border-b border-slate-200/80">
                <h4 className="text-base font-bold text-slate-900">Desglose por vendedor</h4>
                <p className="mt-1 text-xs text-slate-600">Rendimiento individual de cada empleado en este día</p>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-white">
                    <tr>
                      <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-[0.25em] text-slate-500">
                        Vendedor
                      </th>
                      <th className="px-6 py-4 text-right text-[10px] font-bold uppercase tracking-[0.25em] text-slate-500">
                        Ventas
                      </th>
                      <th className="px-6 py-4 text-right text-[10px] font-bold uppercase tracking-[0.25em] text-slate-500">
                        Importe
                      </th>
                      <th className="px-6 py-4 text-right text-[10px] font-bold uppercase tracking-[0.25em] text-slate-500">
                        Promedio
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {Object.entries(dayData.resumenPorEmpleado)
                      .sort((a, b) => b[1].importeTotal - a[1].importeTotal)
                      .map(([nombre, r], idx) => {
                        const promedio = r.ventasCount > 0 ? r.importeTotal / r.ventasCount : 0;
                        return (
                          <tr key={nombre} className="transition-all duration-200 hover:bg-slate-50/80">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-100 to-indigo-200 text-sm font-bold text-indigo-700">
                                  {idx + 1}
                                </div>
                                <span className="text-sm font-semibold text-slate-900">{nombre}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-bold text-slate-700">
                                {r.ventasCount}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <span className="text-base font-bold text-emerald-700">{currency(r.importeTotal)}</span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <span className="text-sm font-semibold text-slate-600">{currency(promedio)}</span>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tabla de ventas detallada */}
          <div className="mt-8 overflow-hidden rounded-[22px] border border-slate-200/80 shadow-md">
            <div className="bg-gradient-to-br from-slate-50 to-slate-100/60 px-6 py-4 border-b border-slate-200/80">
              <h4 className="text-base font-bold text-slate-900">Listado de ventas</h4>
              <p className="mt-1 text-xs text-slate-600">Todas las transacciones registradas en orden cronológico</p>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-white">
                  <tr>
                    <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-[0.25em] text-slate-500">
                      Hora
                    </th>
                    <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-[0.25em] text-slate-500">
                      ID
                    </th>
                    <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-[0.25em] text-slate-500">
                      Vendedor
                    </th>
                    <th className="px-6 py-4 text-right text-[10px] font-bold uppercase tracking-[0.25em] text-slate-500">
                      Total
                    </th>
                    <th className="px-6 py-4 text-center text-[10px] font-bold uppercase tracking-[0.25em] text-slate-500">
                      Estado
                    </th>
                    <th className="px-6 py-4 text-center text-[10px] font-bold uppercase tracking-[0.25em] text-slate-500">
                      Detalles
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {dayData?.ventas && dayData.ventas.length > 0 ? (
                    dayData.ventas.map((v) => {
                      const hora = new Date(v.fechaHora).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
                      const hasDetalles = v.detallesVentas && v.detallesVentas.length > 0;
                      const isExpanded = expandedVenta === v.id;
                      
                      return (
                        <Fragment key={`venta-${v.id}`}>
                          <tr className="group transition-all duration-200 hover:bg-slate-50/80">
                            <td className="px-6 py-4">
                              <span className="inline-flex items-center gap-2 text-sm font-mono font-semibold text-slate-700">
                                <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {hora}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="inline-flex items-center rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700">
                                #{v.id}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-sm font-semibold text-slate-900">{v.empleadoNombreSnapshot}</span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <span className="text-base font-bold text-slate-900">{currency(Number(v.total))}</span>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <span className={`inline-flex px-3 py-1.5 rounded-full text-xs font-bold shadow-sm ${
                                v.estado === 'completada'
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                  : v.estado === 'devolucion'
                                  ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                  : 'bg-slate-100 text-slate-800 border border-slate-200'
                              }`}>
                                {v.estado}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-center">
                              {hasDetalles ? (
                                <button
                                  onClick={() => setExpandedVenta(isExpanded ? null : v.id)}
                                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-sm transition-all duration-200 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                                >
                                  {isExpanded ? 'Ocultar' : 'Ver'}
                                  <svg className={`h-3 w-3 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                  </svg>
                                </button>
                              ) : (
                                <span className="text-xs text-slate-400">Sin items</span>
                              )}
                            </td>
                          </tr>
                          
                          {/* Detalles expandibles */}
                          {hasDetalles && isExpanded && (
                            <tr className="bg-gradient-to-br from-slate-50 to-slate-100/40">
                              <td colSpan={6} className="px-6 py-4">
                                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                                  <p className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500">Items de la venta</p>
                                  <table className="w-full text-sm">
                                    <thead>
                                      <tr className="border-b border-slate-200">
                                        <th className="pb-2 text-left text-[10px] font-bold uppercase tracking-wider text-slate-500">Producto</th>
                                        <th className="pb-2 text-right text-[10px] font-bold uppercase tracking-wider text-slate-500">Cant.</th>
                                        <th className="pb-2 text-right text-[10px] font-bold uppercase tracking-wider text-slate-500">P.Unit</th>
                                        <th className="pb-2 text-right text-[10px] font-bold uppercase tracking-wider text-slate-500">Subtotal</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                      {v.detallesVentas!.map((d) => (
                                        <tr key={`det-${d.id}`} className="transition hover:bg-slate-50">
                                          <td className="py-2 pr-4 text-slate-700 font-medium">
                                            {d.producto?.nombre ?? `Producto #${d.productoId}`}
                                          </td>
                                          <td className="py-2 text-right text-slate-700 font-semibold">{d.cantidad}</td>
                                          <td className="py-2 text-right text-slate-700">{currency(Number(d.precioUnitario))}</td>
                                          <td className="py-2 text-right font-bold text-slate-900">{currency(Number(d.subtotal))}</td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              </td>
                            </tr>
                          )}
                        </Fragment>
                      );
                    })
                  ) : (
                    <tr>
                      <td className="px-6 py-12 text-center" colSpan={6}>
                        <div className="flex flex-col items-center justify-center">
                          <svg className="h-12 w-12 text-slate-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <p className="text-base font-semibold text-slate-700">Sin ventas en este día</p>
                          <p className="mt-1 text-sm text-slate-500">No se registraron transacciones en la fecha seleccionada.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default Reportes;
