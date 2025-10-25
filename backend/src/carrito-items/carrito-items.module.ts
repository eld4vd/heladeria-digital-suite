import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CarritoItemsService } from './carrito-items.service';
import { CarritoItemsController } from './carrito-items.controller';
import { CarritoItem } from './entities/carrito-item.entity';
import { Producto } from 'src/productos/entities/producto.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CarritoItem, Producto])],
  controllers: [CarritoItemsController],
  providers: [CarritoItemsService],
  exports: [CarritoItemsService],
})
export class CarritoItemsModule {}
