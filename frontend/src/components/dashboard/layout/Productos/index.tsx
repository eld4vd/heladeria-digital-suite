import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productService } from '../../../../services/producto.service';
import AgregarProducto from './AProducto';
import EditarProducto from './EProducto';
import type { Producto } from '../../../../models/Producto';

const currency = (v: string | number) =>
	new Intl.NumberFormat('es-BO', { style: 'currency', currency: 'BOB' }).format(
		typeof v === 'string' ? Number(v) : v,
	);

const Productos = () => {
	const queryClient = useQueryClient();
			const [confirmId, setConfirmId] = useState<number | null>(null);
	const [busqueda, setBusqueda] = useState('');
	const [soloActivos, setSoloActivos] = useState(true);
		const [modalNuevo, setModalNuevo] = useState(false);
			const [failedImages, setFailedImages] = useState<Set<number>>(new Set());
			const [modalEditar, setModalEditar] = useState(false);
			const [productoEdit, setProductoEdit] = useState<Producto | null>(null);

	const { data: productos, isLoading, error } = useQuery({
		queryKey: ['productos'],
		queryFn: productService.getProductos,
	});

	const deleteMutation = useMutation({
		mutationFn: (id: number) => productService.deleteProducto(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['productos'] });
			setConfirmId(null);
		},
	});

	const lista = (productos || [])
		.filter((p) => (soloActivos ? p.activo : true))
		.filter((p) =>
			[p.nombre, p.sabor, p.descripcion || '', p.categoria?.nombre]
				.join(' ')
				.toLowerCase()
				.includes(busqueda.toLowerCase()),
		);

	if (isLoading) return <div className="p-8 text-sm text-slate-500">Cargando productos...</div>;
	if (error)
		return (
			<div className="p-6 rounded-[22px] border border-red-200 bg-red-50 text-sm text-red-700 shadow-sm">
				<span className="font-semibold">Error:</span> {(error as Error).message}
			</div>
		);

	return (
		<div className="w-full space-y-6">
			{/* Header con filtros */}
			<div className="flex flex-col gap-5 rounded-[28px] border border-slate-200/80 bg-white p-7 lg:p-8 shadow-lg shadow-slate-200/50">
				<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
					<div>
						<p className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400 leading-none">Inventario</p>
						<h2 className="mt-2.5 text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight">Gestión de productos</h2>
						<p className="mt-2 text-sm text-slate-600 leading-relaxed">Controla disponibilidad, stock y precios de cada helado desde una vista completa.</p>
					</div>
					<button
						onClick={() => setModalNuevo(true)}
						className="inline-flex items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-indigo-700 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-200/50 transition-all duration-200 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
					>
						+ Nuevo producto
					</button>
				</div>
				
				{/* Filtros */}
				<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-t border-slate-100 pt-5">
					<label className="flex items-center gap-2.5 text-sm font-semibold text-slate-700 cursor-pointer group">
						<input
							type="checkbox"
							className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition cursor-pointer"
							checked={soloActivos}
							onChange={(e) => setSoloActivos(e.target.checked)}
						/>
						<span className="group-hover:text-slate-900 transition">Solo activos</span>
					</label>
					<div className="flex items-center gap-3">
						<input
							value={busqueda}
							onChange={(e) => setBusqueda(e.target.value)}
							className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm shadow-sm focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all sm:w-80"
							placeholder="Buscar por nombre, sabor o categoría..."
						/>
						<div className="text-xs font-semibold text-slate-500">
							{lista.length} {lista.length === 1 ? 'producto' : 'productos'}
						</div>
					</div>
				</div>
			</div>

			{/* Tabla de productos */}
			<div className="overflow-hidden rounded-[26px] border border-slate-200/80 bg-white shadow-lg shadow-slate-200/50">
				<div className="overflow-x-auto">
					<table className="min-w-full divide-y divide-slate-200">
						<thead className="bg-gradient-to-br from-slate-50 to-slate-100/60">
							<tr>
								<th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-[0.25em] text-slate-500">
									Producto
								</th>
								<th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-[0.25em] text-slate-500">
									Categoría
								</th>
								<th className="px-6 py-4 text-right text-[10px] font-bold uppercase tracking-[0.25em] text-slate-500">
									Precio
								</th>
								<th className="px-6 py-4 text-center text-[10px] font-bold uppercase tracking-[0.25em] text-slate-500">
									Stock
								</th>
								<th className="px-6 py-4 text-center text-[10px] font-bold uppercase tracking-[0.25em] text-slate-500">
									Estado
								</th>
								<th className="px-6 py-4 text-right text-[10px] font-bold uppercase tracking-[0.25em] text-slate-500">
									Acciones
								</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-slate-100 bg-white">
							{lista.map((p) => (
								<tr key={p.id} className="group transition-all duration-200 hover:bg-slate-50/80">
									{/* Producto con thumbnail */}
									<td className="px-6 py-4">
										<div className="flex items-center gap-4">
											<div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
												{p.imagenUrl && !failedImages.has(p.id) ? (
													<img
														src={p.imagenUrl}
														alt={p.nombre}
														className="h-full w-full object-cover transition group-hover:scale-105"
														onError={() =>
															setFailedImages((prev) => {
																const s = new Set(prev);
																s.add(p.id);
																return s;
															})
														}
													/>
												) : (
													<div className="flex h-full w-full items-center justify-center text-slate-400">
														<svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
															<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
														</svg>
													</div>
												)}
											</div>
											<div className="min-w-0 flex-1">
												<h3 className="text-sm font-bold text-slate-900 truncate group-hover:text-indigo-600 transition">
													{p.nombre}
												</h3>
												{p.sabor && (
													<p className="mt-0.5 text-xs text-slate-500 truncate">{p.sabor}</p>
												)}
												{p.descripcion && (
													<p className="mt-1 text-xs text-slate-500 line-clamp-1">{p.descripcion}</p>
												)}
											</div>
										</div>
									</td>
									
									{/* Categoría */}
									<td className="px-6 py-4 whitespace-nowrap">
										<span className="inline-flex items-center rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
											{p.categoria?.nombre || 'Sin categoría'}
										</span>
									</td>
									
									{/* Precio */}
									<td className="px-6 py-4 whitespace-nowrap text-right">
										<span className="text-sm font-bold text-slate-900">{currency(p.precio)}</span>
									</td>
									
									{/* Stock con indicador visual */}
									<td className="px-6 py-4 whitespace-nowrap text-center">
										<div className="inline-flex flex-col items-center gap-1">
											<span className={`text-base font-bold ${
												Number(p.stock) === 0 
													? 'text-rose-600' 
													: Number(p.stock) <= 5 
													? 'text-amber-600' 
													: 'text-slate-900'
											}`}>
												{p.stock}
											</span>
											{Number(p.stock) <= 5 && Number(p.stock) > 0 && (
												<span className="text-[10px] font-bold uppercase tracking-wider text-amber-600">Bajo</span>
											)}
											{Number(p.stock) === 0 && (
												<span className="text-[10px] font-bold uppercase tracking-wider text-rose-600">Agotado</span>
											)}
										</div>
									</td>
									
									{/* Estado */}
									<td className="px-6 py-4 whitespace-nowrap text-center">
										<span
											className={`inline-flex px-3 py-1.5 rounded-full text-xs font-bold shadow-sm ${
												p.activo
													? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
													: 'bg-rose-100 text-rose-800 border border-rose-200'
											}`}
										>
											{p.activo ? 'Activo' : 'Inactivo'}
										</span>
									</td>
									
									{/* Acciones */}
									<td className="px-6 py-4 whitespace-nowrap text-right">
										<div className="flex items-center justify-end gap-2">
											<button
												onClick={() => {
													setProductoEdit(p);
													setModalEditar(true);
												}}
												className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 shadow-sm transition-all duration-200 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
											>
												Editar
											</button>
											<button
												onClick={() => setConfirmId(p.id)}
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

			{/* Empty state */}
			{lista.length === 0 && (
				<div className="rounded-[26px] border border-slate-200/80 bg-white p-12 text-center shadow-lg shadow-slate-200/50">
					<div className="mx-auto max-w-sm">
						<svg className="mx-auto h-12 w-12 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
						</svg>
						<p className="mt-4 text-base font-semibold text-slate-700">No hay productos para mostrar</p>
						<p className="mt-2 text-sm text-slate-500">
							{soloActivos 
								? 'No hay productos activos. Desactiva el filtro o agrega nuevos productos.' 
								: 'Comienza agregando tu primer producto al inventario.'}
						</p>
						<button
							onClick={() => setModalNuevo(true)}
							className="mt-6 inline-flex items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-indigo-700 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-200/50 transition-all duration-200 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
						>
							+ Agregar primer producto
						</button>
					</div>
				</div>
			)}

			{/* Modal de confirmación */}
			{confirmId !== null && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm px-4">
					<div className="w-full max-w-md rounded-[22px] border border-slate-200 bg-white p-7 shadow-2xl">
						<h3 className="text-xl font-bold text-slate-900">Confirmar eliminación</h3>
						<p className="mt-3 text-sm text-slate-600 leading-relaxed">
							Esta acción eliminará el producto permanentemente del inventario.
						</p>
						<div className="mt-6 flex justify-end gap-3">
							<button
								onClick={() => setConfirmId(null)}
								className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition-all duration-200 hover:bg-slate-50 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
							>
								Cancelar
							</button>
							<button
								onClick={() => deleteMutation.mutate(confirmId)}
								disabled={deleteMutation.isPending}
								className="rounded-xl bg-gradient-to-br from-rose-600 to-rose-700 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-rose-200/50 transition-all duration-200 hover:shadow-xl disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
							>
								{deleteMutation.isPending ? 'Eliminando...' : 'Eliminar'}
							</button>
						</div>
					</div>
				</div>
			)}

			{/* Modal: agregar producto */}
			<AgregarProducto abierto={modalNuevo} onCerrar={() => setModalNuevo(false)} />

			{/* Modal: editar producto */}
			{modalEditar && productoEdit && (
				<EditarProducto
					abierto={modalEditar}
					onCerrar={() => {
						setModalEditar(false);
						setProductoEdit(null);
					}}
					producto={productoEdit}
				/>
			)}
		</div>
	);
};

export default Productos;
