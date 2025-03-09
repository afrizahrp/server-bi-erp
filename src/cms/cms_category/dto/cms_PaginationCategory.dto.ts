import { IsNumber, IsOptional, IsPositive } from 'class-validator';

export class Cms_PaginationCategoryDto {
  @IsNumber()
  @IsPositive()
  @IsOptional()
  page: number;

  @IsNumber()
  @IsPositive()
  @IsOptional()
  limit: number;
}
