import { config } from 'dotenv';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'node:crypto';
import { PrismaService } from './prisma.service';
import { OrdersService } from './orders.service';
import { SessionContext } from './security';
import { CreateOrderDto } from './dto';
import { normalizeFlavorName } from './flavor-name';

config({ path: '.env', quiet: true });
config({ path: '.env', quiet: true });
const testUrl = process.env.TEST_DATABASE_URL;
if (testUrl && (!new URL(testUrl).pathname.endsWith('_test') || testUrl === process.env.DATABASE_URL)) throw new Error('TEST_DATABASE_URL debe apuntar a una base independiente terminada en _test.');
const integration = testUrl ? describe : describe.skip;

integration('Transacciones reales PostgreSQL del ecommerce', () => {
  let prisma: PrismaService;
  let orders: OrdersService;
  let sesion: SessionContext;
  let other: SessionContext;
  let presentacionId: string;
  let extraId: string;
  const prefix = 'integration-' + randomUUID();
  const createdSessions: string[] = [];
  const createdUsers: string[] = [];
  const products: string[] = [];
  const categories: string[] = [];
  const sabores: string[] = [];
  const extras: string[] = [];
  const key = () => randomUUID();
  const dto = (): CreateOrderDto => ({ items: [{ presentationId: presentacionId, quantity: 1, extraIds: [extraId] }], customerName: 'Cliente prueba', email: 'cliente@example.test', phone: '77123456', deliveryAddress: 'Calle de prueba 123', city: 'Sucre' });
  beforeAll(async () => {
    prisma = new PrismaService(new ConfigService({ DATABASE_URL: testUrl }));
    await prisma.$connect();
    orders = new OrdersService(prisma);
    await prisma.configuracionNegocio.upsert({ where: { id: 'shop' }, update: { envioHabilitado: true, costoEnvioUnidadesMenores: 1200, moneda: 'BOB' }, create: { id: 'shop', nombre: 'Test shop', descripcion: 'Test', direccion: 'Test address', ciudad: 'Sucre', telefono: '12345678', correo: 'test@example.test', horarios: 'Test hours', descripcionCobertura: 'Test coverage', costoEnvioUnidadesMenores: 1200, envioHabilitado: true } });
  });
  beforeEach(async () => {
    const suffix = randomUUID();
    const categoria = await prisma.categoria.create({ data: { id: `${prefix}-cat-${suffix}`, nombre: 'Test', identificadorUrl: `${prefix}-cat-${suffix}` } }); categories.push(categoria.id);
    const flavorName = normalizeFlavorName(`${prefix}-flavor-${suffix}`);
    const f1 = await prisma.sabor.create({ data: { nombre: flavorName.name, nombreNormalizado: flavorName.key } }); sabores.push(f1.id);
    const extra = await prisma.extra.create({ data: { nombre: `${prefix}-extra-${suffix}`, precioUnidadesMenores: 300 } }); extras.push(extra.id); extraId = extra.id;
    const producto = await prisma.producto.create({ data: { identificadorUrl: `${prefix}-${suffix}`, nombre: 'Producto test', descripcion: 'Descripción del test', saborId: f1.id, urlImagen: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb', categoriaId: categoria.id } }); products.push(producto.id);
    const presentacion = await prisma.presentacion.create({ data: { productoId: producto.id, nombre: 'Mediano', precioUnidadesMenores: 2000, existencias: 4 } }); presentacionId = presentacion.id;
    // Estas pruebas usan cuentas reales de cliente; no ejercitan el formulario de login.
    const cliente = await prisma.usuario.create({ data: { nombre: 'Cliente de prueba', correo: `${prefix}-${suffix}@example.test`, huellaContrasena: 'sin-login-en-esta-prueba', rol: 'CLIENTE' } }); createdUsers.push(cliente.id);
    const otroCliente = await prisma.usuario.create({ data: { nombre: 'Otro cliente de prueba', correo: `${prefix}-other-${suffix}@example.test`, huellaContrasena: 'sin-login-en-esta-prueba', rol: 'CLIENTE' } }); createdUsers.push(otroCliente.id);
    sesion = await prisma.sesion.create({ data: { usuarioId: cliente.id, huellaToken: key(), tokenCsrf: 'a'.repeat(64), expiraEn: new Date(Date.now() + 3600000) }, include: { usuario: true } }); createdSessions.push(sesion.id);
    other = await prisma.sesion.create({ data: { usuarioId: otroCliente.id, huellaToken: key(), tokenCsrf: 'b'.repeat(64), expiraEn: new Date(Date.now() + 3600000) }, include: { usuario: true } }); createdSessions.push(other.id);
  });
  afterAll(async () => {
    if (!prisma) return;
    // Solo se eliminan los identificadores creados por esta suite, nunca toda la base de datos de pruebas.
    const variants = await prisma.presentacion.findMany({ where: { productoId: { in: products } }, select: { id: true } });
    await prisma.movimientoInventario.deleteMany({ where: { presentacionId: { in: variants.map((p) => p.id) } } });
    await prisma.pedido.deleteMany({ where: { sesionId: { in: createdSessions } } });
    await prisma.presentacion.deleteMany({ where: { productoId: { in: products } } });
    await prisma.producto.deleteMany({ where: { id: { in: products } } });
    await prisma.categoria.deleteMany({ where: { id: { in: categories } } });
    await prisma.sabor.deleteMany({ where: { id: { in: sabores } } });
    await prisma.extra.deleteMany({ where: { id: { in: extras } } });
    await prisma.sesion.deleteMany({ where: { id: { in: createdSessions } } });
    await prisma.usuario.deleteMany({ where: { id: { in: createdUsers } } });
    await prisma.$disconnect();
  });
  it('usa el precio del servidor, rechaza un pago sin stock y permite reintentar', async () => {
    const pedido = await orders.create(dto(), sesion, key());
    expect(pedido.totalUnidadesMenores).toBe(3500);
    const rejected = await orders.pay(pedido.id, { method: 'DEMO_CARD', scenario: 'REJECTED' }, sesion, key());
    expect(rejected.estado).toBe('PENDIENTE_PAGO');
    expect((await prisma.presentacion.findUniqueOrThrow({ where: { id: presentacionId } })).existencias).toBe(4);
    const paid = await orders.pay(pedido.id, { method: 'DEMO_QR', scenario: 'APPROVED' }, sesion, key());
    expect(paid.estado).toBe('CONFIRMADO');
    expect(paid.pagos.map((p) => p.estado)).toEqual(['RECHAZADO', 'APROBADO']);
    expect((await prisma.presentacion.findUniqueOrThrow({ where: { id: presentacionId } })).existencias).toBe(3);
  });
  it('creación y aprobación concurrentes con la misma clave son idempotentes', async () => {
    const createKey = key(); const body = dto();
    const [a, b] = await Promise.all([orders.create(body, sesion, createKey), orders.create(body, sesion, createKey)]);
    expect(a.id).toBe(b.id);
    const paymentKey = key();
    await Promise.all([orders.pay(a.id, { method: 'DEMO_CARD', scenario: 'APPROVED' }, sesion, paymentKey), orders.pay(a.id, { method: 'DEMO_CARD', scenario: 'APPROVED' }, sesion, paymentKey)]);
    expect(await prisma.intentoPago.count({ where: { pedidoId: a.id, estado: 'APROBADO' } })).toBe(1);
    expect((await prisma.presentacion.findUniqueOrThrow({ where: { id: presentacionId } })).existencias).toBe(3);
    await expect(orders.create({ ...body, customerName: 'Otro nombre' }, sesion, createKey)).rejects.toMatchObject({ status: 409 });
  });
  it('dos compras de la última unidad producen un solo pago aprobado', async () => {
    await prisma.presentacion.update({ where: { id: presentacionId }, data: { existencias: 1 } });
    const a = await orders.create(dto(), sesion, key()); const b = await orders.create(dto(), other, key());
    const results = await Promise.allSettled([orders.pay(a.id, { method: 'DEMO_CARD', scenario: 'APPROVED' }, sesion, key()), orders.pay(b.id, { method: 'DEMO_QR', scenario: 'APPROVED' }, other, key())]);
    expect(results.filter((r) => r.status === 'fulfilled')).toHaveLength(1);
    expect(await prisma.intentoPago.count({ where: { pedidoId: { in: [a.id, b.id] }, estado: 'APROBADO' } })).toBe(1);
    expect((await prisma.presentacion.findUniqueOrThrow({ where: { id: presentacionId } })).existencias).toBe(0);
  });
  it('conserva la creación idempotente tras renovar sesión sin compartir claves entre cuentas', async () => {
    const createKey = key(); const body = dto();
    const pedido = await orders.create(body, sesion, createKey);
    const renewed = await prisma.sesion.create({ data: { usuarioId: sesion.usuarioId, huellaToken: key(), tokenCsrf: 'c'.repeat(64), expiraEn: new Date(Date.now() + 3600000) }, include: { usuario: true } }); createdSessions.push(renewed.id);
    const retried = await orders.create(body, renewed, createKey);
    expect(retried.id).toBe(pedido.id);
    expect(retried.sesionId).toBe(sesion.id);
    expect(await prisma.pedido.count({ where: { usuarioId: sesion.usuarioId, claveIdempotencia: createKey } })).toBe(1);
    const separate = await orders.create(body, other, createKey);
    expect(separate.id).not.toBe(pedido.id);
    expect(separate.usuarioId).toBe(other.usuarioId);
    await expect(orders.create({ ...body, customerName: 'Otro nombre' }, renewed, createKey)).rejects.toMatchObject({ status: 409 });
  });
  it('revierte el primer descuento cuando otra presentación se agota después de validar el carrito', async () => {
    const first = await prisma.presentacion.findUniqueOrThrow({ where: { id: presentacionId } });
    const second = await prisma.presentacion.create({ data: { id: `${first.id}-z`, productoId: first.productoId, nombre: 'Segunda presentación', precioUnidadesMenores: 2500, existencias: 1 } });
    expect(first.id.localeCompare(second.id)).toBeLessThan(0);
    const body = dto(); body.items.push({ ...body.items[0], presentationId: second.id });
    const pedido = await orders.create(body, sesion, key());
    const discounts: { presentacionId: string | undefined; count: number }[] = [];
    const reservations: string[] = [];
    // Después de la comprobación previa real, otra conexión consume las existencias del segundo producto.
    // Cada escritura de pago sigue ejecutándose dentro de su transacción real de PostgreSQL.
    const observed = prisma.$extends({ query: {
      presentacion: {
        async findMany({ args, query }) {
          const rows = await query(args);
          await prisma.presentacion.update({ where: { id: second.id }, data: { existencias: 0 } });
          return rows;
        },
        async updateMany({ args, query }) {
          const result = await query(args);
          discounts.push({ presentacionId: typeof args.where?.id === 'string' ? args.where.id : undefined, count: result.count });
          return result;
        },
      },
      movimientoInventario: {
        async create({ args, query }) {
          const movement = await query(args);
          if (movement.tipo === 'RESERVA' && typeof movement.presentacionId === 'string') reservations.push(movement.presentacionId);
          return movement;
        },
      },
    } });
    const transactionalOrders = new OrdersService(observed as unknown as PrismaService);
    await expect(transactionalOrders.pay(pedido.id, { method: 'DEMO_CARD', scenario: 'APPROVED' }, sesion, key())).rejects.toMatchObject({ status: 409 });
    expect(discounts).toEqual([{ presentacionId: first.id, count: 1 }, { presentacionId: second.id, count: 0 }]);
    expect(reservations).toEqual([first.id]);
    expect((await prisma.presentacion.findUniqueOrThrow({ where: { id: first.id } })).existencias).toBe(4);
    expect((await prisma.presentacion.findUniqueOrThrow({ where: { id: second.id } })).existencias).toBe(0);
    expect(await prisma.movimientoInventario.count({ where: { pedidoId: pedido.id, tipo: 'RESERVA' } })).toBe(0);
    expect(await prisma.intentoPago.count({ where: { pedidoId: pedido.id } })).toBe(0);
    expect(await prisma.historialPedido.count({ where: { pedidoId: pedido.id, estadoNuevo: 'CONFIRMADO' } })).toBe(0);
    expect((await orders.get(pedido.id, sesion)).estado).toBe('PENDIENTE_PAGO');
  });
  it('agrupa stock por presentación y cancela/revierte una sola vez', async () => {
    const body = dto(); body.items.push({ ...body.items[0], extraIds: [] });
    const pedido = await orders.create(body, sesion, key());
    await orders.pay(pedido.id, { method: 'DEMO_QR', scenario: 'APPROVED' }, sesion, key());
    expect(await prisma.movimientoInventario.count({ where: { pedidoId: pedido.id, tipo: 'RESERVA' } })).toBe(1);
    expect(await prisma.movimientoInventario.count({ where: { pedidoId: pedido.id, tipo: 'VENTA' } })).toBe(0);
    await orders.status(pedido.id, { status: 'CANCELED', note: 'El cliente solicitó cancelar antes del despacho.' }, 'test-actor');
    await orders.status(pedido.id, { status: 'CANCELED', note: 'El cliente solicitó cancelar antes del despacho.' }, 'test-actor');
    expect((await prisma.presentacion.findUniqueOrThrow({ where: { id: presentacionId } })).existencias).toBe(4);
    expect(await prisma.movimientoInventario.count({ where: { pedidoId: pedido.id, tipo: 'REPOSICION' } })).toBe(1);
    expect((await orders.get(pedido.id, sesion)).pagos[0].estado).toBe('REVERTIDO');
  });
  it('mantiene precios históricos pero rechaza opciones desactivadas antes de aprobar', async () => {
    const pedido = await orders.create(dto(), sesion, key());
    const changedSize = await prisma.presentacion.update({ where: { id: presentacionId }, data: { precioUnidadesMenores: 9000 } });
    const changedProduct = await prisma.producto.findUniqueOrThrow({ where: { id: changedSize.productoId } });
    const renamedFlavor = normalizeFlavorName(`${prefix}-Cappuccino actualizado-${key()}`);
    await prisma.sabor.update({ where: { id: changedProduct.saborId! }, data: { nombre: renamedFlavor.name, nombreNormalizado: renamedFlavor.key } });
    await prisma.extra.update({ where: { id: extraId }, data: { activo: false } });
    await expect(orders.pay(pedido.id, { method: 'DEMO_CARD', scenario: 'APPROVED' }, sesion, key())).rejects.toMatchObject({ status: 400 });
    expect(await prisma.intentoPago.count({ where: { pedidoId: pedido.id } })).toBe(0);
    expect((await prisma.presentacion.findUniqueOrThrow({ where: { id: presentacionId } })).existencias).toBe(4);
    await prisma.extra.update({ where: { id: extraId }, data: { activo: true, nombre: 'Nombre nuevo' } });
    const paid = await orders.pay(pedido.id, { method: 'DEMO_CARD', scenario: 'APPROVED' }, sesion, key());
    expect(paid.totalUnidadesMenores).toBe(3500);
    expect(paid.detalles[0].sabores).toEqual(pedido.detalles[0].sabores);
    expect(paid.detalles[0].extras).toEqual(pedido.detalles[0].extras);
  });
  it('despacha una sola vez sin volver a descontar la reserva y sin admitir cancelación posterior', async () => {
    const pedido = await orders.create(dto(), sesion, key());
    await orders.pay(pedido.id, { method: 'DEMO_CARD', scenario: 'APPROVED' }, sesion, key());
    expect((await orders.get(pedido.id, sesion)).despachadoEn).toBeNull();
    const [first, duplicate] = await Promise.all([
      orders.status(pedido.id, { status: 'DISPATCHED' }, 'test-actor'),
      orders.status(pedido.id, { status: 'DISPATCHED' }, 'test-actor'),
    ]);
    expect(first.estado).toBe('DESPACHADO');
    expect(duplicate.despachadoEn).toEqual(first.despachadoEn);
    expect(first.despachadoEn).toBeInstanceOf(Date);
    expect((await prisma.presentacion.findUniqueOrThrow({ where: { id: presentacionId } })).existencias).toBe(3);
    expect(await prisma.movimientoInventario.count({ where: { pedidoId: pedido.id, tipo: 'RESERVA' } })).toBe(1);
    const sales = await prisma.movimientoInventario.findMany({ where: { pedidoId: pedido.id, tipo: 'VENTA' } });
    expect(sales).toHaveLength(1);
    expect(sales[0]).toMatchObject({ variacion: 0, existenciasResultantes: 3 });
    expect(await prisma.historialPedido.count({ where: { pedidoId: pedido.id, estadoNuevo: 'DESPACHADO' } })).toBe(1);
    await expect(orders.status(pedido.id, { status: 'CANCELED' }, 'test-actor')).rejects.toMatchObject({ status: 409 });
    expect((await prisma.presentacion.findUniqueOrThrow({ where: { id: presentacionId } })).existencias).toBe(3);
  });
  it('protege pedidos ajenos aunque el correo coincida y bloquea cancelación después de despachar', async () => {
    const pedido = await orders.create(dto(), sesion, key());
    await expect(orders.get(pedido.id, other)).rejects.toMatchObject({ status: 404 });
    await expect(orders.pay(pedido.id, { method: 'DEMO_CARD', scenario: 'APPROVED' }, other, key())).rejects.toMatchObject({ status: 404 });
    await orders.pay(pedido.id, { method: 'DEMO_CARD', scenario: 'APPROVED' }, sesion, key());
    await orders.status(pedido.id, { status: 'DISPATCHED' }, 'test-actor');
    await expect(orders.status(pedido.id, { status: 'CANCELED' }, 'test-actor')).rejects.toMatchObject({ status: 409 });
  });
});
