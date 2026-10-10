import { config } from 'dotenv';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client';
import { seedInitialData } from '../src/initial-data';

config({ path: '.env', quiet: true });
const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error('DATABASE_URL es obligatoria para el seed manual.');
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

seedInitialData(prisma, {
  onlyIfUninitialized: true,
  adminEmail: process.env.DEMO_ADMIN_EMAIL,
  adminPassword: process.env.DEMO_ADMIN_PASSWORD,
  adminName: process.env.DEMO_ADMIN_NAME,
}).then((created) => {
  console.info(created ? 'Administrador inicial creado. No se cargaron datos del negocio.' : 'El administrador ya existe. No se modificaron datos ni credenciales.');
}).catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : 'Error del seed.');
  process.exitCode = 1;
}).finally(() => prisma.$disconnect());
