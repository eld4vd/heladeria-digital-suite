import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { PrismaService } from './prisma.service';
import { SeedService } from './seed.service';
import { SecurityGuard, SessionService } from './security';
import { AuthService } from './auth.service';
import { CatalogService } from './catalog.service';
import { OrdersService } from './orders.service';
import { AdminService } from './admin.service';
import { AccountController, AdminController, AuthController, CatalogController, OrdersController } from './controllers';

function validate(environment: Record<string, unknown>) {
  const database = String(environment.DATABASE_URL ?? '');
  if (!/^postgres(ql)?:\/\//.test(database)) throw new Error('DATABASE_URL es obligatoria. Configura la base del ecommerce en api/.env.');
  const frontend = String(environment.FRONTEND_ORIGIN ?? 'http://localhost:3000');
  const url = new URL(frontend);
  if (!['http:', 'https:'].includes(url.protocol)) throw new Error('FRONTEND_ORIGIN debe ser http o https.');
  const admin = String(environment.ADMIN_ORIGIN ?? 'http://localhost:3001');
  const adminUrl = new URL(admin);
  if (!['http:', 'https:'].includes(adminUrl.protocol)) throw new Error('ADMIN_ORIGIN debe ser http o https.');
  const port = Number(environment.PORT ?? 4000);
  const days = Number(environment.SESSION_DAYS ?? 7);
  if (!Number.isInteger(port) || port < 1 || port > 65535 || !Number.isInteger(days) || days < 1 || days > 30) throw new Error('PORT o SESSION_DAYS fuera de rango.');
  const seedOnStart = String(environment.SEED_ON_START ?? 'false').toLowerCase();
  if (!['true', 'false'].includes(seedOnStart)) throw new Error('SEED_ON_START debe ser true o false.');
  return { ...environment, FRONTEND_ORIGIN: url.origin, ADMIN_ORIGIN: adminUrl.origin, PORT: port, SESSION_DAYS: days, SEED_ON_START: seedOnStart === 'true' };
}
@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env', validate }), ThrottlerModule.forRoot([{ ttl: 60000, limit: 120 }])],
  controllers: [CatalogController, AuthController, AccountController, OrdersController, AdminController],
  providers: [PrismaService, SeedService, SessionService, AuthService, CatalogService, OrdersService, AdminService, { provide: APP_GUARD, useClass: ThrottlerGuard }, { provide: APP_GUARD, useClass: SecurityGuard }],
})
export class AppModule {}
