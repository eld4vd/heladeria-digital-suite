import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateProductoDto } from './dto/create-producto.dto';
import { UpdateProductoDto } from './dto/update-producto.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Producto } from './entities/producto.entity';
import { Not, Repository } from 'typeorm';

@Injectable()
export class ProductosService {
  constructor(
    @InjectRepository(Producto)
    private productosRepository: Repository<Producto>,
  ) {}

  // Crea un producto verificando que el nombre sea único dentro de la categoría
  async create(createProductoDto: CreateProductoDto): Promise<Producto> {
    if (createProductoDto.nombre) {
      const repetido = await this.productosRepository.findOne({
        where: {
          nombre: createProductoDto.nombre,
          categoriaId: createProductoDto.categoriaId,
        },
        withDeleted: true,
      });

      if (repetido) {
        throw new ConflictException(
          'El nombre de producto ya está en uso en esta categoría',
        );
      }
    }

    const producto = this.productosRepository.create();
    producto.nombre = createProductoDto.nombre;
    producto.descripcion = createProductoDto.descripcion ?? null;
    producto.sabor = createProductoDto.sabor;
    producto.precio = createProductoDto.precio;
    producto.stock = createProductoDto.stock;
    producto.imagenUrl = createProductoDto.imagenUrl ?? null;
    producto.categoriaId = createProductoDto.categoriaId;
    producto.activo = createProductoDto.activo ?? true;

    return this.productosRepository.save(producto);
  }

  // Lista todos los productos junto a su categoría
  async findAll(): Promise<Producto[]> {
    return this.productosRepository.find({
      relations: ['categoria'],
      order: { fechaCreacion: 'DESC' },
    });
  }

  // Obtiene un producto por ID o lanza error si no existe
  async findOne(id: number): Promise<Producto> {
    const producto = await this.productosRepository.findOneBy({ id });
    if (!producto) {
      throw new NotFoundException(`Producto con ID ${id} no encontrado`);
    }
    return producto;
  }

  // Actualiza atributos del producto respetando la unicidad por categoría
  async update(
    id: number,
    updateProductoDto: UpdateProductoDto,
  ): Promise<Producto> {
    const productoActual = await this.productosRepository.findOne({
      where: { id },
    });
    if (!productoActual) {
      throw new NotFoundException('Producto no encontrado');
    }

    if (updateProductoDto.nombre) {
      const categoriaParaValidar =
        updateProductoDto.categoriaId ?? productoActual.categoriaId;
      const repetido = await this.productosRepository.findOne({
        where: {
          nombre: updateProductoDto.nombre,
          categoriaId: categoriaParaValidar,
          id: Not(id),
        },
        withDeleted: true,
      });

      if (repetido) {
        throw new ConflictException(
          'El nombre de producto ya está en uso en esta categoría',
        );
      }
    }

    const partial: Partial<Producto> = {};
    if (updateProductoDto.nombre !== undefined) {
      partial.nombre = updateProductoDto.nombre;
    }
    if (updateProductoDto.descripcion !== undefined) {
      partial.descripcion = updateProductoDto.descripcion;
    }
    if (updateProductoDto.sabor !== undefined) {
      partial.sabor = updateProductoDto.sabor;
    }
    if (updateProductoDto.precio !== undefined) {
      partial.precio = updateProductoDto.precio;
    }
    if (updateProductoDto.stock !== undefined) {
      partial.stock = updateProductoDto.stock;
    }
    if (updateProductoDto.imagenUrl !== undefined) {
      partial.imagenUrl = updateProductoDto.imagenUrl;
    }
    if (updateProductoDto.categoriaId !== undefined) {
      partial.categoriaId = updateProductoDto.categoriaId;
    }
    if (updateProductoDto.activo !== undefined) {
      partial.activo = updateProductoDto.activo;
    }

    const productoActualizado = this.productosRepository.merge(
      productoActual,
      partial,
    );

    return this.productosRepository.save(productoActualizado);
  }

  // Realiza soft delete del producto seleccionado
  async remove(id: number): Promise<void> {
    const producto = await this.findOne(id);
    await this.productosRepository.softRemove(producto);
  }

  async adjustStock(id: number, delta: number): Promise<Producto> {
    if (!Number.isFinite(delta) || !Number.isInteger(delta)) {
      throw new ConflictException('El ajuste de stock debe ser un número entero');
    }

    return this.productosRepository.manager.transaction(async (manager) => {
      const repo = manager.getRepository(Producto);
      const producto = await repo.findOne({
        where: { id },
        lock: { mode: 'pessimistic_write' },
      });

      if (!producto) {
        throw new NotFoundException(`Producto con ID ${id} no encontrado`);
      }

      const nuevoStock = Math.max(0, Number(producto.stock) + Number(delta));
      producto.stock = nuevoStock;

      return repo.save(producto);
    });
  }
}
