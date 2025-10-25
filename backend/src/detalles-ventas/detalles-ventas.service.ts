import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateDetallesVentaDto } from './dto/create-detalles-venta.dto';
import { UpdateDetallesVentaDto } from './dto/update-detalles-venta.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { DetallesVenta } from './entities/detalles-venta.entity';
import { DataSource, QueryRunner, Repository } from 'typeorm';
import { Producto } from 'src/productos/entities/producto.entity';
import { Venta } from 'src/ventas/entities/venta.entity';

@Injectable()
export class DetallesVentasService {
  constructor(
    @InjectRepository(DetallesVenta)
    private detallesVentasRepository: Repository<DetallesVenta>,
    @InjectRepository(Producto)
    private productosRepository: Repository<Producto>,
    @InjectRepository(Venta)
    private ventasRepository: Repository<Venta>,
    private readonly dataSource: DataSource,
  ) {}

  // Crea un detalle de venta ajustando stock mediante transacción
  async create(
    createDetallesVentaDto: CreateDetallesVentaDto,
  ): Promise<DetallesVenta> {
    const { productoId, ventaId, cantidad, precioUnitario } =
      createDetallesVentaDto;
    const precioNormalizado = Math.round(Number(precioUnitario) * 100) / 100;
    const subtotalCalculado =
      Math.round(precioNormalizado * cantidad * 100) / 100;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Verificar venta
      const venta = await queryRunner.manager
        .getRepository(Venta)
        .findOne({ where: { id: ventaId } });
      if (!venta)
        throw new NotFoundException(`La venta con ID ${ventaId} no existe`);

      // Bloquear producto con lock pesimista
      const producto = await queryRunner.manager
        .getRepository(Producto)
        .createQueryBuilder('p')
        .setLock('pessimistic_write')
        .where('p.id = :id', { id: productoId })
        .getOne();
      if (!producto)
        throw new NotFoundException(
          `El producto con ID ${productoId} no existe`,
        );

      if (producto.stock < cantidad) {
        throw new ConflictException('Stock insuficiente para este producto');
      }

      producto.stock = producto.stock - cantidad;
      await queryRunner.manager.getRepository(Producto).save(producto);

      const detallesVenta = new DetallesVenta();
      detallesVenta.ventaId = ventaId;
      detallesVenta.productoId = productoId;
      detallesVenta.cantidad = cantidad;
      detallesVenta.precioUnitario = precioNormalizado;
      detallesVenta.subtotal = subtotalCalculado;

      const saved = await queryRunner.manager
        .getRepository(DetallesVenta)
        .save(detallesVenta);

      await this.recalcularTotalVenta(queryRunner, ventaId);

      await queryRunner.commitTransaction();
      return saved;
    } catch (error: unknown) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  // Lista todos los detalles con las relaciones principales
  async findAll(): Promise<DetallesVenta[]> {
    return this.detallesVentasRepository.find({
      relations: ['producto', 'venta'],
    });
  }

  // Busca un detalle por ID validando el parámetro de entrada
  async findOne(id: number): Promise<DetallesVenta> {
    if (isNaN(id) || id <= 0) {
      throw new BadRequestException('El id proporcionado no es válido');
    }

    const detalleVenta = await this.detallesVentasRepository.findOne({
      where: { id },
      relations: ['producto', 'venta'],
    });

    if (!detalleVenta) {
      throw new NotFoundException('El detalle de venta no existe');
    }

    return detalleVenta;
  }

  // Actualiza un detalle de venta ajustando diferencias de stock
  async update(
    id: number,
    updateDetallesVentaDto: UpdateDetallesVentaDto,
  ): Promise<DetallesVenta> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const repoDetalles = queryRunner.manager.getRepository(DetallesVenta);
      const detalle = await repoDetalles.findOne({ where: { id } });
      if (!detalle) {
        throw new NotFoundException('El detalle de venta no existe');
      }

      const oldProductoId = detalle.productoId;
      const oldCantidad = detalle.cantidad;
      const oldVentaId = detalle.ventaId;
      const oldPrecioUnitario = detalle.precioUnitario;

      const newProductoId = updateDetallesVentaDto.productoId ?? oldProductoId;
      const newCantidad = updateDetallesVentaDto.cantidad ?? oldCantidad;
      const newVentaId = updateDetallesVentaDto.ventaId ?? oldVentaId;
      const precioActualizado =
        updateDetallesVentaDto.precioUnitario ?? oldPrecioUnitario;
      const precioNormalizado =
        Math.round(Number(precioActualizado) * 100) / 100;

      // Si cambió el producto o la cantidad, ajustar stock con locks
      if (newProductoId !== oldProductoId) {
        // Devolver stock al producto anterior
        const oldProd = await queryRunner.manager
          .getRepository(Producto)
          .createQueryBuilder('p')
          .setLock('pessimistic_write')
          .where('p.id = :id', { id: oldProductoId })
          .getOne();
        if (!oldProd)
          throw new NotFoundException(`Producto ${oldProductoId} no existe`);
        oldProd.stock += oldCantidad;
        await queryRunner.manager.getRepository(Producto).save(oldProd);

        // Descontar del nuevo producto
        const newProd = await queryRunner.manager
          .getRepository(Producto)
          .createQueryBuilder('p')
          .setLock('pessimistic_write')
          .where('p.id = :id', { id: newProductoId })
          .getOne();
        if (!newProd)
          throw new NotFoundException(`Producto ${newProductoId} no existe`);
        if (newProd.stock < newCantidad)
          throw new ConflictException(
            'Stock insuficiente para el nuevo producto',
          );
        newProd.stock -= newCantidad;
        await queryRunner.manager.getRepository(Producto).save(newProd);
      } else if (newCantidad !== oldCantidad) {
        const delta = newCantidad - oldCantidad;
        const prod = await queryRunner.manager
          .getRepository(Producto)
          .createQueryBuilder('p')
          .setLock('pessimistic_write')
          .where('p.id = :id', { id: oldProductoId })
          .getOne();
        if (!prod)
          throw new NotFoundException(`Producto ${oldProductoId} no existe`);
        if (delta > 0) {
          if (prod.stock < delta)
            throw new ConflictException('Stock insuficiente');
          prod.stock -= delta;
        } else if (delta < 0) {
          prod.stock += -delta;
        }
        await queryRunner.manager.getRepository(Producto).save(prod);
      }

      // Aplicar cambios al detalle
      detalle.productoId = newProductoId;
      detalle.ventaId = newVentaId;
      detalle.cantidad = newCantidad;
      detalle.precioUnitario = precioNormalizado;
      detalle.subtotal =
        Math.round(newCantidad * precioNormalizado * 100) / 100;
      const saved = await repoDetalles.save(detalle);

      // Recalcular totales para ventas afectadas
      if (newVentaId !== oldVentaId) {
        await this.recalcularTotalVenta(queryRunner, oldVentaId);
      }
      await this.recalcularTotalVenta(queryRunner, newVentaId);

      await queryRunner.commitTransaction();
      return saved;
    } catch (error: unknown) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  // Elimina un detalle devolviendo stock y recalculando la venta
  async remove(id: number) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const repoDetalles = queryRunner.manager.getRepository(DetallesVenta);
      const detalle = await repoDetalles.findOne({ where: { id } });
      if (!detalle)
        throw new NotFoundException('El detalle de venta no existe');

      // Devolver stock al producto
      const prod = await queryRunner.manager
        .getRepository(Producto)
        .createQueryBuilder('p')
        .setLock('pessimistic_write')
        .where('p.id = :id', { id: detalle.productoId })
        .getOne();
      if (!prod)
        throw new NotFoundException(`Producto ${detalle.productoId} no existe`);
      prod.stock += detalle.cantidad;
      await queryRunner.manager.getRepository(Producto).save(prod);

      await repoDetalles.softRemove(detalle);

      await this.recalcularTotalVenta(queryRunner, detalle.ventaId);

      await queryRunner.commitTransaction();
      return detalle;
    } catch (error: unknown) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  // Recalcula el total de la venta sumando los subtotales vigentes
  private async recalcularTotalVenta(
    queryRunner: QueryRunner,
    ventaId: number,
  ): Promise<void> {
    // SUMA subtotales donde no está soft-deleted
    const result = await queryRunner.manager
      .getRepository(DetallesVenta)
      .createQueryBuilder('d')
      .select('COALESCE(SUM(d.subtotal), 0)', 'sum')
      .where('d.ventaId = :ventaId', { ventaId })
      .andWhere('d.fechaEliminacion IS NULL')
      .getRawOne<{ sum: string | null }>();

    const sumValue = result?.sum ?? '0';
    const sum = Number.parseFloat(sumValue);
    const venta = await queryRunner.manager
      .getRepository(Venta)
      .findOne({ where: { id: ventaId } });
    if (venta) {
      venta.total = sum;
      await queryRunner.manager.getRepository(Venta).save(venta);
    }
  }
}
