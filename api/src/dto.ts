import { Type } from 'class-transformer';
import { ArrayMaxSize, ArrayMinSize, ArrayUnique, IsArray, IsBoolean, IsEmail, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, IsUrl, Matches, Max, MaxLength, Min, MinLength, ValidateNested } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { OrderStatus, PaymentMethod, Role } from './contracts';

export class LoginDto {
  @IsEmail() @MaxLength(254) email!: string;
  @IsString() @MinLength(10) @MaxLength(72) password!: string;
  @IsOptional() @IsBoolean() internal?: boolean;
}
export class RegisterDto extends LoginDto {
  @IsString() @MinLength(2) @MaxLength(100) name!: string;
}
export class ProfileDto {
  @IsOptional() @IsString() @MinLength(2) @MaxLength(100) name?: string;
  @IsOptional() @IsString() @MaxLength(30) phone?: string;
}
export class AddressDto {
  @IsString() @MinLength(2) @MaxLength(60) label!: string;
  @IsString() @MinLength(5) @MaxLength(300) address!: string;
  @IsString() @MinLength(2) @MaxLength(100) city!: string;
  @IsOptional() @IsString() @MaxLength(300) reference?: string;
}
export class UpdateAddressDto extends PartialType(AddressDto) {}
export class OrderItemDto {
  @IsString() @MinLength(3) @MaxLength(100) presentationId!: string;
  @IsInt() @Min(1) @Max(50) quantity!: number;
  // Se acepta de clientes anteriores, pero no modifica el sabor fijo del helado.
  @IsOptional() @IsArray() @ArrayMaxSize(10) @ArrayUnique() @IsString({ each: true }) flavorIds?: string[];
  @IsArray() @ArrayMaxSize(20) @ArrayUnique() @IsString({ each: true }) extraIds!: string[];
}
export class CreateOrderDto {
  @IsArray() @ArrayMaxSize(50) @ValidateNested({ each: true }) @Type(() => OrderItemDto) items!: OrderItemDto[];
  @IsString() @MinLength(2) @MaxLength(100) customerName!: string;
  @IsEmail() @MaxLength(254) email!: string;
  @IsString() @MinLength(6) @MaxLength(30) phone!: string;
  @IsString() @MinLength(5) @MaxLength(300) deliveryAddress!: string;
  @IsString() @MinLength(2) @MaxLength(100) city!: string;
  @IsOptional() @IsString() @MaxLength(300) reference?: string;
}
export class PaymentDto {
  @IsEnum(PaymentMethod) method!: PaymentMethod;
  @Matches(/^(APPROVED|REJECTED)$/) scenario!: 'APPROVED' | 'REJECTED';
}
export class StatusDto {
  @IsEnum(OrderStatus) status!: OrderStatus;
  // El servicio exige un motivo de al menos 3 caracteres para una cancelación nueva.
  @IsOptional() @IsString() @MaxLength(500) note?: string;
}
export class CategoryDto {
  @IsString() @MinLength(2) @MaxLength(80) name!: string;
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/) @MaxLength(120) slug!: string;
  @IsOptional() @IsString() @MaxLength(500) description?: string;
  @IsOptional() @IsBoolean() active?: boolean;
}
export class UpdateCategoryDto extends PartialType(CategoryDto) {}
export class FlavorDto {
  // Permite editar tambien recetas combinadas conservadas por migraciones anteriores.
  @IsString() @MinLength(2) @MaxLength(5000) name!: string;
  @IsOptional() @IsBoolean() active?: boolean;
}
export class UpdateFlavorDto extends PartialType(FlavorDto) {}
export class ExtraDto {
  @IsString() @MinLength(2) @MaxLength(80) name!: string;
  @IsOptional() @IsBoolean() active?: boolean;
  @IsInt() @Min(0) @Max(10000000) priceMinor!: number;
  @IsOptional() @IsUrl({ protocols: ['https'], require_protocol: true }) @MaxLength(1500) imageUrl?: string | null;
}
export class UpdateExtraDto extends PartialType(ExtraDto) {}
export class ProductSizeDto {
  @IsOptional() @IsString() @MinLength(3) @MaxLength(100) id?: string;
  @IsString() @MinLength(2) @MaxLength(80) name!: string;
  @IsInt() @Min(1) @Max(10000000) priceMinor!: number;
  // El servicio lo exige para los tamaños nuevos; las existencias actuales se gestionan únicamente desde Inventario.
  @IsOptional() @IsInt() @Min(0) @Max(1000000) stock?: number;
  // Compatibilidad de entrada; el limite de sabores ya no existe en persistencia.
  @IsOptional() @IsInt() @Min(1) @Max(10) maxFlavors?: number;
  @IsOptional() @IsBoolean() active?: boolean;
}
export class ProductDto {
  @IsString() @MinLength(2) @MaxLength(120) name!: string;
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/) @MaxLength(120) slug!: string;
  @IsString() @MinLength(10) @MaxLength(3000) description!: string;
  // Una receta fija del vocabulario, no una seleccion del comprador.
  @IsOptional() @IsString() @IsNotEmpty() @MaxLength(100) flavorId?: string | null;
  @IsUrl({ protocols: ['https'], require_protocol: true }) @MaxLength(1500) imageUrl!: string;
  @IsString() @IsNotEmpty() categoryId!: string;
  @IsOptional() @IsBoolean() featured?: boolean;
  @IsOptional() @IsBoolean() active?: boolean;
  // Se acepta la entrada anterior por compatibilidad; los productos ya no configuran extras.
  @IsOptional() @IsArray() @ArrayMaxSize(50) @ArrayUnique() @IsString({ each: true }) extraIds?: string[];
  @IsArray() @ArrayMinSize(1) @ArrayMaxSize(20) @ValidateNested({ each: true }) @Type(() => ProductSizeDto) presentations!: ProductSizeDto[];
}
export class UpdateProductDto extends PartialType(ProductDto) {}
export class PresentationDto {
  @IsString() @IsNotEmpty() productId!: string;
  @IsString() @MinLength(2) @MaxLength(80) name!: string;
  @IsInt() @Min(1) @Max(10000000) priceMinor!: number;
  @IsInt() @Min(0) @Max(1000000) stock!: number;
  @IsOptional() @IsInt() @Min(1) @Max(10) maxFlavors?: number;
  @IsOptional() @IsBoolean() active?: boolean;
}
export class UpdatePresentationDto extends PartialType(PresentationDto) {}
export class InventoryDto {
  @IsString() @IsNotEmpty() presentationId!: string;
  @IsInt() @Min(-1000000) @Max(1000000) delta!: number;
  @IsString() @MinLength(3) @MaxLength(300) reason!: string;
}
export class StaffDto {
  @IsString() @MinLength(2) @MaxLength(100) name!: string;
  @IsEmail() @MaxLength(254) email!: string;
  @IsString() @MinLength(10) @MaxLength(72) password!: string;
  @IsEnum({ ADMIN: Role.ADMIN }) role!: Role;
  @IsOptional() @IsBoolean() active?: boolean;
}
export class UpdateStaffDto extends PartialType(StaffDto) {}
export class SettingsDto {
  @IsOptional() @IsString() @MinLength(2) @MaxLength(100) name?: string;
  @IsOptional() @IsString() @MaxLength(1000) description?: string;
  @IsOptional() @Matches(/^[A-Z]{3}$/) currency?: string;
  @IsOptional() @IsString() @MaxLength(30) locale?: string;
  @IsOptional() @IsString() @MaxLength(60) timezone?: string;
  @IsOptional() @IsString() @MaxLength(300) address?: string;
  @IsOptional() @IsString() @MaxLength(100) city?: string;
  @IsOptional() @IsString() @MaxLength(30) phone?: string;
  @IsOptional() @IsEmail() email?: string;
  @IsOptional() @IsString() @MaxLength(300) hours?: string;
  @IsOptional() @IsString() @MaxLength(1000) coverageText?: string;
  @IsOptional() @IsInt() @Min(0) @Max(10000000) deliveryFeeMinor?: number;
  @IsOptional() @IsBoolean() deliveryEnabled?: boolean;
}
