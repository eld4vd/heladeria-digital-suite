import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { randomBytes } from 'crypto';
import { CreateCarritoDto } from './dto/create-carrito.dto';
import { UpdateCarritoDto } from './dto/update-carrito.dto';
import { CheckoutCarritoDto } from './dto/checkout-carrito.dto';
import { Carrito } from './entities/carrito.entity';
import { Venta, EstadoVenta, MetodoPago } from '../ventas/entities/venta.entity';
import { DetallesVenta } from '../detalles-ventas/entities/detalles-venta.entity';
import { PagoSimulado } from '../pagos-simulados/entities/pago-simulado.entity';

@Injectable()
export class CarritosService {
  constructor(
    @InjectRepository(Carrito)
    private carritosRepository: Repository<Carrito>,
    private dataSource: DataSource,
  ) {}

  // Crear un nuevo carrito (registrado o anónimo)
  async create(createCarritoDto: CreateCarritoDto): Promise<Carrito> {
    // Validar que tenga al menos un identificador de cliente
    if (!createCarritoDto.clienteId && !createCarritoDto.clienteTempId) {
      throw new BadRequestException(
        'Debe proporcionar clienteId o clienteTempId',
      );
    }

    const carrito = this.carritosRepository.create();
    carrito.clienteId = createCarritoDto.clienteId ?? null;
    carrito.clienteTempId = createCarritoDto.clienteTempId ?? null;
    carrito.estado = createCarritoDto.estado ?? 'activo';
    carrito.total = createCarritoDto.total ?? 0;

    return this.carritosRepository.save(carrito);
  }

  // Obtener todos los carritos con sus items y productos
  async findAll(): Promise<Carrito[]> {
    return this.carritosRepository.find({
      relations: ['items', 'items.producto'],
      order: { fechaCreacion: 'DESC' },
    });
  }

  // Obtener un carrito por ID con sus items y productos
  async findOne(id: number): Promise<Carrito> {
    const carrito = await this.carritosRepository.findOne({
      where: { id },
      relations: ['items', 'items.producto'],
    });

    if (!carrito) {
      throw new NotFoundException('El carrito no existe');
    }

    return carrito;
  }

  // Obtener carritos de un cliente registrado
  async findByClienteId(clienteId: number): Promise<Carrito[]> {
    return this.carritosRepository.find({
      where: { clienteId },
      relations: ['items', 'items.producto'],
      order: { fechaCreacion: 'DESC' },
    });
  }

  // Obtener carritos de un cliente anónimo por ID temporal
  async findByClienteTempId(clienteTempId: string): Promise<Carrito[]> {
    return this.carritosRepository.find({
      where: { clienteTempId },
      relations: ['items', 'items.producto'],
      order: { fechaCreacion: 'DESC' },
    });
  }

  // Actualizar un carrito existente
  async update(
    id: number,
    updateCarritoDto: UpdateCarritoDto,
  ): Promise<Carrito> {
    const partial: Partial<Carrito> = { id };

    if (updateCarritoDto.clienteId !== undefined) {
      partial.clienteId = updateCarritoDto.clienteId;
    }
    if (updateCarritoDto.clienteTempId !== undefined) {
      partial.clienteTempId = updateCarritoDto.clienteTempId;
    }
    if (updateCarritoDto.estado !== undefined) {
      partial.estado = updateCarritoDto.estado;
    }
    if (updateCarritoDto.total !== undefined) {
      partial.total = updateCarritoDto.total;
    }

    const preloaded = await this.carritosRepository.preload(partial);
    if (!preloaded) {
      throw new NotFoundException('El carrito no existe');
    }

    return this.carritosRepository.save(preloaded);
  }

  // Eliminar un carrito (soft delete)
  async remove(id: number) {
    const carrito = await this.findOne(id);
    await this.carritosRepository.softRemove(carrito);
  }

  // Recalcular el total del carrito sumando los subtotales de sus items
  async recalcularTotal(id: number): Promise<Carrito> {
    const carrito = await this.findOne(id);
    const total = carrito.items.reduce(
      (sum, item) => sum + Number(item.subtotal),
      0,
    );
    carrito.total = total;
    return this.carritosRepository.save(carrito);
  }

  // Checkout: Procesar carrito y crear venta
  async checkout(checkoutDto: CheckoutCarritoDto): Promise<Venta> {
    const { carritoId, metodoPago, datosTarjeta, clienteNombre, direccionEntrega, telefono } = checkoutDto;

    return this.dataSource.transaction(async (manager) => {
      // 1. Obtener carrito con items
      const carrito = await manager.findOne(Carrito, {
        where: { id: carritoId },
        relations: ['items', 'items.producto'],
      });

      if (!carrito) {
        throw new NotFoundException('El carrito no existe');
      }

      if (carrito.estado !== 'activo') {
        throw new BadRequestException('El carrito no está activo');
      }

      if (!carrito.items || carrito.items.length === 0) {
        throw new BadRequestException('El carrito está vacío');
      }

      // 1.1 Calcular totales y validar integridad
      const detallesCalculados = carrito.items.map((item) => {
        const precioUnitario = Number(
          (item.producto?.precio ?? item.subtotal / item.cantidad).toFixed(2),
        );
        const subtotalCalculado = Number(
          (precioUnitario * item.cantidad).toFixed(2),
        );
        return {
          item,
          precioUnitario,
          subtotalCalculado,
        };
      });

      const totalCalculado = Number(
        detallesCalculados
          .reduce((sum, detalle) => sum + detalle.subtotalCalculado, 0)
          .toFixed(2),
      );

      // Actualizar total del carrito para dejar rastro coherente
      carrito.total = totalCalculado;
      await manager.save(Carrito, carrito);

      if (metodoPago === 'debito' && (!datosTarjeta || !datosTarjeta.numeroTarjeta)) {
        throw new BadRequestException(
          'Los datos de la tarjeta son obligatorios para pagos con débito',
        );
      }

      // 2. Crear la venta (origen web, sin empleado)
      const venta = manager.create(Venta, {
        fechaHora: new Date(),
        fechaVenta: new Date(),
        total: totalCalculado,
        metodoPago: metodoPago === 'qr' ? MetodoPago.QR : MetodoPago.TARJETA,
        estado: EstadoVenta.COMPLETADA,
        empleadoId: null,
        empleadoNombreSnapshot: 'Sistema Web',
        clienteNombre: clienteNombre || null,
        notas: `Pedido web - ${direccionEntrega || 'Sin dirección'} - Tel: ${telefono || 'N/A'}`,
      });
      const ventaGuardada = await manager.save(Venta, venta);

      // 3. Crear detalles de venta desde items del carrito
      for (const detalleInfo of detallesCalculados) {
        const { item, precioUnitario, subtotalCalculado } = detalleInfo;
        const detalle = manager.create(DetallesVenta, {
          ventaId: ventaGuardada.id,
          productoId: item.productoId,
          productoNombreSnapshot: item.producto?.nombre || 'Producto',
          cantidad: item.cantidad,
          precioUnitario,
          subtotal: subtotalCalculado,
        });
        await manager.save(DetallesVenta, detalle);
      }

      // 4. Crear pago simulado
      const numeroTarjeta =
        metodoPago === 'debito'
          ? datosTarjeta?.numeroTarjeta?.trim() ?? null
          : null;
      const nombreTitular =
        metodoPago === 'debito'
          ? datosTarjeta?.nombreTitular?.trim() ?? null
          : null;
      const pagoCodigoQr =
        metodoPago === 'qr'
          ? `QR-${randomBytes(8).toString('hex').toUpperCase()}`
          : null;

      const pago = manager.create(PagoSimulado, {
        ventaId: ventaGuardada.id,
        metodoPago,
        monto: totalCalculado,
        estadoPago: 'aprobado',
        fechaPago: new Date(),
        codigoQr: pagoCodigoQr,
        numeroTarjeta,
        nombreTitular,
        clienteNombre: clienteNombre || null,
        direccionEntrega: direccionEntrega || null,
        telefono: telefono || null,
      });
      await manager.save(PagoSimulado, pago);

      // 5. Marcar carrito como procesado
      carrito.estado = 'procesado';
      await manager.save(Carrito, carrito);

      // 6. Retornar venta con relaciones
      const ventaFinal = await manager.findOne(Venta, {
        where: { id: ventaGuardada.id },
        relations: ['detallesVentas', 'pagosSimulados'],
      });

      if (!ventaFinal) {
        throw new NotFoundException('Error al recuperar la venta creada');
      }

      return ventaFinal;
    });
  }
}
