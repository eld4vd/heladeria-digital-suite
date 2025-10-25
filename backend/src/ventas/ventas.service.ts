import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Empleado } from 'src/empleados/entities/empleado.entity';
import { CreateVentaDto } from './dto/create-venta.dto';
import { UpdateVentaDto } from './dto/update-venta.dto';
import { EstadoVenta, Venta } from './entities/venta.entity';

const hasDatabaseCode = (error: unknown): error is { code: string } =>
  typeof error === 'object' &&
  error !== null &&
  'code' in error &&
  typeof (error as { code: unknown }).code === 'string';

@Injectable()
export class VentasService {
  constructor(
    @InjectRepository(Venta)
    private ventasRepository: Repository<Venta>,
    @InjectRepository(Empleado)
    private empleadosRepository: Repository<Empleado>,
  ) {}

  // Registra una venta nueva y evita duplicados evidentes
  async create(createVentaDto: CreateVentaDto): Promise<Venta> {
    // Validación adicional si necesitas verificar duplicados
    // (dependiendo de tus reglas de negocio)
    const fechaReferencia = createVentaDto.fechaVenta ?? new Date();
    
    // Solo validar duplicados si hay empleadoId (ventas de caja)
    if (createVentaDto.empleadoId) {
      const ventaExistente = await this.ventasRepository.findOne({
        where: {
          empleadoId: createVentaDto.empleadoId,
          fechaVenta: fechaReferencia,
          total: createVentaDto.total,
        },
      });

      if (ventaExistente) {
        throw new ConflictException('Ya existe una venta idéntica registrada');
      }
    }

    // Validar empleado solo si se proporciona (puede ser null para ventas web)
    let empleado: Empleado | null = null;
    if (createVentaDto.empleadoId) {
      empleado = await this.empleadosRepository.findOne({
        where: { id: createVentaDto.empleadoId },
      });
      if (!empleado) {
        throw new NotFoundException(
          `Empleado ${createVentaDto.empleadoId} no existe`,
        );
      }
    }

    // Creación de la nueva venta
    const venta = this.ventasRepository.create();
    venta.empleadoId = createVentaDto.empleadoId ?? null;
    venta.fechaHora = new Date();
    venta.fechaVenta = fechaReferencia;
    venta.total = createVentaDto.total;
    venta.metodoPago = createVentaDto.metodoPago;
    venta.clienteNombre = createVentaDto.clienteNombre ?? null;
    venta.notas = createVentaDto.notas ?? null;
    venta.estado = EstadoVenta.COMPLETADA;
    venta.empleadoNombreSnapshot = empleado?.nombre ?? 'Sistema Web';

    try {
      return await this.ventasRepository.save(venta);
    } catch (error: unknown) {
      // Manejo específico de errores de base de datos
      if (hasDatabaseCode(error) && error.code === '23505') {
        // Código de error para violación de unique constraint
        throw new ConflictException(
          'Error al registrar la venta: posible duplicado',
        );
      }
      throw error;
    }
  }

  // Devuelve todas las ventas con su empleado asociado
  async findAll(): Promise<Venta[]> {
    return this.ventasRepository.find({
      relations: ['empleado'],
      order: { fechaHora: 'DESC' },
    });
  }

  // Busca una venta por ID o lanza error si no existe
  async findOne(id: number): Promise<Venta> {
    const venta = await this.ventasRepository.findOneBy({ id });
    if (!venta) {
      throw new NotFoundException(`Venta con ID ${id} no encontrada`);
    }
    return venta;
  }

  // Actualiza la venta permitiendo cambiar responsable y metadatos
  async update(id: number, updateVentaDto: UpdateVentaDto): Promise<Venta> {
    let empleado: Empleado | null = null;
    if (updateVentaDto.empleadoId !== undefined && updateVentaDto.empleadoId !== null) {
      empleado = await this.empleadosRepository.findOne({
        where: { id: updateVentaDto.empleadoId },
      });
      if (!empleado) {
        throw new NotFoundException(
          `Empleado ${updateVentaDto.empleadoId} no existe`,
        );
      }
    }

    const partial: Partial<Venta> = { id };
    if (updateVentaDto.empleadoId !== undefined) {
      partial.empleadoId = updateVentaDto.empleadoId ?? null;
      partial.empleadoNombreSnapshot = empleado?.nombre ?? 'Sistema Web';
    }
    if (updateVentaDto.fechaVenta !== undefined) {
      partial.fechaVenta = updateVentaDto.fechaVenta ?? null;
    }
    if (updateVentaDto.total !== undefined) {
      partial.total = updateVentaDto.total;
    }
    if (updateVentaDto.metodoPago !== undefined) {
      partial.metodoPago = updateVentaDto.metodoPago;
    }
    if (updateVentaDto.clienteNombre !== undefined) {
      partial.clienteNombre = updateVentaDto.clienteNombre;
    }
    if (updateVentaDto.notas !== undefined) {
      partial.notas = updateVentaDto.notas;
    }

    const preloaded = await this.ventasRepository.preload(partial);
    if (!preloaded) {
      throw new NotFoundException(`Venta con ID ${id} no encontrada`);
    }

    return this.ventasRepository.save(preloaded);
  }

  // Aplica soft delete sobre la venta seleccionada
  async remove(id: number): Promise<void> {
    const venta = await this.findOne(id);
    await this.ventasRepository.softRemove(venta);
  }
}
