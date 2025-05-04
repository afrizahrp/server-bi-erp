import { Transform } from 'class-transformer';
import { IsOptional, IsString } from 'class-validator';

export class filterSalesInvoiceHdDto {
  @IsOptional()
  @IsString()
  startPeriod?: string;

  @IsOptional()
  @IsString()
  endPeriod?: string;

  @IsOptional()
  @Transform(({ value }) => (Array.isArray(value) ? value : [value]))
  salesPersonName?: string[];

  @IsOptional()
  @Transform(({ value }) => (Array.isArray(value) ? value : [value]))
  poType?: string[];

  @IsOptional()
  @Transform(({ value }) => {
    // Pastikan ini mengubah string menjadi array jika diperlukan
    return Array.isArray(value) ? value : value ? [value] : [];
  })
  paidStatus?: string[];
}
