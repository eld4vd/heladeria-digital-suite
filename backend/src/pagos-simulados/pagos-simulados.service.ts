import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePagoSimuladoDto } from './dto/create-pago-simulado.dto';
import { UpdatePagoSimuladoDto } from './dto/update-pago-simulado.dto';
import { PagoSimulado } from './entities/pago-simulado.entity';
import { randomBytes } from 'crypto';

@Injectable()
export class PagosSimuladosService {
  constructor(
    @InjectRepository(PagoSimulado)
    private pagosSimuladosRepository: Repository<PagoSimulado>,
  ) {}

  // Crear un nuevo pago simulado (QR o Débito)
  async create(
    createPagoSimuladoDto: CreatePagoSimuladoDto,
  ): Promise<PagoSimulado> {
    const metodoPago = createPagoSimuladoDto.metodoPago.toLowerCase() as
      | 'qr'
      | 'debito';

    if (
      metodoPago === 'debito' &&
      (!createPagoSimuladoDto.numeroTarjeta || !createPagoSimuladoDto.nombreTitular)
    ) {
      throw new BadRequestException(
        'Los datos de la tarjeta son obligatorios para pagos con débito',
      );
    }

    const pago = this.pagosSimuladosRepository.create({
      ventaId: createPagoSimuladoDto.ventaId,
      metodoPago,
      monto: Number(createPagoSimuladoDto.monto.toFixed(2)),
      estadoPago: createPagoSimuladoDto.estadoPago ?? 'pendiente',
      clienteNombre: createPagoSimuladoDto.clienteNombre ?? null,
      direccionEntrega: createPagoSimuladoDto.direccionEntrega ?? null,
      telefono: createPagoSimuladoDto.telefono ?? null,
    });

    if (metodoPago === 'qr') {
      pago.codigoQr =
        createPagoSimuladoDto.codigoQr ??
        `QR-${randomBytes(8).toString('hex').toUpperCase()}`;
      pago.numeroTarjeta = null;
      pago.nombreTitular = null;
    } else {
      pago.codigoQr = null;
      pago.numeroTarjeta = createPagoSimuladoDto.numeroTarjeta ?? null;
      pago.nombreTitular = createPagoSimuladoDto.nombreTitular ?? null;
    }

    if (createPagoSimuladoDto.fechaPago) {
      pago.fechaPago = new Date(createPagoSimuladoDto.fechaPago);
    } else if (pago.estadoPago === 'aprobado') {
      pago.fechaPago = new Date();
    }

    return this.pagosSimuladosRepository.save(pago);
  }

  // Obtener todos los pagos simulados con sus ventas asociadas
  async findAll(): Promise<PagoSimulado[]> {
    return this.pagosSimuladosRepository.find({
      relations: ['venta'],
      order: { fechaCreacion: 'DESC' },
    });
  }

  // Obtener un pago simulado por ID
  async findOne(id: number): Promise<PagoSimulado> {
    const pago = await this.pagosSimuladosRepository.findOne({
      where: { id },
      relations: ['venta'],
    });

    if (!pago) {
      throw new NotFoundException('El pago simulado no existe');
    }

    return pago;
  }

  // Obtener todos los pagos de una venta específica
  async findByVentaId(ventaId: number): Promise<PagoSimulado[]> {
    return this.pagosSimuladosRepository.find({
      where: { ventaId },
      order: { fechaCreacion: 'ASC' },
    });
  }

  // Actualizar un pago simulado existente
  async update(
    id: number,
    updatePagoSimuladoDto: UpdatePagoSimuladoDto,
  ): Promise<PagoSimulado> {
    const partial: Partial<PagoSimulado> = { id };

    if (updatePagoSimuladoDto.ventaId !== undefined) {
      partial.ventaId = updatePagoSimuladoDto.ventaId;
    }
    if (updatePagoSimuladoDto.metodoPago !== undefined) {
      partial.metodoPago = updatePagoSimuladoDto.metodoPago.toLowerCase() as
        | 'qr'
        | 'debito';
    }
    if (updatePagoSimuladoDto.codigoQr !== undefined) {
      partial.codigoQr = updatePagoSimuladoDto.codigoQr;
    }
    if (updatePagoSimuladoDto.monto !== undefined) {
      partial.monto = Number(updatePagoSimuladoDto.monto.toFixed(2));
    }
    if (updatePagoSimuladoDto.numeroTarjeta !== undefined) {
      partial.numeroTarjeta = updatePagoSimuladoDto.numeroTarjeta;
    }
    if (updatePagoSimuladoDto.nombreTitular !== undefined) {
      partial.nombreTitular = updatePagoSimuladoDto.nombreTitular;
    }
    if (updatePagoSimuladoDto.estadoPago !== undefined) {
      partial.estadoPago = updatePagoSimuladoDto.estadoPago;
      if (
        updatePagoSimuladoDto.estadoPago === 'aprobado' &&
        updatePagoSimuladoDto.fechaPago === undefined
      ) {
        partial.fechaPago = new Date();
      }
      if (
        updatePagoSimuladoDto.estadoPago !== 'aprobado' &&
        updatePagoSimuladoDto.fechaPago === undefined
      ) {
        partial.fechaPago = null;
      }
    }
    if (updatePagoSimuladoDto.fechaPago !== undefined) {
      partial.fechaPago = new Date(updatePagoSimuladoDto.fechaPago);
    }
    if (updatePagoSimuladoDto.clienteNombre !== undefined) {
      partial.clienteNombre = updatePagoSimuladoDto.clienteNombre;
    }
    if (updatePagoSimuladoDto.direccionEntrega !== undefined) {
      partial.direccionEntrega = updatePagoSimuladoDto.direccionEntrega;
    }
    if (updatePagoSimuladoDto.telefono !== undefined) {
      partial.telefono = updatePagoSimuladoDto.telefono;
    }

    const preloaded = await this.pagosSimuladosRepository.preload(partial);
    if (!preloaded) {
      throw new NotFoundException('El pago simulado no existe');
    }

    return this.pagosSimuladosRepository.save(preloaded);
  }

  // Marcar un pago como completado y registrar la fecha de pago
  async completarPago(id: number): Promise<PagoSimulado> {
    const pago = await this.findOne(id);

    if (pago.estadoPago === 'aprobado') {
      throw new BadRequestException('El pago ya está aprobado');
    }

    pago.estadoPago = 'aprobado';
    pago.fechaPago = new Date();

    return this.pagosSimuladosRepository.save(pago);
  }

  // Eliminar un pago simulado (hard delete)
  async remove(id: number) {
    const pago = await this.findOne(id);
    await this.pagosSimuladosRepository.remove(pago);
  }
}
