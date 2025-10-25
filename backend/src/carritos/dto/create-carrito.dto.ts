import { Transform, Type } from 'class-transformer';
import {
  IsOptional,
  IsString,
  IsNumber,
  IsIn,
  MaxLength,
  Min,
  IsInt,
} from 'class-validator';

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

export class CreateCarritoDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'El clienteId debe ser un número entero' })
  @Min(1, { message: 'El clienteId debe ser mayor o igual a 1' })
  readonly clienteId?: number | null;

  @IsOptional()
  @IsString({ message: 'El clienteTempId debe ser texto' })
  @MaxLength(50, { message: 'El clienteTempId no puede exceder 50 caracteres' })
  @Transform(({ value }) => toTrimmedStringOrNull(value))
  readonly clienteTempId?: string | null;

  @IsOptional()
  @IsString({ message: 'El estado debe ser texto' })
  @IsIn(['activo', 'pagado', 'cancelado'], {
    message: 'El estado debe ser: activo, pagado o cancelado',
  })
  @Transform(({ value }) => toTrimmedStringOrNull(value))
  readonly estado?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'El total debe ser un número con máximo 2 decimales' },
  )
  @Min(0, { message: 'El total debe ser mayor o igual a 0' })
  readonly total?: number;
}
