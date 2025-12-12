import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Empleado } from 'src/empleados/entities/empleado.entity';
import { ConfigService } from '@nestjs/config';

/**
 * Servicio de Seed para crear usuario administrador inicial
 * 
 * CÓMO FUNCIONA:
 * - Se ejecuta automáticamente al iniciar la aplicación si SEED_ON_BOOT=true
 * - Solo crea el admin si NO hay empleados en la base de datos
 * - Útil para primer despliegue en producción o desarrollo
 * 
 * CONFIGURACIÓN:
 * Local (.env.local): SEED_ON_BOOT=false (crea manualmente cuando quieras)
 * Producción: SEED_ON_BOOT=true (crea admin automáticamente en primer inicio)
 */
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
      // Por defecto: habilitado en desarrollo, deshabilitado en producción
      // (en producción ponlo explícitamente en true si quieres auto-crear admin)
      const shouldSeed = this.configService.get('SEED_ON_BOOT', 'false') === 'true';

      if (!shouldSeed) {
        this.logger.log('🔒 Seed deshabilitado (SEED_ON_BOOT=false)');
        return;
      }

      // Verificar si ya existen empleados
      const empleadosCount = await this.empleadosRepository.count();
      if (empleadosCount > 0) {
        this.logger.log(`✅ Ya existen ${empleadosCount} empleado(s), saltando seed`);
        return;
      }

      // Obtener credenciales del admin desde variables de entorno
      const nombre = this.configService.get('SEED_ADMIN_NAME', 'Administrador');
      const email = this.configService.get('SEED_ADMIN_EMAIL', 'admin@heladeria.com');
      const password = this.configService.get('SEED_ADMIN_PASSWORD', 'admin123');

      // Crear admin (el password será hasheado automáticamente por @BeforeInsert)
      const admin = this.empleadosRepository.create({
        nombre,
        email,
        password,
        activo: true,
      });

      await this.empleadosRepository.save(admin);
      
      this.logger.log('🎉 ========================================');
      this.logger.log(`🎉 ADMIN CREADO EXITOSAMENTE`);
      this.logger.log(`🎉 Email: ${email}`);
      this.logger.log(`🎉 Password: ${password}`);
      this.logger.log('🎉 ========================================');
    } catch (error) {
      this.logger.error('❌ Error ejecutando seed inicial:', error);
    }
  }
}
