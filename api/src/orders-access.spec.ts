import { Reflector } from '@nestjs/core';
import { OrdersController } from './controllers';
import { CreateOrderDto } from './dto';
import { RolUsuario } from './generated/prisma/client';
import { inputHash } from './order-rules';
import { OrdersService } from './orders.service';
import { PrismaService } from './prisma.service';
import { SessionContext } from './security';

describe('Compras con cuenta de cliente', () => {
  const body: CreateOrderDto = {
    items: [{ presentationId: 'size-test', quantity: 1, extraIds: [] }],
    customerName: 'Cliente', email: 'cliente@example.test', phone: '77123456',
    deliveryAddress: 'Calle de prueba 123', city: 'Sucre',
  };
  const payment = { method: 'DEMO_CARD', scenario: 'APPROVED' } as const;
  const session = (userId: string | null, role: RolUsuario = 'CLIENTE'): SessionContext => ({
    id: `session-${userId ?? 'guest'}`, huellaToken: 'a'.repeat(64), tokenCsrf: 'b'.repeat(64),
    usuarioId: userId, expiraEn: new Date(Date.now() + 3600000), creadoEn: new Date(),
    usuario: userId ? {
      id: userId, nombre: 'Cliente', correo: `${userId}@example.test`, telefono: null,
      huellaContrasena: 'sin-login-en-esta-prueba', rol: role, activo: true,
      creadoEn: new Date(), actualizadoEn: new Date(),
    } : null,
  });
  let prisma: { $transaction: jest.Mock; pedido: { findUnique: jest.Mock } };
  let service: OrdersService;

  beforeEach(() => {
    prisma = { $transaction: jest.fn(), pedido: { findUnique: jest.fn() } };
    service = new OrdersService(prisma as unknown as PrismaService);
  });

  it('protege el controlador completo y limita creación y pagos al rol CLIENTE', () => {
    const reflector = new Reflector();
    expect(reflector.get<boolean>('authenticated', OrdersController)).toBe(true);
    expect(reflector.get<RolUsuario[]>('roles', OrdersController.prototype.create)).toEqual(['CLIENTE']);
    expect(reflector.get<RolUsuario[]>('roles', OrdersController.prototype.pay)).toEqual(['CLIENTE']);
  });

  it('rechaza invitados antes de consultar o abrir transacciones', async () => {
    const guest = session(null);
    await expect(service.create(body, guest, 'create-key')).rejects.toMatchObject({ status: 401 });
    await expect(service.pay('order-test', payment, guest, 'payment-key')).rejects.toMatchObject({ status: 401 });
    await expect(service.get('order-test', guest)).rejects.toMatchObject({ status: 401 });
    expect(prisma.$transaction).not.toHaveBeenCalled();
    expect(prisma.pedido.findUnique).not.toHaveBeenCalled();
  });

  it.each<RolUsuario>(['ADMINISTRADOR', 'OPERADOR'])('no permite comprar con el rol interno %s', async (role) => {
    const internal = session('internal-user', role);
    await expect(service.create(body, internal, 'create-key')).rejects.toMatchObject({ status: 403 });
    await expect(service.pay('order-test', payment, internal, 'payment-key')).rejects.toMatchObject({ status: 403 });
    expect(prisma.$transaction).not.toHaveBeenCalled();
    expect(prisma.pedido.findUnique).not.toHaveBeenCalled();
  });

  it('rechaza cuentas inactivas aunque se invoque el servicio sin el guard', async () => {
    const inactive = session('inactive-user');
    inactive.usuario!.activo = false;
    await expect(service.create(body, inactive, 'create-key')).rejects.toMatchObject({ status: 401 });
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it('admite la cuenta de cliente antes de ejecutar la transacción de creación', async () => {
    prisma.$transaction.mockResolvedValue({ id: 'order-test' });
    await expect(service.create(body, session('customer'), 'create-key')).resolves.toMatchObject({ id: 'order-test' });
    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
  });

  it('busca y bloquea la clave por cuenta después de renovar la sesión', async () => {
    const order = { id: 'order-test', usuarioId: 'customer', sesionId: 'old-session', huellaSolicitud: inputHash(body) };
    const tx = { $executeRaw: jest.fn(), pedido: { findFirst: jest.fn().mockResolvedValue(order) } };
    prisma.$transaction.mockImplementation(async (work: (transaction: typeof tx) => Promise<unknown>) => work(tx));
    const renewed = { ...session('customer'), id: 'renewed-session' };
    await expect(service.create(body, renewed, 'create-key')).resolves.toBe(order);
    expect(tx.$executeRaw.mock.calls[0][1]).toBe('customer:create-key');
    expect(tx.pedido.findFirst).toHaveBeenCalledWith(expect.objectContaining({ where: { usuarioId: 'customer', claveIdempotencia: 'create-key' } }));
  });

  it('mantiene el conflicto por cuerpo distinto aunque se renueve la sesión', async () => {
    const order = { id: 'order-test', usuarioId: 'customer', sesionId: 'old-session', huellaSolicitud: inputHash(body) };
    const tx = { $executeRaw: jest.fn(), pedido: { findFirst: jest.fn().mockResolvedValue(order) } };
    prisma.$transaction.mockImplementation(async (work: (transaction: typeof tx) => Promise<unknown>) => work(tx));
    const renewed = { ...session('customer'), id: 'renewed-session' };
    await expect(service.create({ ...body, customerName: 'Otro nombre' }, renewed, 'create-key')).rejects.toMatchObject({ status: 409 });
  });

  it('permite consultar el pedido propio desde otra sesión de la misma cuenta', async () => {
    const order = { id: 'order-test', sesionId: 'old-session', usuarioId: 'customer' };
    prisma.pedido.findUnique.mockResolvedValue(order);
    await expect(service.get(order.id, session('customer'))).resolves.toBe(order);
  });

  it('mantiene la lectura administrativa de históricos sin propietario', async () => {
    const order = { id: 'order-test', sesionId: 'old-guest-session', usuarioId: null };
    prisma.pedido.findUnique.mockResolvedValue(order);
    await expect(service.get(order.id, session('admin-user', 'ADMINISTRADOR'))).resolves.toBe(order);
  });

  it('no expone ni permite pagar el pedido de otro cliente', async () => {
    prisma.pedido.findUnique.mockResolvedValue({ id: 'order-test', sesionId: 'other-session', usuarioId: 'other-user' });
    await expect(service.get('order-test', session('customer'))).rejects.toMatchObject({ status: 404 });
    await expect(service.pay('order-test', payment, session('customer'), 'payment-key')).rejects.toMatchObject({ status: 404 });
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it.each([undefined, '', '   ', 'ab'])('exige un motivo válido antes de escribir una cancelación nueva (%s)', async (note) => {
    const order = { id: 'order-test', estado: 'CONFIRMADO' };
    const tx = {
      $queryRaw: jest.fn().mockResolvedValue([{ id: order.id }]),
      pedido: { findUniqueOrThrow: jest.fn().mockResolvedValue(order), update: jest.fn() },
    };
    prisma.$transaction.mockImplementation(async (work: (transaction: typeof tx) => Promise<unknown>) => work(tx));
    await expect(service.status(order.id, { status: 'CANCELED', note }, 'admin-user')).rejects.toMatchObject({ status: 400 });
    expect(tx.pedido.update).not.toHaveBeenCalled();
  });

  it('guarda el motivo sin espacios exteriores y conserva la cancelación idempotente', async () => {
    const order = { id: 'order-test', estado: 'PENDIENTE_PAGO' };
    const canceled = { ...order, estado: 'CANCELADO' };
    const tx = {
      $queryRaw: jest.fn().mockResolvedValue([{ id: order.id }]),
      pedido: { findUniqueOrThrow: jest.fn().mockResolvedValueOnce(order).mockResolvedValue(canceled), update: jest.fn() },
      historialPedido: { create: jest.fn() },
    };
    prisma.$transaction.mockImplementation(async (work: (transaction: typeof tx) => Promise<unknown>) => work(tx));
    await service.status(order.id, { status: 'CANCELED', note: '  Cliente canceló su pedido.  ' }, 'admin-user');
    expect(tx.historialPedido.create).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ nota: 'Cliente canceló su pedido.' }) }));
    await expect(service.status(order.id, { status: 'CANCELED' }, 'admin-user')).resolves.toBe(canceled);
    expect(tx.pedido.update).toHaveBeenCalledTimes(1);
    expect(tx.historialPedido.create).toHaveBeenCalledTimes(1);
  });
});
