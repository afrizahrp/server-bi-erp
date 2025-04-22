import {
  IsString,
  IsNumber,
  IsOptional,
  IsPositive,
  IsEnum,
  IsInt,
  Matches,
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
  po_id?: string; // Tambahkan properti ini

  @IsInt()
  @IsOptional()
  invoiceType_id: number; // Tambahkan properti ini

  @IsInt()
  @IsOptional()
  poType_id: number;

  @IsOptional()
  @IsString()
  invoiceType?: string; // Tambahkan properti ini

  @IsOptional()
  @IsString()
  poType?: string; // Tambahkan properti ini

  @IsString()
  @IsOptional()
  ecatalog_id?: string; // Tambahkan properti ini

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
  @Matches(/^[A-Za-z]{3}\d{4}$/, {
    message: 'startPeriod must be in format mmmYYYY (e.g., Jan2025)',
  })
  startPeriod?: string;

  @IsOptional()
  @IsString()
  @Matches(/^[A-Za-z]{3}\d{4}$/, {
    message: 'endPeriod must be in format mmmYYYY (e.g., Mar2025)',
  })
  endPeriod?: string;

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
