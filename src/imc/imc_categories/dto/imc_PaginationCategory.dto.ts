import { IsNumber, IsOptional, IsPositive } from 'class-validator';

export class Imc_PaginationCategoryDto {
  @IsNumber()
  @IsPositive()
  @IsOptional()
  page: number;

  @IsNumber()
  @IsPositive()
  @IsOptional()
  limit: number;
}
