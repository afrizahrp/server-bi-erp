import {
  IsString,
  IsNumber,
  IsOptional,
  IsPositive,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
export class sls_PaginationInvoiceHdDto {
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

  @IsString()
  @IsOptional()
  customerName?: string; // Tambahkan properti ini

  @IsString()
  @IsOptional()
  salesPersonName?: string; // Tambahkan properti ini

  @IsString()
  @IsOptional()
  status?: string; // Tambahkan properti ini

  @IsString()
  @IsOptional()
  startDate?: string; // Tambahkan properti ini

  @IsString()
  @IsOptional()
  endDate?: string; // Tambahkan properti ini

  @IsOptional()
  @IsString()
  searchBy?: string;

  @IsOptional()
  @IsString()
  searchTerm?: string;

  @IsOptional()
  orderBy?: string;

  @IsOptional()
  @IsEnum(['asc', 'desc'])
  orderDir?: 'asc' | 'desc';
}
