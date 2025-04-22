import { Transform } from 'class-transformer';
import { IsOptional, IsString } from 'class-validator';

export class sls_FilterInvoiceHdDto {
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
  @Transform(({ value }) => (Array.isArray(value) ? value : [value]))
  paidStatus?: string[]; // Handling paidStatus as array
}
