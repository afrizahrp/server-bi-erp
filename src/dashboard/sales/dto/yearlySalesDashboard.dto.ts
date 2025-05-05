import { IsArray, IsIn, IsOptional, IsString } from 'class-validator';

export class yearlySalesDashboardDto {
  @IsString()
  years: string[];

  @IsOptional()
  @IsString({ each: true }) // Validasi tiap elemen di array
  salesPersonName?: string | string[];

  @IsOptional()
  @IsString()
  @IsIn(['qty', 'total_amount'], {
    message: 'sortBy must be one of: qty, total_amount',
  })
  sortBy?: string;
}
