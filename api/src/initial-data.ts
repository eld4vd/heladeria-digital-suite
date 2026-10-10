import { hash } from 'bcrypt';
import { PrismaClient } from './generated/prisma/client';

export interface InitialSeedOptions {
  adminEmail?: string;
  adminPassword?: string;
  adminName?: string;
  onlyIfUninitialized?: boolean;
}

/** Ambas entradas del seed crean únicamente el administrador inicial. No insertan datos del negocio. */
export async function seedInitialData(prisma: PrismaClient, options: InitialSeedOptions): Promise<boolean> {
  return prisma.$transaction(async (tx) => {
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(506267649)`;
    if (options.onlyIfUninitialized && await tx.usuario.findFirst({ where: { rol: 'ADMINISTRADOR' } })) return false;

    const email = options.adminEmail?.trim().toLowerCase();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('Configura DEMO_ADMIN_EMAIL con un correo válido para el administrador inicial.');
    const existingAdmin = await tx.usuario.findUnique({ where: { correo: email } });
    if (existingAdmin && existingAdmin.rol !== 'ADMINISTRADOR') throw new Error('DEMO_ADMIN_EMAIL ya pertenece a una cuenta que no es administradora. El seed no cambiará sus permisos.');
    if (existingAdmin) return false;

    const password = options.adminPassword;
    if (!password || password.length < 10 || Buffer.byteLength(password, 'utf8') > 72) throw new Error('Configura DEMO_ADMIN_PASSWORD (mínimo 10 caracteres y máximo 72 bytes) para crear el administrador inicial.');
    await tx.usuario.create({
      data: {
        nombre: options.adminName?.trim() || 'Administración',
        correo: email,
        huellaContrasena: await hash(password, 12),
        rol: 'ADMINISTRADOR',
      },
    });
    return true;
  }, { maxWait: 10000, timeout: 15000 });
}
