import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsNumber, Min } from 'class-validator';

// Datos que describen cada línea asociada a una venta
export class CreateDetallesVentaDto {
  @IsNotEmpty({ message: 'El ID de la venta es requerido' })
  @Type(() => Number)
  @IsInt({ message: 'El ID de la venta debe ser un número entero' })
  readonly ventaId: number;

  @IsNotEmpty({ message: 'El ID del producto es requerido' })
  @Type(() => Number)
  @IsInt({ message: 'El ID del producto debe ser un número entero' })
  readonly productoId: number;

  @IsNotEmpty({ message: 'La cantidad es requerida' })
  @Type(() => Number)
  @IsInt({ message: 'La cantidad debe ser un número entero' })
  @Min(1, { message: 'La cantidad debe ser mayor a 0' })
  readonly cantidad: number;

  @IsNotEmpty({ message: 'El precio unitario es requerido' })
  @Type(() => Number)
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'El precio unitario debe ser un número con máximo 2 decimales' },
  )
  @Min(0, { message: 'El precio unitario debe ser mayor o igual a 0' })
  readonly precioUnitario: number;

  @IsNotEmpty({ message: 'El subtotal es requerido' })
  @Type(() => Number)
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'El subtotal debe ser un número con máximo 2 decimales' },
  )
  @Min(0, { message: 'El subtotal debe ser mayor o igual a 0' })
  readonly subtotal: number;
}
