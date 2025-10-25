import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Empleado } from 'src/empleados/entities/empleado.entity';
import { ConfigService } from '@nestjs/config';

const describeUnknownError = (error: unknown): string => {
  if (typeof error === 'string') {
    return error;
  }
  if (typeof error === 'number' || typeof error === 'boolean') {
    return error.toString();
  }
  if (typeof error === 'bigint') {
    return error.toString();
  }
  if (error && typeof error === 'object') {
    try {
      return JSON.stringify(error);
    } catch {
      return '[object Error]';
    }
  }
  return 'Unknown error';
};

@Injectable()
export class SeedService implements OnApplicationBootstrap {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectRepository(Empleado)
    private readonly empleadosRepository: Repository<Empleado>,
    private readonly configService: ConfigService,
  ) {}

  async onApplicationBootstrap() {
    try {
      const seedEnabledEnv = this.configService.get<string>('SEED_ON_BOOT');
      const nodeEnv = this.configService.get<string>('NODE_ENV');

      // Habilitar por defecto solo en production (deshabilitado en dev/test)
      const seedEnabledDefault = nodeEnv === 'production';
      const seedEnabled =
        seedEnabledEnv !== undefined
          ? seedEnabledEnv === 'true'
          : seedEnabledDefault;

      if (!seedEnabled) {
        this.logger.log(
          'Seed deshabilitado por configuración (SEED_ON_BOOT=false).',
        );
        return;
      }

      const empleadosCount = await this.empleadosRepository.count();
      if (empleadosCount > 0) {
        this.logger.log('Empleados ya existen, se omite seed inicial.');
        return;
      }

      const nombre =
        this.configService.get<string>('SEED_ADMIN_NAME') || 'Administrador';
      const email =
        this.configService.get<string>('SEED_ADMIN_EMAIL') || 'admin@demo.com';
      const password =
        this.configService.get<string>('SEED_ADMIN_PASSWORD') || 'admin123';

      const empleado = new Empleado();
      empleado.nombre = nombre;
      empleado.email = email;
      empleado.password = password; // Será hasheado por el hook de la entidad
      empleado.activo = true;

      await this.empleadosRepository.save(empleado);
      this.logger.log(`Empleado por defecto creado: ${email}`);
    } catch (error) {
      const stack = error instanceof Error ? error.stack : undefined;
      const detail = describeUnknownError(error);
      this.logger.error(`Error ejecutando seed inicial: ${detail}`, stack);
    }
  }
}
