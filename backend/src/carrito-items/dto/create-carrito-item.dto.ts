import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsInt, Min } from 'class-validator';

export class CreateCarritoItemDto {
  @IsNotEmpty({ message: 'El carritoId es obligatorio' })
  @Type(() => Number)
  @IsInt({ message: 'El carritoId debe ser un número entero' })
  @Min(1, { message: 'El carritoId debe ser mayor o igual a 1' })
  readonly carritoId: number;

  @IsNotEmpty({ message: 'El productoId es obligatorio' })
  @Type(() => Number)
  @IsInt({ message: 'El productoId debe ser un número entero' })
  @Min(1, { message: 'El productoId debe ser mayor o igual a 1' })
  readonly productoId: number;

  @IsNotEmpty({ message: 'La cantidad es obligatoria' })
  @Type(() => Number)
  @IsInt({ message: 'La cantidad debe ser un número entero' })
  @Min(1, { message: 'La cantidad debe ser al menos 1' })
  readonly cantidad: number;

  @IsNotEmpty({ message: 'El subtotal es obligatorio' })
  @Type(() => Number)
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'El subtotal debe ser un número con máximo 2 decimales' },
  )
  @Min(0, { message: 'El subtotal debe ser mayor o igual a 0' })
  readonly subtotal: number;
}
