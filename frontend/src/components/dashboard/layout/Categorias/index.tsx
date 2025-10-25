// src/pages/Empleado/Categorias.tsx
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { categoriaService } from "../../../../services/categoria.service";
import Agregar from "../Categorias/ACategoria/index";
import EditarCategoria from "../Categorias/ECategoria/index";
import { type Categoria } from "../../../../models/Categoria";

const Categorias = () => {
  const [modalAbierto, setModalAbierto] = useState(false);
  const [modalConfirmacionAbierto, setModalConfirmacionAbierto] = useState(false);
  const [modalEditarAbierto, setModalEditarAbierto] = useState(false);
  const [categoriaAEliminar, setCategoriaAEliminar] = useState<number | null>(null);
  const [categoriaEditando, setCategoriaEditando] = useState<Categoria | null>(null);
  const queryClient = useQueryClient();

  // Obtener categorías con React Query
  const {
    data: categorias,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["categorias"],
    queryFn: categoriaService.getCategorias,
  });

  // Mutación para eliminar una categoría
  const deleteMutation = useMutation({
    mutationFn: (id: number) => categoriaService.deleteCategoria(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categorias"] });
      setModalConfirmacionAbierto(false);
    },
    onError: (error) => {
      alert(`Error al eliminar la categoría: ${(error as Error).message}`);
    },
  });

  // Abrir el modal de confirmación
  const handleOpenConfirmModal = (id: number) => {
    setCategoriaAEliminar(id);
    setModalConfirmacionAbierto(true);
  };

  // Abrir el modal de editar
  const handleOpenEditModal = (categoria: Categoria) => {
    setCategoriaEditando(categoria);
    setModalEditarAbierto(true);
  };

  // Confirmar eliminación
  const handleConfirmDelete = () => {
    if (categoriaAEliminar !== null) {
      deleteMutation.mutate(categoriaAEliminar);
    }
  };

  if (isLoading) return <div className="p-8 text-sm text-slate-500">Cargando categorías...</div>;
  if (error)
    return (
      <div className="p-6 rounded-[22px] border border-red-200 bg-red-50 text-sm text-red-700 shadow-sm">
        <span className="font-semibold">Error:</span> {(error as Error).message}
      </div>
    );

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 rounded-[28px] border border-slate-200/80 bg-white p-7 lg:p-8 shadow-lg shadow-slate-200/50 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400 leading-none">Catálogo</p>
          <h2 className="mt-2.5 text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight">Gestión de categorías</h2>
          <p className="mt-2 text-sm text-slate-600 leading-relaxed max-w-2xl">Agrupa los sabores para que el equipo encuentre los helados con rapidez.</p>
        </div>
        <button
          onClick={() => setModalAbierto(true)}
          className="inline-flex items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-indigo-700 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-200/50 transition-all duration-200 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
        >
          + Agregar Categoría
        </button>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-[26px] border border-slate-200/80 bg-white shadow-lg shadow-slate-200/50">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-gradient-to-br from-slate-50 to-slate-100/60">
              <tr>
                <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-[0.25em] text-slate-500">
                  N°
                </th>
                <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-[0.25em] text-slate-500">
                  Nombre
                </th>
                <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-[0.25em] text-slate-500">
                  Descripción
                </th>
                <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-[0.25em] text-slate-500">
                  Estado
                </th>
                <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-[0.25em] text-slate-500">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {categorias?.map((categoria, idx) => (
                <tr key={categoria.id} className="transition-all duration-200 hover:bg-slate-50/80">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-700">
                    {idx + 1}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-900">
                    {categoria.nombre}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600 max-w-md">
                    {categoria.descripcion || <span className="text-slate-400">Sin descripción</span>}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-3 py-1.5 rounded-full text-xs font-bold shadow-sm ${
                        categoria.activo
                          ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                          : "bg-rose-100 text-rose-800 border border-rose-200"
                      }`}
                    >
                      {categoria.activo ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleOpenEditModal(categoria)}
                        className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 shadow-sm transition-all duration-200 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleOpenConfirmModal(categoria.id)}
                        className="rounded-xl border border-rose-200 bg-white px-4 py-2 text-xs font-bold text-rose-700 shadow-sm transition-all duration-200 hover:bg-rose-50 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mensaje si no hay categorías */}
      {categorias?.length === 0 && (
        <div className="rounded-[26px] border border-slate-200/80 bg-white p-12 text-center shadow-lg shadow-slate-200/50">
          <div className="mx-auto max-w-sm">
            <p className="text-base font-semibold text-slate-700">No hay categorías registradas</p>
            <p className="mt-2 text-sm text-slate-500">Comienza agregando tu primera categoría para organizar los productos.</p>
            <button
              onClick={() => setModalAbierto(true)}
              className="mt-6 inline-flex items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-indigo-700 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-200/50 transition-all duration-200 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
            >
              + Agregar primera categoría
            </button>
          </div>
        </div>
      )}

      {/* Modal de agregar categoría */}
      <Agregar abierto={modalAbierto} onCerrar={() => setModalAbierto(false)} />

      {/* Modal de confirmación de eliminación */}
      {modalConfirmacionAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm px-4">
          <div className="w-full max-w-md rounded-[22px] border border-slate-200 bg-white p-7 shadow-2xl">
            <h3 className="text-xl font-bold text-slate-900">
              Confirmar Eliminación
            </h3>
            <p className="mt-3 text-sm text-slate-600 leading-relaxed">
              ¿Estás seguro de que quieres eliminar esta categoría? Esta acción no se puede deshacer.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setModalConfirmacionAbierto(false)}
                className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition-all duration-200 hover:bg-slate-50 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmDelete}
                className="rounded-xl bg-gradient-to-br from-rose-600 to-rose-700 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-rose-200/50 transition-all duration-200 hover:shadow-xl disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? "Eliminando..." : "Eliminar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de editar categoría */}
      {categoriaEditando && (
        <EditarCategoria
          abierto={modalEditarAbierto}
          onCerrar={() => {
            setModalEditarAbierto(false);
            setCategoriaEditando(null);
          }}
          categoria={categoriaEditando}
        />
      )}
    </div>
  );
};

export default Categorias;


/*
Este componente se encarga de mostrar la lista de categorías y manejar la lógica de edición y eliminación.
*/