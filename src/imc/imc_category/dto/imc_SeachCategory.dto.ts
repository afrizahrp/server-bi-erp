// imc_SearchCategory.dto.ts
import { IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class Imc_SearchCategoryDto {
  @IsString()
  searchBy: string;

  @IsString()
  searchTerm: string;

  @IsOptional()
  @Type(() => Number)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  limit?: number;

  @IsOptional()
  status?: string | string[];

  @IsOptional()
  categoryType?: string | string[];
}
