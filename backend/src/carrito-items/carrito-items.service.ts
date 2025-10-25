import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateCarritoItemDto } from './dto/create-carrito-item.dto';
import { UpdateCarritoItemDto } from './dto/update-carrito-item.dto';
import { CarritoItem } from './entities/carrito-item.entity';
import { Producto } from 'src/productos/entities/producto.entity';

@Injectable()
export class CarritoItemsService {
  constructor(
    @InjectRepository(CarritoItem)
    private carritoItemsRepository: Repository<CarritoItem>,
    @InjectRepository(Producto)
    private productosRepository: Repository<Producto>,
  ) {}

  // Crear un nuevo item en el carrito (validando stock disponible)
  async create(
    createCarritoItemDto: CreateCarritoItemDto,
  ): Promise<CarritoItem> {
    // Verificar que el producto exista y tenga stock suficiente
    const producto = await this.productosRepository.findOne({
      where: { id: createCarritoItemDto.productoId },
    });

    if (!producto) {
      throw new NotFoundException('El producto no existe');
    }

    if (producto.stock < createCarritoItemDto.cantidad) {
      throw new BadRequestException(
        `Stock insuficiente. Disponible: ${producto.stock}`,
      );
    }

    // Calcular subtotal en el servidor para evitar manipulación del cliente
    const precioNormalizado = Math.round(Number(producto.precio) * 100) / 100;
    const subtotalCalculado =
      Math.round(precioNormalizado * createCarritoItemDto.cantidad * 100) / 100;

    const item = this.carritoItemsRepository.create();
    item.carritoId = createCarritoItemDto.carritoId;
    item.productoId = createCarritoItemDto.productoId;
    item.cantidad = createCarritoItemDto.cantidad;
    item.subtotal = subtotalCalculado;

    return this.carritoItemsRepository.save(item);
  }

  // Obtener todos los items de carrito con sus relaciones
  async findAll(): Promise<CarritoItem[]> {
    return this.carritoItemsRepository.find({
      relations: ['carrito', 'producto'],
      order: { fechaCreacion: 'DESC' },
    });
  }

  // Obtener un item de carrito por ID
  async findOne(id: number): Promise<CarritoItem> {
    const item = await this.carritoItemsRepository.findOne({
      where: { id },
      relations: ['carrito', 'producto'],
    });

    if (!item) {
      throw new NotFoundException('El item del carrito no existe');
    }

    return item;
  }

  // Obtener todos los items de un carrito específico
  async findByCarritoId(carritoId: number): Promise<CarritoItem[]> {
    return this.carritoItemsRepository.find({
      where: { carritoId },
      relations: ['producto'],
      order: { fechaCreacion: 'ASC' },
    });
  }

  // Actualizar un item del carrito (validando stock si se modifica cantidad)
  async update(
    id: number,
    updateCarritoItemDto: UpdateCarritoItemDto,
  ): Promise<CarritoItem> {
    const item = await this.findOne(id);

    // Si se actualiza cantidad o producto, validar stock y recalcular subtotal
    const nuevoProductoId = updateCarritoItemDto.productoId ?? item.productoId;
    const nuevaCantidad = updateCarritoItemDto.cantidad ?? item.cantidad;

    const producto = await this.productosRepository.findOne({
      where: { id: nuevoProductoId },
    });

    if (!producto) {
      throw new NotFoundException('El producto no existe');
    }

    if (producto.stock < nuevaCantidad) {
      throw new BadRequestException(
        `Stock insuficiente. Disponible: ${producto.stock}`,
      );
    }

    // Recalcular subtotal con el precio actual del producto
    const precioNormalizado = Math.round(Number(producto.precio) * 100) / 100;
    const subtotalCalculado =
      Math.round(precioNormalizado * nuevaCantidad * 100) / 100;

    const partial: Partial<CarritoItem> = { id };

    if (updateCarritoItemDto.carritoId !== undefined) {
      partial.carritoId = updateCarritoItemDto.carritoId;
    }
    if (updateCarritoItemDto.productoId !== undefined) {
      partial.productoId = updateCarritoItemDto.productoId;
    }
    if (updateCarritoItemDto.cantidad !== undefined) {
      partial.cantidad = updateCarritoItemDto.cantidad;
    }
    // Siempre recalcular subtotal
    partial.subtotal = subtotalCalculado;

    const preloaded = await this.carritoItemsRepository.preload(partial);
    if (!preloaded) {
      throw new NotFoundException('El item del carrito no existe');
    }

    return this.carritoItemsRepository.save(preloaded);
  }

  // Eliminar un item del carrito (hard delete)
  async remove(id: number) {
    const item = await this.findOne(id);
    await this.carritoItemsRepository.remove(item);
  }
}
