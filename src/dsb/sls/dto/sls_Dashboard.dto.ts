import { IsOptional, IsString } from 'class-validator';

export class sls_dashboardDto {
  @IsOptional()
  @IsString({ each: true })
  paidStatus?: string | string[];

  @IsOptional()
  @IsString({ each: true })
  poType?: string | string[];

  @IsOptional()
  @IsString({ each: true })
  salesPersonName?: string | string[];

  @IsOptional()
  @IsString()
  startPeriod?: string;

  @IsOptional()
  @IsString()
  endPeriod?: string;
}
