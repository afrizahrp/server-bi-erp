import {
  IsString,
  IsNumber,
  IsOptional,
  IsPositive,
  IsArray,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class Imc_PaginationCategoryDto {
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

  @IsOptional()
  @Transform(({ value }) => (Array.isArray(value) ? value : [value])) // ✅ Ubah string menjadi array otomatis
  @IsArray()
  @IsString({ each: true })
  status?: string[];
  // @IsString()
  // @IsOptional()
  // status?: string; // Tambahkan properti ini
}
