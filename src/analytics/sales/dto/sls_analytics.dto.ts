import { IsString, IsOptional, IsInt, Min, IsNumber } from 'class-validator';

export class sls_analyticsDto {
  @IsString()
  startPeriod: string;

  @IsString()
  endPeriod: string;

  @IsString()
  @IsOptional()
  paidStatus?: string | string[];

  @IsString()
  @IsOptional()
  poType?: string | string[];

  @IsOptional()
  @IsString({ each: true }) // Validasi tiap elemen di array
  salesPersonName?: string | string[];

  @IsOptional()
  @IsNumber({}, { message: 'topN must be a valid number' })
  @Min(1, { message: 'topN must be at least 1' })
  topN?: number;
}
