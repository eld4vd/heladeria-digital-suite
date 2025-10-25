// src/pages/Empleado/DashboardOverview.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { productService } from "../../services/producto.service";
import { ventaService } from "../../services/venta.service";
import useCategorias from "../../hooks/useCategorias";
import type { Producto } from "../../models/Producto";
import type { Venta } from "../../models/Venta";

const currency = (value: number) =>
  new Intl.NumberFormat("es-BO", { style: "currency", currency: "BOB" }).format(value);

interface ProductoDashboardData {
  activosCount: number;
  stockBajoCount: number;
}

interface VentaResumen {
  id: number;
  total: number;
  estado: string;
  empleado: string;
  fechaHora: string | null;
  dateKey: string | null;
}

interface VentasDashboardData {
  list: VentaResumen[];
  byDate: Record<string, VentaResumen[]>;
}

const DashboardOverview = () => {
  const navigate = useNavigate();
  const [now, setNow] = useState<Date>(new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const { data: productos } = useQuery<Producto[], Error, ProductoDashboardData>({
    queryKey: ["dashboard", "productos"],
    queryFn: productService.getProductos,
    staleTime: 120_000,
    refetchOnWindowFocus: true,
    select: (items) => {
      let activosCount = 0;
      let stockBajoCount = 0;
      for (const item of items) {
        if (item.activo) activosCount += 1;
        if (Number(item.stock) <= 5) stockBajoCount += 1;
      }
      return { activosCount, stockBajoCount } satisfies ProductoDashboardData;
    },
  });

  const { data: categorias } = useCategorias();

  const { data: ventas } = useQuery<Venta[], Error, VentasDashboardData>({
    queryKey: ["dashboard", "ventas"],
    queryFn: ventaService.getVentas,
    staleTime: 120_000,
    refetchOnWindowFocus: true,
    select: (items) => {
      const list: VentaResumen[] = items.map((venta) => {
        const rawFecha = venta.fechaVenta ?? venta.fechaHora ?? null;
        const fecha = rawFecha ? new Date(rawFecha) : null;
        const total = Number(venta.total ?? 0);
        const empleado = venta.empleadoNombreSnapshot ?? "—";
        const estado = venta.estado ?? "pendiente";
        return {
          id: venta.id,
          total,
          estado,
          empleado,
          fechaHora: rawFecha,
          dateKey: fecha ? fecha.toLocaleDateString("en-CA") : null,
        } satisfies VentaResumen;
      });

      const byDate = list.reduce<Record<string, VentaResumen[]>>((acc, venta) => {
        if (!venta.dateKey) return acc;
        if (!acc[venta.dateKey]) acc[venta.dateKey] = [];
        acc[venta.dateKey].push(venta);
        return acc;
      }, {});

      return { list, byDate } satisfies VentasDashboardData;
    },
  });

  const todayKey = now.toLocaleDateString("en-CA");
  const ventasDeHoy = ventas?.byDate[todayKey] ?? [];
  const totalHoy = ventasDeHoy.reduce((acc, venta) => acc + venta.total, 0);
  const promedioTicket = ventasDeHoy.length > 0 ? totalHoy / ventasDeHoy.length : 0;
  const productosActivos = productos?.activosCount ?? 0;
  const categoriasActivas = categorias?.list.length ?? 0;
  const stockBajo = productos?.stockBajoCount ?? 0;

  const fecha = now.toLocaleDateString("es-ES", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const hora = now.toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  const statCards = [
    {
      label: "Ingresos del día",
  value: ventasDeHoy.length ? currency(Number(totalHoy.toFixed(2))) : "--",
      caption: `${ventasDeHoy.length} ${ventasDeHoy.length === 1 ? "venta" : "ventas"} registradas hoy`,
    },
    {
      label: "Ticket promedio",
  value: ventasDeHoy.length ? currency(Number(promedioTicket.toFixed(2))) : "--",
      caption: "Monto promedio por venta durante la jornada",
    },
    {
      label: "Productos activos",
  value: productosActivos || productosActivos === 0 ? productosActivos : "--",
      caption: `${categoriasActivas} categorias activas - ${stockBajo} con stock <= 5`,
    },
  ];

  const quickActions = [
    {
      title: "Productos",
      description: "Revisa inventario y actualiza precios o stock.",
      action: () => navigate("/dashboard/productos"),
    },
    {
      title: "Categorías",
      description: "Organiza sabores para facilitar la búsqueda.",
      action: () => navigate("/dashboard/categorias"),
    },
    {
      title: "Registrar venta",
      description: "Genera tickets y añade helados en segundos.",
      action: () => navigate("/dashboard/ventas"),
    },
    {
      title: "Volver al sitio",
      description: "Visualiza la web pública como la verán los clientes.",
      action: () => navigate("/"),
    },
  ];

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <section className="grid gap-6 lg:grid-cols-[1.5fr,1fr]">
        <div className="relative overflow-hidden rounded-[28px] border border-slate-200/80 bg-gradient-to-br from-white via-white to-slate-50 p-8 lg:p-10 shadow-lg shadow-slate-200/50">
          <div className="absolute inset-0 -z-10 opacity-40">
            <div className="absolute -right-32 -top-32 h-80 w-80 rounded-full bg-gradient-to-br from-indigo-300 via-sky-200 to-transparent blur-3xl" />
            <div className="absolute -left-40 bottom-0 h-64 w-64 rounded-full bg-gradient-to-tr from-rose-200 via-pink-100 to-transparent blur-3xl" />
          </div>
          <div className="flex flex-col gap-6">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400 leading-none">Panel de control</p>
              <h1 className="mt-3 text-3xl lg:text-4xl font-bold text-slate-900 tracking-tight leading-[1.15]">
                Mantén la heladería<br/>en ritmo perfecto
              </h1>
              <p className="mt-4 text-base lg:text-lg text-slate-600 max-w-xl leading-relaxed">
                Revisa las métricas principales, gestiona el catálogo y controla las ventas del día desde un solo lugar.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-6 pt-2">
              <div className="flex items-center gap-2.5 text-sm lg:text-base font-semibold text-slate-700">
                <span className="inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-300" aria-hidden />
                {fecha}
              </div>
              <div className="flex items-center gap-2.5 font-mono text-xl lg:text-2xl font-bold text-slate-900">
                <span className="inline-flex h-2.5 w-2.5 rounded-full bg-indigo-500 animate-pulse shadow-sm shadow-indigo-300" aria-hidden />
                {hora}
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="flex flex-col gap-4">
          {statCards.map((card, idx) => (
            <div 
              key={card.label} 
              className="group relative overflow-hidden rounded-[20px] border border-slate-200/80 bg-white p-6 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/0 to-indigo-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative">
                <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-slate-400 leading-none">{card.label}</p>
                <p className="mt-3 text-3xl lg:text-4xl font-bold bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 bg-clip-text text-transparent">{card.value}</p>
                <p className="mt-2 text-xs text-slate-500 leading-relaxed">{card.caption}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Quick Actions */}
      <section>
        <div className="mb-5">
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Acciones rápidas</h2>
          <p className="mt-1.5 text-sm text-slate-500">Mantén las tareas diarias a un clic de distancia.</p>
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {quickActions.map((item, idx) => (
            <button
              key={item.title}
              type="button"
              onClick={item.action}
              className="group relative flex h-full flex-col items-start justify-between rounded-[22px] border border-slate-200/80 bg-white p-6 text-left shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-indigo-300 active:scale-[0.98]"
              style={{ animationDelay: `${idx * 80}ms` }}
            >
              <div className="absolute inset-0 rounded-[22px] bg-gradient-to-br from-indigo-50/0 to-indigo-100/0 group-hover:from-indigo-50/50 group-hover:to-indigo-100/30 transition-all duration-300" />
              <div className="relative">
                <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-700 transition-colors duration-200">
                  {item.title}
                </h3>
                <p className="mt-2.5 text-sm text-slate-600 leading-relaxed">{item.description}</p>
              </div>
              <span className="relative mt-5 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.2em] text-indigo-600 group-hover:gap-2.5 transition-all duration-300">
                Ir ahora
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* Best Practices */}
      <section className="rounded-[28px] border border-slate-200/80 bg-white p-7 lg:p-9 shadow-lg shadow-slate-200/50">
        <div className="flex flex-col gap-5">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Guía rápida de buenas prácticas
            </h2>
            <p className="mt-2 text-sm text-slate-500 leading-relaxed">
              Mantén la información alineada entre el sistema y la experiencia del cliente.
            </p>
          </div>
          <ul className="grid gap-4 sm:grid-cols-2">
            <li className="group rounded-2xl border border-slate-200/60 bg-gradient-to-br from-slate-50 to-white px-5 py-4 text-sm text-slate-700 leading-relaxed shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-200">
              <span className="font-semibold text-slate-900">Stock actualizado:</span> Ajusta el inventario después de registrar ventas o movimientos manuales.
            </li>
            <li className="group rounded-2xl border border-slate-200/60 bg-gradient-to-br from-slate-50 to-white px-5 py-4 text-sm text-slate-700 leading-relaxed shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-200">
              <span className="font-semibold text-slate-900">Cierre de caja:</span> Revisa el reporte del día antes de cerrar para detectar discrepancias.
            </li>
            <li className="group rounded-2xl border border-slate-200/60 bg-gradient-to-br from-slate-50 to-white px-5 py-4 text-sm text-slate-700 leading-relaxed shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-200">
              <span className="font-semibold text-slate-900">Nomenclatura consistente:</span> Usa nombres claros en categorías y productos para mejorar la búsqueda.
            </li>
            <li className="group rounded-2xl border border-slate-200/60 bg-gradient-to-br from-slate-50 to-white px-5 py-4 text-sm text-slate-700 leading-relaxed shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-200">
              <span className="font-semibold text-slate-900">Documentación:</span> Registra cambios importantes en precios o promociones para el equipo.
            </li>
          </ul>
        </div>
      </section>
    </div>
  );
};

export default DashboardOverview;
