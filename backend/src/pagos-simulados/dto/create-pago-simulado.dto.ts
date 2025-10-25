import { Transform, Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsInt,
  IsString,
  IsIn,
  IsOptional,
  IsNumber,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

// Estandariza los textos recortando espacios y compatibilizando tipos
const toTrimmedString = (value: unknown): string => {
  if (typeof value === 'string') {
    return value.trim();
  }
  if (typeof value === 'number' || typeof value === 'boolean') {
    return value.toString().trim();
  }
  if (typeof value === 'bigint') {
    return value.toString();
  }
  return '';
};

// Variante que devuelve null cuando no hay contenido aprovechable
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

// Convierte texto o números a fechas válidas para los campos opcionales
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

// Datos requeridos para registrar un pago simulado asociado a una venta
export class CreatePagoSimuladoDto {
  @IsNotEmpty({ message: 'El ventaId es obligatorio' })
  @Type(() => Number)
  @IsInt({ message: 'El ventaId debe ser un número entero' })
  @Min(1, { message: 'El ventaId debe ser mayor o igual a 1' })
  readonly ventaId: number;

  @IsNotEmpty({ message: 'El metodoPago es obligatorio' })
  @IsString({ message: 'El metodoPago debe ser texto' })
  @IsIn(['qr', 'debito'], {
    message: 'El metodoPago debe ser qr o debito',
  })
  @Transform(({ value }) => toTrimmedString(value).toLowerCase())
  readonly metodoPago: 'qr' | 'debito';

  @IsNotEmpty({ message: 'El monto es obligatorio' })
  @Type(() => Number)
  @IsNumber(
    { allowInfinity: false, allowNaN: false },
    { message: 'El monto debe ser numérico' },
  )
  @Min(0, { message: 'El monto debe ser mayor o igual a 0' })
  readonly monto: number;

  @IsOptional()
  @IsString({ message: 'El codigoQr debe ser texto' })
  @MaxLength(100, { message: 'El codigoQr no puede exceder 100 caracteres' })
  @Transform(({ value }) => toTrimmedStringOrNull(value))
  readonly codigoQr?: string | null;

  @IsOptional()
  @IsString({ message: 'El numeroTarjeta debe ser texto' })
  @MinLength(4, { message: 'El numeroTarjeta debe tener al menos 4 caracteres' })
  @MaxLength(20, {
    message: 'El numeroTarjeta no puede exceder 20 caracteres',
  })
  @Transform(({ value }) => toTrimmedStringOrNull(value))
  readonly numeroTarjeta?: string | null;

  @IsOptional()
  @IsString({ message: 'El nombre del titular debe ser texto' })
  @MaxLength(100, {
    message: 'El nombre del titular no puede exceder 100 caracteres',
  })
  @Transform(({ value }) => toTrimmedStringOrNull(value))
  readonly nombreTitular?: string | null;

  @IsOptional()
  @IsString({ message: 'El estadoPago debe ser texto' })
  @IsIn(['pendiente', 'aprobado', 'rechazado'], {
    message: 'El estadoPago debe ser pendiente, aprobado o rechazado',
  })
  @Transform(({ value }) => toTrimmedStringOrNull(value))
  readonly estadoPago?: 'pendiente' | 'aprobado' | 'rechazado';

  @IsOptional()
  @Transform(({ value }) => toDateOrUndefined(value))
  readonly fechaPago?: Date;

  @IsOptional()
  @IsString({ message: 'El nombre del cliente debe ser texto' })
  @MaxLength(100, {
    message: 'El nombre del cliente no puede exceder 100 caracteres',
  })
  @Transform(({ value }) => toTrimmedStringOrNull(value))
  readonly clienteNombre?: string | null;

  @IsOptional()
  @IsString({ message: 'La dirección debe ser texto' })
  @MaxLength(200, {
    message: 'La dirección no puede exceder 200 caracteres',
  })
  @Transform(({ value }) => toTrimmedStringOrNull(value))
  readonly direccionEntrega?: string | null;

  @IsOptional()
  @IsString({ message: 'El teléfono debe ser texto' })
  @MaxLength(20, {
    message: 'El teléfono no puede exceder 20 caracteres',
  })
  @Transform(({ value }) => toTrimmedStringOrNull(value))
  readonly telefono?: string | null;
}
