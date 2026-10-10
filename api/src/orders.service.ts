import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { randomBytes } from 'node:crypto';
import { PrismaService } from './prisma.service';
import { CreateOrderDto, OrderItemDto, PaymentDto, StatusDto } from './dto';
import { Prisma } from './generated/prisma/client';
import { SessionContext } from './security';
import { assertTransition, groupedQuantities, inputHash, quoteItems, requireKey } from './order-rules';
import { estadoPagoApi, estadoPedidoApi, estadoPedidoDatos, extraApi, medioPagoApi, medioPagoDatos, OrderStatus, presentacionApi } from './contracts';

export const orderInclude = { detalles: true, pagos: { orderBy: { creadoEn: 'asc' as const } }, historial: { orderBy: { creadoEn: 'asc' as const } } };
export function publicOrder(order: Prisma.PedidoGetPayload<{ include: typeof orderInclude }>) {
  return {
    id: order.id, code: order.codigo, status: estadoPedidoApi(order.estado), customerName: order.nombreCliente, email: order.correo, phone: order.telefono, deliveryAddress: order.direccionEntrega, city: order.ciudad, reference: order.referencia,
    subtotalMinor: order.subtotalUnidadesMenores, deliveryFeeMinor: order.costoEnvioUnidadesMenores, totalMinor: order.totalUnidadesMenores, currency: order.moneda, createdAt: order.creadoEn, dispatchedAt: order.despachadoEn,
    items: order.detalles.map((item) => ({ id: item.id, productName: item.nombreProducto, presentationName: item.nombrePresentacion, quantity: item.cantidad, unitPriceMinor: item.precioUnitarioUnidadesMenores, totalMinor: item.totalUnidadesMenores, flavors: item.sabores, extras: item.extras })),
    payments: order.pagos.map((p) => ({ id: p.id, method: medioPagoApi(p.medio), status: estadoPagoApi(p.estado), amountMinor: p.importeUnidadesMenores, createdAt: p.creadoEn })),
    history: order.historial.map((h) => ({ id: h.id, fromStatus: h.estadoAnterior ? estadoPedidoApi(h.estadoAnterior) : null, toStatus: estadoPedidoApi(h.estadoNuevo), note: h.nota, createdAt: h.creadoEn })),
  };
}

type Transaction = Prisma.TransactionClient;
const cantidadesDelPedido = (detalles: { presentacionId: string; cantidad: number }[]) => groupedQuantities(detalles.map(detalle => ({ presentationId: detalle.presentacionId, quantity: detalle.cantidad })));

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}
  private requireAccount(session: SessionContext) {
    if (!session.usuarioId || !session.usuario || !session.usuario.activo || session.usuario.id !== session.usuarioId) {
      throw new UnauthorizedException('Inicia sesión en tu cuenta para continuar.');
    }
    return session.usuario;
  }
  private requireCustomer(session: SessionContext) {
    const user = this.requireAccount(session);
    if (user.rol !== 'CLIENTE') throw new ForbiddenException('Las compras requieren una cuenta de cliente.');
    return user.id;
  }
  private async quote(tx: Transaction, items: OrderItemDto[]) {
    const extraIds = [...new Set(items.flatMap(item => item.extraIds))];
    const [presentations, extras] = await Promise.all([
      tx.presentacion.findMany({ where: { id: { in: items.map(item => item.presentationId) } }, include: { producto: { include: { categoria: true, sabor: true } } } }),
      tx.extra.findMany({ where: { id: { in: extraIds }, activo: true } }),
    ]);
    return quoteItems(items, presentations.map(p => ({
      ...presentacionApi(p),
      product: { name: p.producto.nombre, flavor: p.producto.sabor ? { id: p.producto.sabor.id, name: p.producto.sabor.nombre } : null, active: p.producto.activo, category: { active: p.producto.categoria.activo } },
    })), extras.map(extraApi));
  }
  private owns(order: { sesionId: string; usuarioId: string | null }, session: SessionContext) {
    return order.sesionId === session.id || (!!session.usuarioId && order.usuarioId === session.usuarioId) || session.usuario?.rol === 'ADMINISTRADOR';
  }
  async get(id: string, session: SessionContext) {
    this.requireAccount(session);
    const order = await this.prisma.pedido.findUnique({ where: { id }, include: orderInclude });
    if (!order || !this.owns(order, session)) throw new NotFoundException('Pedido no encontrado.');
    return order;
  }
  account(userId: string) { return this.prisma.pedido.findMany({ where: { usuarioId: userId }, include: orderInclude, orderBy: { creadoEn: 'desc' }, take: 500 }); }
  async create(dto: CreateOrderDto, session: SessionContext, key?: string) {
    const customerId = this.requireCustomer(session);
    const idempotencyKey = requireKey(key);
    const requestHash = inputHash(dto);
    return this.prisma.$transaction(async (tx) => {
      // La cuenta conserva la idempotencia aunque el login renueve la sesión.
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtextextended(${customerId + ':' + idempotencyKey}, 0))`;
      const existing = await tx.pedido.findFirst({ where: { usuarioId: customerId, claveIdempotencia: idempotencyKey }, include: orderInclude, orderBy: [{ creadoEn: 'asc' }, { id: 'asc' }] });
      if (existing) {
        if (existing.huellaSolicitud !== requestHash) throw new ConflictException('Esta clave ya se utilizó para otro pedido.');
        return existing;
      }
      const settings = await tx.configuracionNegocio.findUnique({ where: { id: 'shop' } });
      if (!settings?.envioHabilitado) throw new ConflictException('El delivery no está disponible en este momento.');
      const items = await this.quote(tx, dto.items);
      const subtotalMinor = items.reduce((sum, item) => sum + item.totalMinor, 0);
      if (!Number.isSafeInteger(subtotalMinor) || subtotalMinor + settings.costoEnvioUnidadesMenores > 2147483647) throw new ConflictException('El importe del pedido supera el máximo permitido.');
      return tx.pedido.create({
        data: {
          codigo: 'DEL-' + randomBytes(5).toString('hex').toUpperCase(),
          sesionId: session.id, usuarioId: customerId, claveIdempotencia: idempotencyKey, huellaSolicitud: requestHash,
          nombreCliente: dto.customerName.trim(), correo: dto.email.trim().toLowerCase(), telefono: dto.phone.trim(), direccionEntrega: dto.deliveryAddress.trim(), ciudad: dto.city.trim(), referencia: dto.reference?.trim(),
          subtotalUnidadesMenores: subtotalMinor, costoEnvioUnidadesMenores: settings.costoEnvioUnidadesMenores, totalUnidadesMenores: subtotalMinor + settings.costoEnvioUnidadesMenores, moneda: settings.moneda,
          detalles: { create: items.map(item => ({
            presentacionId: item.presentationId, nombreProducto: item.productName, nombrePresentacion: item.presentationName, cantidad: item.quantity,
            precioUnitarioUnidadesMenores: item.unitPriceMinor, totalUnidadesMenores: item.totalMinor,
            identificadoresSabores: item.flavorIds, identificadoresExtras: item.extraIds, sabores: item.flavors, extras: item.extras,
          })) },
          historial: { create: { estadoNuevo: 'PENDIENTE_PAGO', nota: 'Pedido creado. Pago de demostración pendiente.' } },
        }, include: orderInclude,
      });
    }, { maxWait: 10000, timeout: 15000 });
  }
  private async lock(tx: Transaction, id: string) {
    const rows = await tx.$queryRaw<{ id: string }[]>`SELECT "id" FROM "pedidos" WHERE "id" = ${id} FOR UPDATE`;
    if (!rows.length) throw new NotFoundException('Pedido no encontrado.');
    return tx.pedido.findUniqueOrThrow({ where: { id }, include: orderInclude });
  }
  async pay(id: string, dto: PaymentDto, session: SessionContext, key?: string) {
    this.requireCustomer(session);
    await this.get(id, session);
    const idempotencyKey = requireKey(key);
    const requestHash = inputHash(dto);
    return this.prisma.$transaction(async (tx) => {
      const order = await this.lock(tx, id);
      if (!this.owns(order, session)) throw new NotFoundException('Pedido no encontrado.');
      const existing = order.pagos.find((p) => p.claveIdempotencia === idempotencyKey);
      if (existing) {
        if (existing.huellaSolicitud !== requestHash) throw new ConflictException('Esta clave ya se utilizó para otro intento de pago.');
        return order;
      }
      if (order.estado !== 'PENDIENTE_PAGO') {
        if (dto.scenario === 'APPROVED' && order.estado !== 'CANCELADO' && order.pagos.some((p) => p.estado === 'APROBADO')) return order;
        throw new ConflictException('Este pedido ya no admite pagos.');
      }
      if (dto.scenario === 'REJECTED') {
        await tx.intentoPago.create({ data: { pedidoId: id, claveIdempotencia: idempotencyKey, huellaSolicitud: requestHash, medio: medioPagoDatos(dto.method), estado: 'RECHAZADO', importeUnidadesMenores: order.totalUnidadesMenores } });
      } else {
        // Conserva la cotizacion historica; vuelve a comprobar disponibilidad.
        await this.quote(tx, order.detalles.map((item) => ({ presentationId: item.presentacionId, quantity: item.cantidad, extraIds: item.identificadoresExtras as string[] })));
        // Orden estable de bloqueos para carritos simultaneos con varias presentaciones.
        for (const [presentationId, quantity] of cantidadesDelPedido(order.detalles)) {
          const changed = await tx.presentacion.updateMany({ where: { id: presentationId, activo: true, existencias: { gte: quantity }, producto: { activo: true, categoria: { activo: true } } }, data: { existencias: { decrement: quantity } } });
          if (changed.count !== 1) throw new ConflictException('Un helado se agotó o dejó de estar disponible. No se aprobó el pago.');
          const presentation = await tx.presentacion.findUniqueOrThrow({ where: { id: presentationId } });
          await tx.movimientoInventario.create({ data: { presentacionId: presentationId, pedidoId: id, tipo: 'RESERVA', variacion: -quantity, existenciasResultantes: presentation.existencias, motivo: 'Reserva por pago aprobado ' + order.codigo, actorId: session.usuarioId } });
        }
        await tx.intentoPago.create({ data: { pedidoId: id, claveIdempotencia: idempotencyKey, huellaSolicitud: requestHash, medio: medioPagoDatos(dto.method), estado: 'APROBADO', importeUnidadesMenores: order.totalUnidadesMenores } });
        await tx.pedido.update({ where: { id }, data: { estado: 'CONFIRMADO' } });
        await tx.historialPedido.create({ data: { pedidoId: id, estadoAnterior: 'PENDIENTE_PAGO', estadoNuevo: 'CONFIRMADO', nota: 'Pago de demostración aprobado; stock reservado para despacho.', actorId: session.usuarioId } });
      }
      return tx.pedido.findUniqueOrThrow({ where: { id }, include: orderInclude });
    }, { maxWait: 10000, timeout: 15000 });
  }
  async status(id: string, dto: StatusDto, actorId: string) {
    const estado = estadoPedidoDatos(dto.status);
    return this.prisma.$transaction(async (tx) => {
      const order = await this.lock(tx, id);
      if (order.estado === estado) return order;
      assertTransition(estadoPedidoApi(order.estado), dto.status);
      const nota = dto.note?.trim();
      if (estado === 'CANCELADO' && (!nota || nota.length < 3)) throw new BadRequestException('Indica un motivo de cancelación de al menos 3 caracteres.');
      let despachadoEn: Date | undefined;
      if (estado === 'DESPACHADO') {
        if (!order.pagos.some(pago => pago.estado === 'APROBADO')) throw new ConflictException('El pedido necesita un pago aprobado antes de despacharse.');
        despachadoEn = new Date();
        // La reserva ya descontó las unidades al aprobar el pago. El despacho
        // registra la venta sin consumir stock por segunda vez.
        for (const [presentacionId] of cantidadesDelPedido(order.detalles)) {
          const rows = await tx.$queryRaw<{ existencias: number }[]>`SELECT "existencias" FROM "presentaciones" WHERE "id" = ${presentacionId} FOR UPDATE`;
          if (!rows.length) throw new NotFoundException('El tamaño del helado no existe.');
          await tx.movimientoInventario.create({ data: { presentacionId, pedidoId: id, tipo: 'VENTA', variacion: 0, existenciasResultantes: rows[0].existencias, motivo: 'Despacho y venta simulada ' + order.codigo, actorId, creadoEn: despachadoEn } });
        }
      }
      if (estado === 'CANCELADO' && order.estado === 'CONFIRMADO') {
        for (const [presentationId, quantity] of cantidadesDelPedido(order.detalles)) {
          const presentation = await tx.presentacion.update({ where: { id: presentationId }, data: { existencias: { increment: quantity } } });
          await tx.movimientoInventario.create({ data: { presentacionId: presentationId, pedidoId: id, tipo: 'REPOSICION', variacion: quantity, existenciasResultantes: presentation.existencias, motivo: 'Cancelación ' + order.codigo, actorId } });
        }
        await tx.intentoPago.updateMany({ where: { pedidoId: id, estado: 'APROBADO' }, data: { estado: 'REVERTIDO' } });
      }
      await tx.pedido.update({ where: { id }, data: { estado, ...(despachadoEn ? { despachadoEn } : {}) } });
      await tx.historialPedido.create({ data: { pedidoId: id, estadoAnterior: order.estado, estadoNuevo: estado, nota: nota || 'Pedido despachado al delivery. Venta simulada registrada; no confirma la entrega al cliente.', actorId, ...(despachadoEn ? { creadoEn: despachadoEn } : {}) } });
      return tx.pedido.findUniqueOrThrow({ where: { id }, include: orderInclude });
    }, { maxWait: 10000, timeout: 15000 });
  }
  list(status?: OrderStatus, query?: string) {
    return this.prisma.pedido.findMany({ where: { ...(status ? { estado: estadoPedidoDatos(status) } : {}), ...(query ? { OR: [{ codigo: { contains: query, mode: 'insensitive' } }, { nombreCliente: { contains: query, mode: 'insensitive' } }, { correo: { contains: query, mode: 'insensitive' } }] } : {}) }, include: orderInclude, orderBy: { creadoEn: 'desc' }, take: 500 });
  }
}
