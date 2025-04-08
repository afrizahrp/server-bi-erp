import { IsString, IsNumber, IsOptional, IsPositive } from 'class-validator';
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
  name?: string; // Tambahkan properti ini

  @IsString()
  @IsOptional()
  status?: string; // Tambahkan properti ini
}
