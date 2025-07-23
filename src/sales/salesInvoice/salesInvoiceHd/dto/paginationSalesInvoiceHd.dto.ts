import { Transform } from 'class-transformer';
import {
  IsString,
  IsNumber,
  IsOptional,
  IsPositive,
  IsEnum,
  IsInt,
  Matches,
} from 'class-validator';

export class paginationSalesInvoiceHdDto {
  @Transform(({ value }) => Number(value))
  @IsNumber()
  @IsPositive()
  @IsOptional()
  page?: number;

  @Transform(({ value }) => Number(value))
  @IsNumber()
  @IsPositive()
  @IsOptional()
  limit?: number;

  @IsString()
  @IsOptional()
  customerName?: string;

  @Transform(({ value }) =>
    Array.isArray(value)
      ? value
      : value?.split(',').map((v: string) => v.trim()),
  )
  @IsString({ each: true })
  @IsOptional()
  company_id?: string[];

  @Transform(({ value }) =>
    Array.isArray(value)
      ? value
      : value?.split(',').map((v: string) => v.trim()),
  )
  @IsString({ each: true })
  @IsOptional()
  salesPersonName?: string[];

  @IsString()
  @IsOptional()
  po_id?: string;

  @Transform(({ value }) => Number(value))
  @IsInt()
  @IsOptional()
  invoiceType_id?: number;

  @Transform(({ value }) => Number(value))
  @IsInt()
  @IsOptional()
  poType_id?: number;

  @IsString()
  @IsOptional()
  invoiceType?: string;

  @Transform(({ value }) =>
    Array.isArray(value)
      ? value
      : value?.split(',').map((v: string) => v.trim()),
  )
  @IsString({ each: true })
  @IsOptional()
  poType?: string[];

  @IsString()
  @IsOptional()
  ecatalog_id?: string;

  @Transform(({ value }) =>
    Array.isArray(value)
      ? value
      : value?.split(',').map((v: string) => v.trim()),
  )
  @IsString({ each: true })
  @IsOptional()
  paidStatus?: string[];

  @IsString()
  @IsOptional()
  startDate?: string;

  @IsString()
  @IsOptional()
  endDate?: string;

  @IsOptional()
  @IsString()
  @Matches(/^[A-Za-z]{3}\d{4}$/, {
    message: 'startPeriod must be in format MMMYYYY (e.g., Jan2025)',
  })
  startPeriod?: string;

  @IsOptional()
  @IsString()
  @Matches(/^[A-Za-z]{3}\d{4}$/, {
    message: 'endPeriod must be in format MMMYYYY (e.g., Mar2025)',
  })
  endPeriod?: string;

  @IsOptional()
  @IsString()
  searchBy?: string;

  @IsOptional()
  @IsString()
  searchTerm?: string;

  @IsOptional()
  @IsString()
  orderBy?: string;

  @IsOptional()
  @IsEnum(['asc', 'desc'])
  orderDir?: 'asc' | 'desc';
}
