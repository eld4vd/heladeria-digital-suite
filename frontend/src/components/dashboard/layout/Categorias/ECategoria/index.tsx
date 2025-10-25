import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { categoriaService } from "../../../../../services/categoria.service";
import { type Categoria, type UpdateCategoriaDto } from "../../../../../models/Categoria";
import toast from "react-hot-toast";

interface Props {
  abierto: boolean;
  onCerrar: () => void;
  categoria: Categoria;
}

const EditarCategoria = ({ abierto, onCerrar, categoria }: Props) => {
  const queryClient = useQueryClient();
  const [nombre, setNombre] = useState(categoria.nombre);
  const [descripcion, setDescripcion] = useState(categoria.descripcion);
  const [activo, setActivo] = useState<boolean>(categoria.activo);

  const updateMutation = useMutation({
    mutationFn: (data: UpdateCategoriaDto) =>
      categoriaService.updateCategoria(categoria.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categorias"] });
      onCerrar();
      toast.success("Categoría actualizada con éxito", {
        style: {
          background: "#FCE7F3",
          color: "#BE185D",
          border: "1px solid #FBCFE8",
        },
      });
    },
    onError: (error) => {
      toast.error(`Error al actualizar la categoría: ${(error as Error).message}`, {
        style: {
          background: "#FEE2E2",
          color: "#991B1B",
          border: "1px solid #FECACA",
        },
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (nombre.trim().length < 3) {
      toast.error("El nombre debe tener al menos 3 caracteres", {
        style: {
          background: "#FEE2E2",
          color: "#991B1B",
          border: "1px solid #FECACA",
        },
      });
      return;
    }
    if (descripcion.trim().length === 0) {
      toast.error("La descripción no puede estar vacía", {
        style: {
          background: "#FEE2E2",
          color: "#991B1B",
          border: "1px solid #FECACA",
        },
      });
      return;
    }
    updateMutation.mutate({
      nombre: nombre.trim(),
      descripcion: descripcion.trim(),
      activo,
    });
  };

  if (!abierto) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 transition-opacity duration-300">
      <div className="bg-white p-8 rounded-2xl w-full max-w-md mx-4 shadow-xl transform transition-all duration-300">
        {/* Header del modal */}
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-pink-600">Editar Categoría</h3>
          <button
            onClick={onCerrar}
            className="text-gray-500 hover:text-gray-700 text-2xl transition-colors duration-200"
            aria-label="Cerrar modal"
          >
            ×
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-2">
              Nombre <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full p-3 bg-pink-50 border border-pink-200 rounded-lg focus:border-pink-500 focus:ring-2 focus:ring-pink-300 transition-all duration-200"
              required
              placeholder="Ej. Helados Clásicos"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-800 mb-2">
              Descripción
            </label>
            <textarea
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              rows={4}
              className="w-full p-3 bg-blue-50 border border-blue-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-300 transition-all duration-200"
              placeholder="Ej. Categoría para helados tradicionales"
            />
          </div>

          {/* Estado activo/inactivo */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-800 mb-2">
              Estado
            </label>
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="activo"
                checked={activo}
                onChange={e => setActivo(e.target.checked)}
                className="form-checkbox h-5 w-5 text-pink-600"
              />
              <label htmlFor="activo" className="text-gray-700 select-none">
                {activo ? "Activo" : "Inactivo"}
              </label>
            </div>
          </div>

          {/* Botones */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onCerrar}
              className="px-5 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-200 font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={updateMutation.isPending}
              className="px-5 py-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg hover:from-pink-600 hover:to-purple-600 disabled:opacity-50 transition-all duration-200 font-medium"
            >
              {updateMutation.isPending ? "Guardando..." : "Actualizar"}
            </button>
          </div>

          {/* Mensaje de error */}
          {updateMutation.isError && (
            <div className="mt-4 p-4 bg-red-100 border border-red-300 rounded-lg">
              <p className="text-red-700 text-sm">
                Error: {(updateMutation.error as Error).message}
              </p>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default EditarCategoria;