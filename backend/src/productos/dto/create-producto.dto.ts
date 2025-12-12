import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  Min,
} from 'class-validator';

// Unifica los campos que esperamos como cadenas eliminando espacios sobrantes
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

// Similar al anterior pero devuelve null cuando el valor es vacío o nulo
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

// Simplifica la lectura de banderas booleanas enviadas como texto o números
const toOptionalBoolean = (value: unknown): boolean | undefined => {
  if (typeof value === 'boolean') {
    return value;
  }
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (['true', '1', 'yes', 'on'].includes(normalized)) {
      return true;
    }
    if (['false', '0', 'no', 'off'].includes(normalized)) {
      return false;
    }
    return undefined;
  }
  if (typeof value === 'number') {
    if (value === 1) {
      return true;
    }
    if (value === 0) {
      return false;
    }
  }
  return undefined;
};

// Reglas de validación para registrar nuevos productos en catálogo
export class CreateProductoDto {
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @MaxLength(100, { message: 'El nombre no puede exceder 100 caracteres' })
  @Transform(({ value }) => toTrimmedString(value))
  readonly nombre: string;

  @IsOptional()
  @IsString({ message: 'La descripción debe ser una cadena de texto' })
  @MaxLength(255, { message: 'La descripción no puede exceder 255 caracteres' })
  @Transform(({ value }) => toTrimmedStringOrNull(value))
  readonly descripcion?: string | null;

  @IsString({ message: 'El sabor debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El sabor es obligatorio' })
  @MaxLength(50, { message: 'El sabor no puede exceder 50 caracteres' })
  @Transform(({ value }) => toTrimmedString(value))
  readonly sabor: string;

  @Type(() => Number)
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'El precio debe ser un número con máximo 2 decimales' },
  )
  @Min(0, { message: 'El precio debe ser mayor o igual a 0' })
  readonly precio: number;

  @Type(() => Number)
  @IsInt({ message: 'El stock debe ser un número entero' })
  @Min(0, { message: 'El stock debe ser mayor o igual a 0' })
  readonly stock: number;

  @IsOptional()
  @IsUrl({}, { message: 'La URL de la imagen no es válida' })
  @MaxLength(500, {
    message: 'La URL de la imagen no puede exceder 500 caracteres',
  })
  @Transform(({ value }) => toTrimmedStringOrNull(value))
  readonly imagenUrl?: string | null;

  @Type(() => Number)
  @IsInt({ message: 'El ID de la categoría debe ser un número entero' })
  @Min(1, { message: 'El ID de la categoría debe ser mayor o igual a 1' })
  readonly categoriaId: number;

  @IsOptional()
  @Transform(({ value }) => toOptionalBoolean(value))
  @IsBoolean({ message: 'El estado activo debe ser un valor booleano' })
  readonly activo?: boolean;
}
