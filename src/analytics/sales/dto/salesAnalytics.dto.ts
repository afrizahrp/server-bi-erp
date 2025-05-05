import { IsString, IsOptional, Min, IsNumber, IsIn } from 'class-validator';

export class salesAnalyticsDto {
  @IsString()
  @IsOptional()
  startPeriod?: string;

  @IsString()
  @IsOptional()
  endPeriod?: string;

  @IsString()
  @IsOptional()
  yearPeriod?: string;

  @IsString()
  @IsOptional()
  monthPeriod?: string;

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

  @IsOptional()
  @IsString()
  @IsIn(['qty', 'total_amount'], {
    message: 'sortBy must be one of: qty, total_amount',
  })
  sortBy?: string;
}
