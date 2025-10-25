import { PartialType } from '@nestjs/mapped-types';
import { CreateCategoriaDto } from './create-categoria.dto';

// Permite actualizaciones parciales reutilizando las reglas del DTO de creación
export class UpdateCategoriaDto extends PartialType(CreateCategoriaDto) {}
