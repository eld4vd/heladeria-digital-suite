import { Transform, Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsNumber,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { MetodoPago } from '../entities/venta.entity';

// Convierte strings y números a objetos Date válidos o undefined si la entrada no aplica
const toDateOrUndefined = (value: unknown): Date | undefined => {
  if (!value) {
    return undefined;
  }
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value;
  }
  if (typeof value === 'string' || typeof value === 'number') {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed;
    }
  }
  return undefined;
};

// Normaliza textos opcionales devolviendo null cuando no hay contenido real
const toTrimmedStringOrNull = (value: unknown): string | null => {
  if (value === undefined || value === null) {
    return null;
  }
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }
  if (typeof value === 'number' || typeof value === 'boolean') {
    const coerced = value.toString().trim();
    return coerced.length > 0 ? coerced : null;
  }
  if (typeof value === 'bigint') {
    return value.toString();
  }
  return null;
};

// Datos necesarios para registrar una venta en el sistema
export class CreateVentaDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'El ID del empleado debe ser un número' })
  readonly empleadoId?: number | null;

  @IsOptional()
  @Transform(({ value }) => toDateOrUndefined(value))
  readonly fechaVenta?: Date;

  @IsNotEmpty({ message: 'El total es requerido' })
  @Type(() => Number)
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'El total debe ser un número con máximo 2 decimales' },
  )
  @Min(0, { message: 'El total debe ser mayor o igual a 0' })
  readonly total: number;

  @IsNotEmpty({ message: 'El método de pago es requerido' })
  @IsEnum(MetodoPago, {
    message: 'El método de pago debe ser: efectivo, tarjeta o transferencia',
  })
  readonly metodoPago: MetodoPago;

  @IsOptional()
  @IsString({ message: 'El nombre del cliente debe ser un texto' })
  @MaxLength(100, {
    message: 'El nombre del cliente no puede exceder 100 caracteres',
  })
  @Transform(({ value }) => toTrimmedStringOrNull(value))
  readonly clienteNombre?: string | null;

  @IsOptional()
  @IsString({ message: 'Las notas deben ser un texto' })
  @Transform(({ value }) => toTrimmedStringOrNull(value))
  readonly notas?: string | null;
}
