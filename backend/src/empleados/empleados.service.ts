import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { CreateEmpleadoDto } from './dto/create-empleado.dto';
import { UpdateEmpleadoDto } from './dto/update-empleado.dto';
import { Empleado } from './entities/empleado.entity';

@Injectable()
export class EmpleadosService {
  constructor(
    @InjectRepository(Empleado)
    private empleadosRepository: Repository<Empleado>,
  ) {}

  // Crea un empleado nuevo validando unicidad del email
  async create(createEmpleadoDto: CreateEmpleadoDto): Promise<Empleado> {
    if (createEmpleadoDto.email) {
      const repetido = await this.empleadosRepository.findOne({
        where: { email: createEmpleadoDto.email },
        withDeleted: true,
      });

      if (repetido) {
        throw new ConflictException('El email ya existe');
      }
    }

    const empleado = this.empleadosRepository.create();
    empleado.nombre = createEmpleadoDto.nombre;
    empleado.email = createEmpleadoDto.email;
    empleado.password = createEmpleadoDto.password;
    empleado.activo = createEmpleadoDto.activo ?? true;

    return this.empleadosRepository.save(empleado);
  }

  // Lista todos los empleados ordenados por nombre
  async findAll(): Promise<Empleado[]> {
    return this.empleadosRepository.find({ order: { nombre: 'ASC' } });
  }

  // Busca un empleado por ID o lanza error si no existe
  async findOne(id: number): Promise<Empleado> {
    const empleado = await this.empleadosRepository.findOneBy({
      id,
    });

    if (!empleado) {
      throw new NotFoundException('El empleado no existe');
    }

    return empleado;
  }

  // Devuelve al empleado autenticado reutilizando findOne
  async findAuthenticatedUser(id: number): Promise<Empleado> {
    // Reutilizamos findOne para obtener al empleado autenticado
    return this.findOne(id);
  }

  // Actualiza datos del empleado respetando restricciones de email
  async update(
    id: number,
    updateEmpleadoDto: UpdateEmpleadoDto,
  ): Promise<Empleado> {
    if (updateEmpleadoDto.email) {
      const repetido = await this.empleadosRepository.findOne({
        where: { email: updateEmpleadoDto.email, id: Not(id) },
        withDeleted: true,
      });

      if (repetido) {
        throw new ConflictException('El email ya está registrado');
      }
    }

    const partial: Partial<Empleado> = { id };
    if (updateEmpleadoDto.nombre !== undefined) {
      partial.nombre = updateEmpleadoDto.nombre;
    }
    if (updateEmpleadoDto.email !== undefined) {
      partial.email = updateEmpleadoDto.email;
    }
    if (updateEmpleadoDto.password !== undefined) {
      partial.password = updateEmpleadoDto.password;
    }
    if (updateEmpleadoDto.activo !== undefined) {
      partial.activo = updateEmpleadoDto.activo;
    }

    const preloaded = await this.empleadosRepository.preload(partial);
    if (!preloaded) {
      throw new NotFoundException('El empleado no existe');
    }

    return this.empleadosRepository.save(preloaded);
  }

  // Realiza un soft delete del empleado
  async remove(id: number) {
    const empleado = await this.findOne(id);
    await this.empleadosRepository.softRemove(empleado);
  }

  // Valida credenciales para inicio de sesión
  async validate(email: string, clave: string): Promise<Empleado | null> {
    const normalizedEmail = email.trim().toLowerCase();

    const emailOk = await this.empleadosRepository.findOne({
      where: { email: normalizedEmail },
      select: ['id', 'nombre', 'email', 'password', 'activo'], // Campos seleccionados
    });

    if (!emailOk) {
      return null; // Retorna null si no encuentra el empleado
    }

    // Validamos la contraseña
    const isPasswordValid: any = await emailOk.validatePassword(clave);
    if (!isPasswordValid) {
      return null; // Retorna null si la contraseña no es válida
    }

    return emailOk; // Devuelve el empleado
  }

  // Permite cambiar la contraseña de un empleado autenticado
  async cambiarPassword(
    userId: number,
    passwordActual: string,
    nuevaPassword: string,
  ): Promise<string> {
    // 1. Buscar al empleado por ID
    const empleado = await this.findOne(userId);
    if (!empleado) {
      throw new NotFoundException('Empleado no encontrado.');
    }

    // 2. Validar la contraseña actual
    const isPasswordValid: any =
      await empleado.validatePassword(passwordActual);
    if (!isPasswordValid) {
      throw new UnauthorizedException('La contraseña actual es incorrecta.');
    }

    // 3. Actualizar la contraseña
    empleado.password = nuevaPassword; // Asignar la nueva contraseña
    await this.empleadosRepository.save(empleado); // Guardar cambios (se hashea automáticamente en `hashPassword`)

    return 'La contraseña ha sido actualizada correctamente.';
  }

  // Desactiva lógicamente al empleado sin eliminarlo
  async softDelete(id: number): Promise<{ message: string }> {
    const empleado = await this.findOne(id);
    empleado.activo = false;
    await this.empleadosRepository.save(empleado);
    return { message: `Empleado con ID ${id} desactivado correctamente` };
  }
}
