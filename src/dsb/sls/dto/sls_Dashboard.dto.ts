import { IsString, IsOptional } from 'class-validator';

export class sls_dashboardDto {
  @IsString()
  startPeriod: string;

  @IsString()
  endPeriod: string;

  @IsString()
  @IsOptional()
  paidStatus?: string;

  @IsString()
  @IsOptional()
  poType?: string;

  @IsOptional()
  @IsString({ each: true }) // Validasi tiap elemen di array
  salesPersonName?: string | string[];
}
