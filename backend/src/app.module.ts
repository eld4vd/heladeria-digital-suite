import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EmpleadosModule } from './empleados/empleados.module';
import { CategoriasModule } from './categorias/categorias.module';
import { ProductosModule } from './productos/productos.module';
import { VentasModule } from './ventas/ventas.module';
import { DetallesVentasModule } from './detalles-ventas/detalles-ventas.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { AuthModule } from './auth/auth.module';
import { ReportesModule } from './reportes/reportes.module';
import { SeedModule } from './seed/seed.module';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { CarritosModule } from './carritos/carritos.module';
import { CarritoItemsModule } from './carrito-items/carrito-items.module';
import { PagosSimuladosModule } from './pagos-simulados/pagos-simulados.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => [
        {
          ttl: Number(configService.get<string>('THROTTLE_TTL', '60000')),
          limit: Number(configService.get<string>('THROTTLE_LIMIT', '10')),
        },
      ],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const synchronizeFromEnv =
          configService.get<string>('DB_SYNCHRONIZE', 'false') === 'true';
        const seedOnBoot =
          configService.get<string>('SEED_ON_BOOT', 'false') === 'true';
        return {
          type: 'postgres',
          host: configService.get<string>('DB_HOST'),
          port: Number(configService.get<string>('DB_PORT')),
          username: configService.get<string>('DB_USERNAME'),
          password: configService.get<string>('DB_PASSWORD'),
          database: configService.get<string>('DB_NAME'),
          entities: [__dirname + '/**/*.entity{.ts,.js}'],
          namingStrategy: new SnakeNamingStrategy(),
          synchronize: synchronizeFromEnv || seedOnBoot,
          logging: configService.get<string>('DB_LOGGING', 'false') === 'true',
        };
      },
      inject: [ConfigService],
    }),
    EmpleadosModule,
    CategoriasModule,
    ProductosModule,
    VentasModule,
    DetallesVentasModule,
    AuthModule,
    ReportesModule,
    SeedModule,
    CarritosModule,
    CarritoItemsModule,
    PagosSimuladosModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
