import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { categoriaService } from '../../../../../services/categoria.service';
import { productService } from '../../../../../services/producto.service';
import type { Categoria } from '../../../../../models/Categoria';
import type { Producto, UpdateProductoDto } from '../../../../../models/Producto';
import toast from 'react-hot-toast';

interface Props {
	abierto: boolean;
	onCerrar: () => void;
	producto: Producto;
}

const EditarProducto = ({ abierto, onCerrar, producto }: Props) => {
	const qc = useQueryClient();
	const [nombre, setNombre] = useState(producto.nombre);
	const [descripcion, setDescripcion] = useState(producto.descripcion ?? '');
	const [sabor, setSabor] = useState(producto.sabor);
	const [precio, setPrecio] = useState(String(producto.precio));
	const [stock, setStock] = useState<number>(producto.stock);
	const [categoriaId, setCategoriaId] = useState<number | ''>(producto.categoriaId || (producto.categoria?.id ?? ''));
	const [activo, setActivo] = useState<boolean>(producto.activo);
		const [imagenUrlInput, setImagenUrlInput] = useState<string>(producto.imagenUrl || '');
		const [imagenPreviewUrl, setImagenPreviewUrl] = useState<string>(producto.imagenUrl || '');
		const [previewError, setPreviewError] = useState<string | null>(null);

	const { data: categorias, isLoading: catLoading, error: catError } = useQuery({
		queryKey: ['categorias'],
		queryFn: categoriaService.getCategorias,
	});

	const categoriasActivas = useMemo(
		() => (categorias || []).filter((c: Categoria) => c.activo),
		[categorias],
	);

	// Rehidratar cuando cambie el producto o se abra el modal
	useEffect(() => {
		if (!abierto) return;
		setNombre(producto.nombre);
		setDescripcion(producto.descripcion ?? '');
		setSabor(producto.sabor);
		setPrecio(String(producto.precio));
		setStock(producto.stock);
		setCategoriaId(producto.categoriaId || (producto.categoria?.id ?? ''));
		setActivo(producto.activo);
		setImagenUrlInput(producto.imagenUrl || '');
		setImagenPreviewUrl(producto.imagenUrl || '');
		setPreviewError(null);
	}, [abierto, producto]);

	const updateMutation = useMutation({
		mutationFn: (data: UpdateProductoDto) => productService.updateProducto(producto.id, data),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ['productos'] });
			onCerrar();
			toast.success('Producto actualizado', {
				style: { background: '#ECFDF5', color: '#065F46', border: '1px solid #A7F3D0' },
			});
		},
		onError: (error) => {
			toast.error(`Error al actualizar: ${(error as Error).message}`);
		},
	});

	const validar = () => {
		if (nombre.trim().length < 3) return 'El nombre debe tener al menos 3 caracteres';
		if (sabor.trim().length < 2) return 'El sabor es requerido';
		if (!precio || isNaN(Number(precio)) || Number(precio) <= 0) return 'Precio inválido';
		if (stock < 0) return 'El stock no puede ser negativo';
		if (!categoriaId) return 'Selecciona una categoría';
		return '';
	};

	const onSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		const msg = validar();
		if (msg) {
			toast.error(msg);
			return;
		}

			const payload: UpdateProductoDto = {
				nombre: nombre.trim(),
				descripcion: descripcion ? descripcion.trim() : null,
				sabor: sabor.trim(),
				precio: Number(Number(precio).toFixed(2)),
				stock: Number(stock),
				imagenUrl: imagenUrlInput ? imagenUrlInput.trim() : null,
				categoriaId: Number(categoriaId),
				activo,
			};
			updateMutation.mutate(payload);
	};

	if (!abierto) return null;

	return (
		<div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
			<div className="bg-white rounded-2xl w-full max-w-2xl shadow-xl max-h-[90vh] flex flex-col">
				<div className="flex items-center justify-between px-6 py-4 border-b sticky top-0 bg-white z-10">
					<h3 className="text-lg font-semibold text-gray-900">Editar producto</h3>
					<button onClick={onCerrar} className="text-gray-500 hover:text-gray-700 text-2xl" aria-label="Cerrar">
						×
					</button>
				</div>

				<div className="p-6 overflow-y-auto flex-1">
					<form id="form-producto-editar" onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">
						<div className="md:col-span-2">
							<label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
							<input
								value={nombre}
								onChange={(e) => setNombre(e.target.value)}
								className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-indigo-200"
								placeholder="Ej. Helado de Chocolate"
								required
							/>
						</div>

						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">Sabor *</label>
							<input
								value={sabor}
								onChange={(e) => setSabor(e.target.value)}
								className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-indigo-200"
								placeholder="Ej. Chocolate"
								required
							/>
						</div>

						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">Precio *</label>
							<input
								type="number"
								step="0.01"
								min="0"
								value={precio}
								onChange={(e) => setPrecio(e.target.value)}
								className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-indigo-200"
								placeholder="0.00"
								required
							/>
						</div>

						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">Stock *</label>
							<input
								type="number"
								min={0}
								value={stock}
								onChange={(e) => setStock(Number(e.target.value))}
								className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-indigo-200"
								placeholder="0"
								required
							/>
						</div>

						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">Categoría *</label>
							<select
								value={categoriaId}
								onChange={(e) => setCategoriaId(e.target.value ? Number(e.target.value) : '')}
								className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-indigo-200 bg-white"
								required
							>
								<option value="" disabled>
									{catLoading ? 'Cargando...' : 'Selecciona una categoría'}
								</option>
								{catError && <option value="" disabled>Error al cargar</option>}
								{categoriasActivas.map((c) => (
									<option key={c.id} value={c.id}>
										{c.nombre}
									</option>
								))}
							</select>
						</div>

						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
							<label className="inline-flex items-center gap-2 text-sm text-gray-700">
								<input
									type="checkbox"
									className="rounded border-gray-300"
									checked={activo}
									onChange={(e) => setActivo(e.target.checked)}
								/>
								Activo
							</label>
						</div>

						<div className="md:col-span-2">
							<label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
							<textarea
								value={descripcion}
								onChange={(e) => setDescripcion(e.target.value)}
								rows={3}
								className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-indigo-200"
								placeholder="Descripción breve del producto"
							/>
						</div>

									<div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
										<div className="md:col-span-2">
											<label className="block text-sm font-medium text-gray-700 mb-1">URL de imagen</label>
											<div className="flex gap-2">
												<input
													value={imagenUrlInput}
													onChange={(e) => setImagenUrlInput(e.target.value)}
													className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-indigo-200"
													placeholder="https://ejemplo.com/imagen.jpg"
												/>
												<button
													type="button"
													onClick={() => {
														setPreviewError(null);
														setImagenPreviewUrl(imagenUrlInput.trim());
													}}
													className="px-3 py-2 bg-gray-100 rounded-md border hover:bg-gray-200 text-sm"
													title="Cargar vista previa"
												>
													Cargar
												</button>
											</div>
											<p className="mt-1 text-xs text-gray-500">Usa una URL pública (opcional). Si es Imgur, usa i.imgur.com con extensión .jpg/.png.</p>
											{previewError && (
												<p className="mt-1 text-xs text-red-600">{previewError}</p>
											)}
										</div>
										<div className="border rounded-md overflow-hidden aspect-square bg-gray-50 flex items-center justify-center">
											{imagenPreviewUrl ? (
												<img
													src={imagenPreviewUrl}
													alt="previsualización"
													className="w-full h-full object-cover"
													onError={() => setPreviewError('No se pudo cargar la imagen. Verifica que el enlace sea directo a un archivo .jpg/.png/.webp.')}
												/>
											) : (
												<span className="text-xs text-gray-400">Sin vista previa</span>
											)}
										</div>
									</div>
					</form>
				</div>

				<div className="px-6 py-4 border-t sticky bottom-0 bg-white z-10 flex justify-end gap-3">
					<button type="button" onClick={onCerrar} className="px-5 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
						Cancelar
					</button>
					<button
						type="submit"
						form="form-producto-editar"
						disabled={updateMutation.isPending}
						className="px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-60"
					>
						{updateMutation.isPending ? 'Guardando...' : 'Guardar cambios'}
					</button>
				</div>
			</div>
		</div>
	);
};

export default EditarProducto;

