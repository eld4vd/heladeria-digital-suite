import { Module } from '@nestjs/common';
import { DetallesVentasService } from './detalles-ventas.service';
import { DetallesVentasController } from './detalles-ventas.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DetallesVenta } from './entities/detalles-venta.entity';
import { Producto } from 'src/productos/entities/producto.entity';
import { Venta } from 'src/ventas/entities/venta.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DetallesVenta, Producto, Venta])],
  exports: [DetallesVentasService],
  controllers: [DetallesVentasController],
  providers: [DetallesVentasService],
})
export class DetallesVentasModule {}
