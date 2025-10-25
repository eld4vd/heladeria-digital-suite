import { IsInt, IsNotEmpty } from 'class-validator';

export class AdjustStockDto {
  @IsNotEmpty()
  @IsInt()
  delta!: number;
}
