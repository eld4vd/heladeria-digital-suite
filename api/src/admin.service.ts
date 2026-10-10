import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { hash as passwordHash } from 'bcrypt';
import { PrismaService } from './prisma.service';
import { CatalogService, emptyShopSettings, productInclude } from './catalog.service';
import { OrdersService, orderInclude } from './orders.service';
import { CategoryDto, ExtraDto, FlavorDto, InventoryDto, PresentationDto, ProductDto, ProductSizeDto, SettingsDto, StaffDto, UpdateCategoryDto, UpdateExtraDto, UpdateFlavorDto, UpdatePresentationDto, UpdateProductDto, UpdateStaffDto } from './dto';
import { safeUser } from './security';
import { Prisma } from './generated/prisma/client';
import { normalizeFlavorName } from './flavor-name';
import { categoriaApi, configuracionApi, direccionApi, estadoPedidoApi, extraApi, medioPagoDatos, PaymentMethod, presentacionConProductoApi, productoApi, saborApi } from './contracts';

const presentationInclude = { producto: { include: { sabor: true } } };
@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService, private readonly catalog: CatalogService, private readonly orders: OrdersService) {}
  async products() {
    const [products, extras] = await Promise.all([
      this.prisma.producto.findMany({ include: productInclude, orderBy: { nombre: 'asc' } }),
      this.prisma.extra.findMany({ where: { activo: true }, orderBy: { nombre: 'asc' } }),
    ]);
    return products.map(product => productoApi(product, extras));
  }
  async categories() { return (await this.prisma.categoria.findMany({ orderBy: { nombre: 'asc' } })).map(categoriaApi); }
  async flavors() { return (await this.prisma.sabor.findMany({ orderBy: { nombre: 'asc' } })).map(saborApi); }
  async extras() { return (await this.prisma.extra.findMany({ orderBy: { nombre: 'asc' } })).map(extraApi); }
  async presentations() { return (await this.prisma.presentacion.findMany({ include: presentationInclude, orderBy: { nombre: 'asc' } })).map(presentacionConProductoApi); }
  async movements() {
    const rows = await this.prisma.movimientoInventario.findMany({ include: { presentacion: { include: presentationInclude } }, orderBy: { creadoEn: 'desc' }, take: 500 });
    const tipos = { AJUSTE: 'ADJUSTMENT', RESERVA: 'RESERVATION', VENTA: 'SALE', REPOSICION: 'RESTOCK' } as const;
    return rows.map(row => ({ id: row.id, presentationId: row.presentacionId, orderId: row.pedidoId, type: tipos[row.tipo], delta: row.variacion, stockAfter: row.existenciasResultantes, reason: row.motivo, actorId: row.actorId, createdAt: row.creadoEn, presentation: presentacionConProductoApi(row.presentacion) }));
  }
  async createCategory(dto: CategoryDto) { return categoriaApi(await this.prisma.categoria.create({ data: { nombre: dto.name, identificadorUrl: dto.slug, descripcion: dto.description, activo: dto.active } })); }
  async updateCategory(id: string, dto: UpdateCategoryDto) { return categoriaApi(await this.prisma.categoria.update({ where: { id }, data: { nombre: dto.name, identificadorUrl: dto.slug, descripcion: dto.description, activo: dto.active } })); }
  deleteCategory(id: string) { return this.updateCategory(id, { active: false }); }
  async createFlavor(dto: FlavorDto) {
    const { name, key } = normalizeFlavorName(dto.name);
    if (name.length < 2) throw new BadRequestException('Escribe un nombre de sabor de al menos 2 caracteres.');
    try {
      return saborApi(await this.prisma.sabor.create({ data: { nombre: name, nombreNormalizado: key, activo: dto.active } }));
    } catch (error) { return flavorConflict(error); }
  }
  async updateFlavor(id: string, dto: UpdateFlavorDto) {
    const normalized = dto.name === undefined ? undefined : normalizeFlavorName(dto.name);
    if (normalized && normalized.name.length < 2) throw new BadRequestException('Escribe un nombre de sabor de al menos 2 caracteres.');
    try {
      return saborApi(await this.prisma.sabor.update({ where: { id }, data: { activo: dto.active, ...(normalized ? { nombre: normalized.name, nombreNormalizado: normalized.key } : {}) } }));
    } catch (error) { return flavorConflict(error); }
  }
  deleteFlavor(id: string) { return this.updateFlavor(id, { active: false }); }
  async createExtra(dto: ExtraDto) { return extraApi(await this.prisma.extra.create({ data: { nombre: dto.name, precioUnidadesMenores: dto.priceMinor, urlImagen: dto.imageUrl, activo: dto.active } })); }
  async updateExtra(id: string, dto: UpdateExtraDto) { return extraApi(await this.prisma.extra.update({ where: { id }, data: { nombre: dto.name, precioUnidadesMenores: dto.priceMinor, urlImagen: dto.imageUrl, activo: dto.active } })); }
  deleteExtra(id: string) { return this.updateExtra(id, { active: false }); }
  async createProduct(dto: ProductDto, actorId?: string) {
    const { presentations } = dto;
    assertProductSizes(presentations, true);
    return this.prisma.$transaction(async (tx) => {
      await assertProductFlavor(tx, dto.flavorId);
      const product = await tx.producto.create({
        data: {
          nombre: dto.name, identificadorUrl: dto.slug, descripcion: dto.description, saborId: dto.flavorId ?? null, urlImagen: dto.imageUrl, categoriaId: dto.categoryId, destacado: dto.featured, activo: dto.active,
          presentaciones: { create: presentations.map(size => ({ nombre: size.name.trim(), precioUnidadesMenores: size.priceMinor, existencias: size.stock!, activo: size.active ?? true })) },
        },
        include: productInclude,
      });
      const movements = product.presentaciones.filter(size => size.existencias > 0).map(size => ({ presentacionId: size.id, tipo: 'AJUSTE' as const, variacion: size.existencias, existenciasResultantes: size.existencias, motivo: 'Stock inicial del tamaño del helado.', actorId }));
      if (movements.length) await tx.movimientoInventario.createMany({ data: movements });
      const extras = await tx.extra.findMany({ where: { activo: true }, orderBy: { nombre: 'asc' } });
      return productoApi(product, extras);
    });
  }
  updateProduct(id: string, dto: UpdateProductDto, actorId?: string) {
    const { presentations } = dto;
    if (presentations) assertProductSizes(presentations, false);
    return this.prisma.$transaction(async (tx) => {
      if (dto.flavorId !== undefined) {
        const existing = await tx.producto.findUniqueOrThrow({ where: { id }, select: { saborId: true } });
        await assertProductFlavor(tx, dto.flavorId, existing.saborId);
      }
      if (presentations) {
        const ids = presentations.flatMap(size => size.id ? [size.id] : []);
        const owned = await tx.presentacion.findMany({ where: { productoId: id, id: { in: ids } }, select: { id: true } });
        if (owned.length !== ids.length) throw new BadRequestException('Un tamaño no pertenece a este helado.');
      }
      await tx.producto.update({ where: { id }, data: {
        nombre: dto.name, identificadorUrl: dto.slug, descripcion: dto.description, urlImagen: dto.imageUrl, categoriaId: dto.categoryId, destacado: dto.featured, activo: dto.active,
        ...(dto.flavorId !== undefined ? { saborId: dto.flavorId } : {}),
      } });
      for (const size of presentations || []) {
        const fields = { nombre: size.name.trim(), precioUnidadesMenores: size.priceMinor, ...(size.active == null ? {} : { activo: size.active }) };
        if (size.id) await tx.presentacion.update({ where: { id: size.id }, data: fields });
        else {
          const created = await tx.presentacion.create({ data: { ...fields, productoId: id, existencias: size.stock! } });
          if (created.existencias > 0) await tx.movimientoInventario.create({ data: { presentacionId: created.id, tipo: 'AJUSTE', variacion: created.existencias, existenciasResultantes: created.existencias, motivo: 'Stock inicial del tamaño del helado.', actorId } });
        }
      }
      const [product, extras] = await Promise.all([
        tx.producto.findUniqueOrThrow({ where: { id }, include: productInclude }),
        tx.extra.findMany({ where: { activo: true }, orderBy: { nombre: 'asc' } }),
      ]);
      return productoApi(product, extras);
    });
  }
  deleteProduct(id: string) { return this.updateProduct(id, { active: false }); }
  createPresentation(dto: PresentationDto, actorId: string) {
    return this.prisma.$transaction(async (tx) => {
      const presentation = await tx.presentacion.create({ data: { productoId: dto.productId, nombre: dto.name, precioUnidadesMenores: dto.priceMinor, existencias: dto.stock, activo: dto.active }, include: presentationInclude });
      if (dto.stock) await tx.movimientoInventario.create({ data: { presentacionId: presentation.id, tipo: 'AJUSTE', variacion: dto.stock, existenciasResultantes: dto.stock, motivo: 'Stock inicial de la presentación.', actorId } });
      return presentacionConProductoApi(presentation);
    });
  }
  async updatePresentation(id: string, dto: UpdatePresentationDto) {
    if (dto.stock !== undefined) throw new BadRequestException('Usa el módulo de inventario para modificar existencias y registrar el motivo.');
    const existing = await this.prisma.presentacion.findUniqueOrThrow({ where: { id } });
    if (dto.productId && dto.productId !== existing.productoId) throw new BadRequestException('No puedes mover una presentación a otro producto.');
    return presentacionConProductoApi(await this.prisma.presentacion.update({ where: { id }, data: { productoId: dto.productId, nombre: dto.name, precioUnidadesMenores: dto.priceMinor, activo: dto.active }, include: presentationInclude }));
  }
  deletePresentation(id: string) { return this.updatePresentation(id, { active: false }); }
  adjust(dto: InventoryDto, actorId: string) {
    if (dto.delta === 0) throw new BadRequestException('El ajuste debe cambiar las existencias.');
    return this.prisma.$transaction(async (tx) => {
      const result = await tx.presentacion.updateMany({ where: { id: dto.presentationId, ...(dto.delta < 0 ? { existencias: { gte: -dto.delta } } : { existencias: { lte: 1000000 - dto.delta } }) }, data: { existencias: { increment: dto.delta } } });
      if (result.count !== 1) throw new ConflictException('Presentación inexistente o ajuste fuera del rango de stock permitido.');
      const presentation = await tx.presentacion.findUniqueOrThrow({ where: { id: dto.presentationId }, include: presentationInclude });
      await tx.movimientoInventario.create({ data: { presentacionId: dto.presentationId, tipo: 'AJUSTE', variacion: dto.delta, existenciasResultantes: presentation.existencias, motivo: dto.reason.trim(), actorId } });
      return presentacionConProductoApi(presentation);
    });
  }
  async customers() {
    const users = await this.prisma.usuario.findMany({ where: { rol: 'CLIENTE' }, include: { direcciones: true, pedidos: { include: orderInclude, orderBy: { creadoEn: 'desc' } } }, orderBy: { creadoEn: 'desc' }, take: 500 });
    return users.map((user) => ({ ...safeUser(user), addresses: user.direcciones.map(direccionApi), orders: user.pedidos }));
  }
  payments() { return this.prisma.intentoPago.findMany({ include: { pedido: { include: orderInclude } }, orderBy: { creadoEn: 'desc' }, take: 500 }); }
  async staff() { return (await this.prisma.usuario.findMany({ where: { rol: 'ADMINISTRADOR' }, orderBy: { nombre: 'asc' } })).map(safeUser); }
  async createStaff(dto: StaffDto) {
    if (dto.role !== 'ADMIN') throw new BadRequestException('El personal interno debe tener el rol ADMIN.');
    if (Buffer.byteLength(dto.password, 'utf8') > 72) throw new BadRequestException('La contraseña supera 72 bytes.');
    return safeUser(await this.prisma.usuario.create({ data: { nombre: dto.name, correo: dto.email.trim().toLowerCase(), huellaContrasena: await passwordHash(dto.password, 12), rol: 'ADMINISTRADOR', activo: dto.active } }));
  }
  async updateStaff(id: string, dto: UpdateStaffDto, actorId: string) {
    if (dto.role !== undefined && dto.role !== 'ADMIN') throw new BadRequestException('El personal interno debe tener el rol ADMIN.');
    if (dto.password && Buffer.byteLength(dto.password, 'utf8') > 72) throw new BadRequestException('La contraseña supera 72 bytes.');
    const encrypted = dto.password ? await passwordHash(dto.password, 12) : undefined;
    const rol = dto.role === undefined ? undefined : 'ADMINISTRADOR' as const;
    return this.prisma.$transaction(async (tx) => {
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(772011)`;
      const existing = await tx.usuario.findUnique({ where: { id } });
      if (!existing || existing.rol !== 'ADMINISTRADOR') throw new NotFoundException('Usuario interno no encontrado.');
      if (actorId === id && (dto.active === false || (rol && rol !== existing.rol))) throw new BadRequestException('No puedes retirar tu propio acceso interno.');
      if (existing.rol === 'ADMINISTRADOR' && existing.activo && dto.active === false) {
        if (await tx.usuario.count({ where: { rol: 'ADMINISTRADOR', activo: true, id: { not: id } } }) < 1) throw new ConflictException('Debe existir al menos un administrador activo.');
      }
      const user = await tx.usuario.update({ where: { id }, data: { nombre: dto.name, correo: dto.email?.trim().toLowerCase(), rol, activo: dto.active, huellaContrasena: encrypted } });
      if (dto.password || dto.active === false || (rol !== undefined && rol !== existing.rol)) await tx.sesion.updateMany({ where: { usuarioId: id }, data: { expiraEn: new Date(0) } });
      return safeUser(user);
    });
  }
  async settings(dto: SettingsDto) {
    try {
      if (dto.locale) new Intl.NumberFormat(dto.locale);
      if (dto.timezone) new Intl.DateTimeFormat('es', { timeZone: dto.timezone });
      if (dto.currency) new Intl.NumberFormat('es', { style: 'currency', currency: dto.currency });
    } catch { throw new BadRequestException('Moneda, idioma o zona horaria inválidos.'); }
    const previous = await this.catalog.settings();
    if (dto.currency && dto.currency !== previous.moneda && await this.prisma.pedido.count() > 0) throw new ConflictException('No cambies la moneda después de registrar pedidos; los reportes usan una sola moneda.');
    const data = { nombre: dto.name, descripcion: dto.description, moneda: dto.currency, idioma: dto.locale, zonaHoraria: dto.timezone, direccion: dto.address, ciudad: dto.city, telefono: dto.phone, correo: dto.email, horarios: dto.hours, descripcionCobertura: dto.coverageText, costoEnvioUnidadesMenores: dto.deliveryFeeMinor, envioHabilitado: dto.deliveryEnabled };
    // Los valores omitidos no deben sobrescribir la configuracion inicial al crear.
    const createData = {
      nombre: dto.name ?? emptyShopSettings.nombre, descripcion: dto.description ?? emptyShopSettings.descripcion,
      moneda: dto.currency ?? emptyShopSettings.moneda, idioma: dto.locale ?? emptyShopSettings.idioma, zonaHoraria: dto.timezone ?? emptyShopSettings.zonaHoraria,
      direccion: dto.address ?? emptyShopSettings.direccion, ciudad: dto.city ?? emptyShopSettings.ciudad, telefono: dto.phone ?? emptyShopSettings.telefono,
      correo: dto.email ?? emptyShopSettings.correo, horarios: dto.hours ?? emptyShopSettings.horarios, descripcionCobertura: dto.coverageText ?? emptyShopSettings.descripcionCobertura,
      costoEnvioUnidadesMenores: dto.deliveryFeeMinor ?? emptyShopSettings.costoEnvioUnidadesMenores, envioHabilitado: dto.deliveryEnabled ?? emptyShopSettings.envioHabilitado,
    };
    return configuracionApi(await this.prisma.configuracionNegocio.upsert({ where: { id: 'shop' }, update: data, create: { id: 'shop', ...createData } }));
  }
  async overview() {
    const [pendingOrders, totalOrders, sales, lowStock, recentOrders] = await Promise.all([
      this.prisma.pedido.count({ where: { estado: { in: ['PENDIENTE_PAGO', 'CONFIRMADO'] } } }),
      this.prisma.pedido.count(),
      this.prisma.pedido.findMany({ where: { estado: 'DESPACHADO', pagos: { some: { estado: 'APROBADO' } } }, include: { detalles: true } }),
      this.prisma.presentacion.findMany({ where: { activo: true, existencias: { lte: 5 } }, include: presentationInclude, orderBy: { existencias: 'asc' }, take: 20 }),
      this.orders.list(),
    ]);
    return { pendingOrders, totalOrders, revenueMinor: sales.reduce((sum, order) => sum + order.totalUnidadesMenores, 0), lowStock: lowStock.map(presentacionConProductoApi), recentOrders: recentOrders.slice(0, 8), topProducts: topProducts(sales.flatMap(order => order.detalles)) };
  }
  async reports(from?: string, to?: string) {
    const settings = await this.catalog.settings();
    const periodo: Prisma.DateTimeFilter = {};
    if (from) periodo.gte = businessDate(from, settings.zonaHoraria, false);
    if (to) periodo.lt = businessDate(to, settings.zonaHoraria, true);
    if (periodo.gte && periodo.lt && new Date(periodo.gte as Date) >= new Date(periodo.lt as Date)) throw new BadRequestException('El período de fechas no es válido.');
    const filtrarPeriodo = Boolean(from || to);
    const [sales, statuses, undatedOrders] = await Promise.all([
      this.prisma.pedido.findMany({
        where: { estado: 'DESPACHADO', pagos: { some: { estado: 'APROBADO' } }, ...(filtrarPeriodo ? { despachadoEn: periodo } : {}) },
        include: { detalles: true, pagos: { where: { estado: 'APROBADO' }, orderBy: { creadoEn: 'asc' }, take: 1 } },
        orderBy: [{ despachadoEn: 'asc' }, { id: 'asc' }],
      }),
      // Esta métrica operativa agrupa pedidos recibidos por fecha de creación;
      // no se utiliza para calcular ventas, cuyo período es el del despacho.
      this.prisma.pedido.groupBy({ by: ['estado'], where: { creadoEn: periodo }, _count: { _all: true } }),
      this.prisma.pedido.count({ where: { estado: 'DESPACHADO', despachadoEn: null, pagos: { some: { estado: 'APROBADO' } } } }),
    ]);
    const revenueMinor = sales.reduce((sum, order) => sum + order.totalUnidadesMenores, 0);
    const byMethod = Object.values(PaymentMethod).map((method) => { const rows = sales.filter(order => order.pagos[0]?.medio === medioPagoDatos(method)); return { method, count: rows.length, amountMinor: rows.reduce((sum, order) => sum + order.totalUnidadesMenores, 0) }; });
    const days = new Map<string, { date: string; revenueMinor: number; count: number }>();
    for (const order of sales) {
      // Los históricos sin evento de despacho no reciben una fecha inventada.
      if (!order.despachadoEn) continue;
      const date = new Intl.DateTimeFormat('en-CA', { timeZone: settings.zonaHoraria, year: 'numeric', month: '2-digit', day: '2-digit' }).format(order.despachadoEn);
      const row = days.get(date) ?? { date, revenueMinor: 0, count: 0 };
      row.revenueMinor += order.totalUnidadesMenores; row.count++; days.set(date, row);
    }
    return { currency: settings.moneda, revenueMinor, paidOrders: sales.length, averageOrderMinor: sales.length ? Math.round(revenueMinor / sales.length) : 0, undatedOrders, byStatus: statuses.map((row) => ({ status: estadoPedidoApi(row.estado), count: row._count._all })), byMethod, topProducts: topProducts(sales.flatMap(order => order.detalles)), daily: [...days.values()] };
  }
  async csv(from?: string, to?: string) {
    const report = await this.reports(from, to);
    const escape = (value: unknown) => '"' + String(value).replace(/^[=+\-@]/, "'").replaceAll('"', '""') + '"';
    const rows: unknown[][] = [['Reporte de ventas simuladas al despacho', report.currency], ['Pedidos despachados', report.paidOrders], ['Total (unidades menores)', report.revenueMinor], ...(report.undatedOrders ? [['Históricos sin fecha de despacho', report.undatedOrders], ['Nota', from || to ? 'Los históricos sin fecha se excluyen del período.' : 'Incluidos en el total general, no en la distribución diaria.']] : []), [], ['Fecha de despacho', 'Pedidos despachados', 'Total (unidades menores)'], ...report.daily.map((d) => [d.date, d.count, d.revenueMinor]), [], ['Producto', 'Unidades', 'Subtotal (unidades menores)'], ...report.topProducts.map((p) => [p.name, p.quantity, p.revenueMinor])];
    return '\uFEFF' + rows.map((row) => row.map(escape).join(',')).join('\r\n');
  }
}
async function assertProductFlavor(tx: Prisma.TransactionClient, id?: string | null, currentId?: string | null) {
  if (id == null) return;
  const flavor = await tx.sabor.findUnique({ where: { id } });
  if (!flavor) throw new BadRequestException('El sabor no existe. Selecciona uno de la lista o crea uno nuevo.');
  if (!flavor.activo && id !== currentId) throw new BadRequestException('Este sabor está inactivo. Reactívalo o selecciona otro.');
}
function flavorConflict(error: unknown): never {
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
    throw new ConflictException('Ya existe un sabor con ese nombre, aunque cambien las mayúsculas o los espacios. Utiliza el existente o reactívalo.');
  }
  throw error;
}
function assertProductSizes(sizes: ProductSizeDto[], creating: boolean) {
  if (!Array.isArray(sizes) || sizes.length < 1 || sizes.length > 20) throw new BadRequestException('Añade entre 1 y 20 tamaños al helado. Una sola opción Normal es suficiente.');
  const ids = new Set<string>();
  for (const size of sizes) {
    if (size.name.trim().length < 2) throw new BadRequestException('Escribe un nombre de al menos 2 caracteres para cada tamaño.');
    if (creating && size.id) throw new BadRequestException('Los tamaños de un helado nuevo también deben ser nuevos.');
    if (size.id) {
      if (ids.has(size.id)) throw new BadRequestException('No repitas un tamaño en el mismo formulario.');
      ids.add(size.id);
      if (size.stock !== undefined) throw new BadRequestException('Para cambiar existencias de un tamaño ya creado, utiliza Inventario.');
    } else if (size.stock === undefined || size.stock === null) throw new BadRequestException('Indica el stock inicial de cada tamaño nuevo.');
  }
}
function topProducts(items: { nombreProducto: string; cantidad: number; totalUnidadesMenores: number }[]) {
  const grouped = new Map<string, { name: string; quantity: number; revenueMinor: number }>();
  for (const item of items) { const p = grouped.get(item.nombreProducto) ?? { name: item.nombreProducto, quantity: 0, revenueMinor: 0 }; p.quantity += item.cantidad; p.revenueMinor += item.totalUnidadesMenores; grouped.set(item.nombreProducto, p); }
  return [...grouped.values()].sort((a, b) => b.quantity - a.quantity).slice(0, 10);
}
function businessDate(value: string, timezone: string, next: boolean) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) throw new BadRequestException('Las fechas deben usar YYYY-MM-DD.');
  const source = new Date(value + 'T00:00:00Z');
  if (!Number.isFinite(source.getTime()) || source.toISOString().slice(0, 10) !== value) throw new BadRequestException('Fecha inválida.');
  if (next) source.setUTCDate(source.getUTCDate() + 1);
  const wanted = source.getTime();
  let result = wanted;
  // Calcula la medianoche local considerando el horario de verano de la zona horaria del negocio.
  for (let i = 0; i < 3; i++) {
    const parts = new Intl.DateTimeFormat('en-US', { timeZone: timezone, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23' }).formatToParts(new Date(result));
    const n = (type: string) => Number(parts.find((p) => p.type === type)?.value);
    const local = Date.UTC(n('year'), n('month') - 1, n('day'), n('hour'), n('minute'), n('second'));
    result += wanted - local;
  }
  return new Date(result);
}
