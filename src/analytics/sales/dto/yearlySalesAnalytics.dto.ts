import { IsString } from 'class-validator';

export class yearlySalesAnalyticsDto {
  @IsString()
  years: string[];
}
