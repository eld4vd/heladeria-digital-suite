import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsString,
  IsIn,
  IsOptional,
  ValidateNested,
  MaxLength,
  Min,
  IsInt,
  ValidateIf,
  IsNotEmptyObject,
} from 'class-validator';

export class DatosTarjetaDto {
  @IsNotEmpty({ message: 'El número de tarjeta es requerido' })
  @IsString({ message: 'El número de tarjeta debe ser texto' })
  @MaxLength(20, {
    message: 'El número de tarjeta no puede exceder 20 caracteres',
  })
  readonly numeroTarjeta: string;

  @IsNotEmpty({ message: 'El nombre del titular es requerido' })
  @IsString({ message: 'El nombre del titular debe ser texto' })
  @MaxLength(100, { message: 'El nombre no puede exceder 100 caracteres' })
  readonly nombreTitular: string;

  @IsNotEmpty({ message: 'El CVV es requerido' })
  @IsString({ message: 'El CVV debe ser texto' })
  @MaxLength(4, { message: 'El CVV no puede exceder 4 caracteres' })
  readonly cvv: string;
}

export class CheckoutCarritoDto {
  @IsNotEmpty({ message: 'El carritoId es requerido' })
  @Type(() => Number)
  @IsInt({ message: 'El carritoId debe ser un número entero' })
  @Min(1, { message: 'El carritoId debe ser mayor o igual a 1' })
  readonly carritoId: number;

  @IsNotEmpty({ message: 'El método de pago es requerido' })
  @IsString({ message: 'El método de pago debe ser texto' })
  @IsIn(['qr', 'debito'], {
    message: 'El método de pago debe ser: qr o debito',
  })
  readonly metodoPago: 'qr' | 'debito';

  @ValidateIf((dto: CheckoutCarritoDto) => dto.metodoPago === 'debito')
  @IsNotEmptyObject(
    { nullable: false },
    { message: 'Los datos de la tarjeta son obligatorios para débito' },
  )
  @ValidateNested()
  @Type(() => DatosTarjetaDto)
  readonly datosTarjeta?: DatosTarjetaDto;

  @IsOptional()
  @IsString({ message: 'El nombre del cliente debe ser texto' })
  @MaxLength(100, { message: 'El nombre no puede exceder 100 caracteres' })
  readonly clienteNombre?: string;

  @IsOptional()
  @IsString({ message: 'La dirección debe ser texto' })
  @MaxLength(200, { message: 'La dirección no puede exceder 200 caracteres' })
  readonly direccionEntrega?: string;

  @IsOptional()
  @IsString({ message: 'El teléfono debe ser texto' })
  @MaxLength(20, { message: 'El teléfono no puede exceder 20 caracteres' })
  readonly telefono?: string;
}
