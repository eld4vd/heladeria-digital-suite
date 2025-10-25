import { PartialType } from '@nestjs/mapped-types';
import { CreateDetallesVentaDto } from './create-detalles-venta.dto';

// Usa PartialType para permitir modificaciones puntuales sobre un detalle de venta
export class UpdateDetallesVentaDto extends PartialType(
  CreateDetallesVentaDto,
) {}
