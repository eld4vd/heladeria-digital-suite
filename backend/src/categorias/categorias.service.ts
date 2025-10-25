import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCategoriaDto } from './dto/create-categoria.dto';
import { UpdateCategoriaDto } from './dto/update-categoria.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Categoria } from './entities/categoria.entity';
import { Not, Repository } from 'typeorm';

@Injectable()
export class CategoriasService {
  constructor(
    @InjectRepository(Categoria)
    private categoriasRepository: Repository<Categoria>,
  ) {}

  // Crea una categoría validando que el nombre no esté duplicado
  async create(createCategoriaDto: CreateCategoriaDto): Promise<Categoria> {
    if (createCategoriaDto.nombre) {
      const repetida = await this.categoriasRepository.findOne({
        where: { nombre: createCategoriaDto.nombre },
        withDeleted: true,
      });

      if (repetida) {
        throw new ConflictException('La categoría ya existe');
      }
    }

    const categoria = this.categoriasRepository.create();
    categoria.nombre = createCategoriaDto.nombre;
    categoria.descripcion = createCategoriaDto.descripcion;
    categoria.activo = createCategoriaDto.activo ?? true;

    return this.categoriasRepository.save(categoria);
  }

  // Devuelve todas las categorías ordenadas alfabéticamente
  async findAll(): Promise<Categoria[]> {
    return this.categoriasRepository.find({ order: { nombre: 'ASC' } });
  }

  // Busca una categoría por ID o lanza error si no existe
  async findOne(id: number): Promise<Categoria> {
    const categoria = await this.categoriasRepository.findOne({
      where: { id },
    });
    if (!categoria) {
      throw new NotFoundException('La categoría no existe');
    }

    return categoria;
  }

  // Actualiza los datos de la categoría respetando unicidad del nombre
  async update(
    id: number,
    updateCategoriaDto: UpdateCategoriaDto,
  ): Promise<Categoria> {
    if (updateCategoriaDto.nombre) {
      const repetida = await this.categoriasRepository.findOne({
        where: { nombre: updateCategoriaDto.nombre, id: Not(id) },
        withDeleted: true,
      });

      if (repetida) {
        throw new ConflictException('La categoría ya existe');
      }
    }

    const partial: Partial<Categoria> = { id };
    if (updateCategoriaDto.nombre !== undefined) {
      partial.nombre = updateCategoriaDto.nombre;
    }
    if (updateCategoriaDto.descripcion !== undefined) {
      partial.descripcion = updateCategoriaDto.descripcion;
    }
    if (updateCategoriaDto.activo !== undefined) {
      partial.activo = updateCategoriaDto.activo;
    }

    const preloaded = await this.categoriasRepository.preload(partial);
    if (!preloaded) {
      throw new NotFoundException('La categoría no existe');
    }

    return this.categoriasRepository.save(preloaded);
  }

  // Elimina lógicamente una categoría existente
  async remove(id: number) {
    const categoria = await this.findOne(id);
    await this.categoriasRepository.softRemove(categoria);
  }
}
