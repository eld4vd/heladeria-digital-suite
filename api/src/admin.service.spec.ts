import { AdminService } from './admin.service';
import { CatalogService } from './catalog.service';
import { UpdateStaffDto } from './dto';
import { OrdersService } from './orders.service';
import { PrismaService } from './prisma.service';

jest.mock('bcrypt', () => ({ hash: jest.fn().mockResolvedValue('updated-password-hash') }));

describe('Sesiones al editar usuarios internos', () => {
  const existing = { id: 'staff-test', nombre: 'Administrador', correo: 'staff@example.test', telefono: null, rol: 'ADMINISTRADOR', activo: true, huellaContrasena: 'previous-hash', creadoEn: new Date() };
  const tx = {
    $executeRaw: jest.fn().mockResolvedValue(1),
    usuario: {
      findUnique: jest.fn().mockResolvedValue(existing),
      count: jest.fn().mockResolvedValue(1),
      update: jest.fn().mockImplementation(async ({ data }: { data: Record<string, unknown> }) => ({ ...existing, ...Object.fromEntries(Object.entries(data).filter(([, value]) => value !== undefined)) })),
    },
    sesion: { updateMany: jest.fn().mockResolvedValue({ count: 1 }) },
  };
  const prisma = { $transaction: jest.fn().mockImplementation(async (callback: (transaction: typeof tx) => unknown) => callback(tx)) };
  const admin = new AdminService(prisma as unknown as PrismaService, {} as CatalogService, {} as OrdersService);
  beforeEach(() => { jest.clearAllMocks(); });

  it.each<[string, UpdateStaffDto]>([
    ['nombre', { name: 'Nombre actualizado' }],
    ['correo', { email: 'nuevo@example.test' }],
    ['mismo rol', { role: 'ADMIN' }],
  ])('conserva la sesión al cambiar %s', async (_label, dto) => {
    await admin.updateStaff(existing.id, dto, existing.id);
    expect(tx.sesion.updateMany).not.toHaveBeenCalled();
    expect(tx.usuario.update).toHaveBeenCalledTimes(1);
  });

  it.each<[string, UpdateStaffDto]>([
    ['contraseña', { password: 'UpdatedSecret123!' }],
    ['desactivación', { active: false }],
  ])('revoca las sesiones por %s', async (_label, dto) => {
    await admin.updateStaff(existing.id, dto, 'another-admin');
    expect(tx.sesion.updateMany).toHaveBeenCalledWith({ where: { usuarioId: existing.id }, data: { expiraEn: new Date(0) } });
  });
});

describe('Ventas simuladas reconocidas al despacho', () => {
  const sale = {
    id: 'pedido-despachado', estado: 'DESPACHADO', totalUnidadesMenores: 3500,
    creadoEn: new Date('2026-09-01T12:00:00Z'), despachadoEn: new Date('2026-10-09T20:00:00Z'),
    detalles: [{ nombreProducto: 'Paleta de chocolate', cantidad: 1, totalUnidadesMenores: 2300 }],
    pagos: [{ medio: 'TARJETA_DEMOSTRACION', estado: 'APROBADO', creadoEn: new Date('2026-09-02T12:00:00Z') }],
  };
  const prisma = { pedido: { findMany: jest.fn(), groupBy: jest.fn(), count: jest.fn() } };
  const catalog = { settings: jest.fn().mockResolvedValue({ moneda: 'BOB', zonaHoraria: 'America/La_Paz' }) };
  const admin = new AdminService(prisma as unknown as PrismaService, catalog as unknown as CatalogService, {} as OrdersService);

  beforeEach(() => {
    jest.clearAllMocks();
    prisma.pedido.findMany.mockResolvedValue([sale]);
    prisma.pedido.groupBy.mockResolvedValue([{ estado: 'DESPACHADO', _count: { _all: 1 } }]);
    prisma.pedido.count.mockResolvedValue(0);
  });

  it('selecciona únicamente pedidos despachados con pago aprobado y agrupa por fecha de despacho', async () => {
    const report = await admin.reports('2026-10-09', '2026-10-09');
    expect(prisma.pedido.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: { estado: 'DESPACHADO', pagos: { some: { estado: 'APROBADO' } }, despachadoEn: { gte: new Date('2026-10-09T04:00:00Z'), lt: new Date('2026-10-10T04:00:00Z') } },
    }));
    expect(report).toMatchObject({ revenueMinor: 3500, paidOrders: 1, daily: [{ date: '2026-10-09', revenueMinor: 3500, count: 1 }] });
  });

  it('no cuenta dos veces un pedido y explicita históricos sin fecha, sin asignarlos a un día', async () => {
    prisma.pedido.findMany.mockResolvedValue([{ ...sale, despachadoEn: null, pagos: [...sale.pagos, ...sale.pagos] }]);
    prisma.pedido.count.mockResolvedValue(1);
    const report = await admin.reports();
    expect(report).toMatchObject({ revenueMinor: 3500, paidOrders: 1, undatedOrders: 1, daily: [] });
    expect(report.byMethod[0]).toMatchObject({ method: 'DEMO_CARD', count: 1, amountMinor: 3500 });
    expect(prisma.pedido.findMany).toHaveBeenCalledWith(expect.objectContaining({ where: { estado: 'DESPACHADO', pagos: { some: { estado: 'APROBADO' } } } }));
  });
});
