import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { seedInitialData } from './initial-data';
import { PrismaService } from './prisma.service';

@Injectable()
export class SeedService implements OnApplicationBootstrap {
  private readonly logger = new Logger(SeedService.name);

  constructor(private readonly prisma: PrismaService, private readonly config: ConfigService) {}

  async onApplicationBootstrap(): Promise<void> {
    if (!this.config.get<boolean>('SEED_ON_START', false)) return;
    const initialized = await seedInitialData(this.prisma, {
      onlyIfUninitialized: true,
      adminEmail: this.config.get<string>('DEMO_ADMIN_EMAIL'),
      adminPassword: this.config.get<string>('DEMO_ADMIN_PASSWORD'),
      adminName: this.config.get<string>('DEMO_ADMIN_NAME'),
    });
    this.logger.log(initialized ? 'Administrador inicial creado. No se cargaron datos del negocio.' : 'El administrador ya existe; no se modificaron sus datos ni credenciales.');
  }
}
