import { PartialType } from '@nestjs/mapped-types';
import { CreateVentaDto } from './create-venta.dto';

// Permite modificar ventas respetando las mismas validaciones del alta
export class UpdateVentaDto extends PartialType(CreateVentaDto) {}
