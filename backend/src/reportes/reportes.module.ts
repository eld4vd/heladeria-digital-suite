import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportesService } from './reportes.service';
import { ReportesController } from './reportes.controller';
import { Venta } from '../ventas/entities/venta.entity';
import { DetallesVenta } from '../detalles-ventas/entities/detalles-venta.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Venta, DetallesVenta])],
  controllers: [ReportesController],
  providers: [ReportesService],
})
export class ReportesModule {}
