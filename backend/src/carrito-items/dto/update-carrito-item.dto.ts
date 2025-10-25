import { PartialType } from '@nestjs/mapped-types';
import { CreateCarritoItemDto } from './create-carrito-item.dto';

export class UpdateCarritoItemDto extends PartialType(CreateCarritoItemDto) {}
