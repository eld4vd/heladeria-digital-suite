import { PartialType } from '@nestjs/mapped-types';
import { CreateProductoDto } from './create-producto.dto';

// Permite parches sobre productos reutilizando las validaciones ya definidas
export class UpdateProductoDto extends PartialType(CreateProductoDto) {}
