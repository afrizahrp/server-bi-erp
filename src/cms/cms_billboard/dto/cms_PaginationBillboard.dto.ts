import { IsNumber, IsOptional, IsPositive } from 'class-validator';
import { Type } from 'class-transformer';

export class Cms_PaginationBillboardDto {
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  @IsOptional()
  page?: number;

  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  @IsOptional()
  limit?: number;
}
