import { IsOptional, IsString, IsNumber, IsArray } from 'class-validator';
import { Type } from 'class-transformer';

export class Imc_SearchCategoryDto {
  @IsString()
  searchBy: string;

  @IsString()
  searchTerm: string;

  @IsOptional()
  @IsString({ each: true })
  @Type(() => String)
  status?: string | string[];

  @IsOptional()
  @IsString({ each: true })
  @Type(() => String)
  categoryType?: string | string[];

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number;
}
