import { PartialType } from '@nestjs/mapped-types';
import { CreateEmpleadoDto } from './create-empleado.dto';

// Permite editar empleados sin requerir todos los campos del DTO base
export class UpdateEmpleadoDto extends PartialType(CreateEmpleadoDto) {}
