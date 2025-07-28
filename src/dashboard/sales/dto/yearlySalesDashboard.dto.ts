import { IsOptional, IsString, IsIn, ArrayMaxSize } from 'class-validator';

export class yearlySalesDashboardDto {
  @IsString({ each: true })
  company_id: string[]; // Hanya array, tanpa @IsArray()

  @IsString({ each: true })
  years: string[]; // Hanya array, tanpa @IsArray()

  @IsOptional()
  @IsString({ each: true })
  salesPersonName?: string[];

  @IsOptional()
  @IsString()
  @IsIn(['qty', 'total_amount'], {
    message: 'sortBy must be one of: qty, total_amount',
  })
  sortBy?: string;

  @IsOptional()
  @IsString({ each: true })
  @IsIn(
    [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ],
    {
      each: true,
      message: 'Each month must be a valid month name (e.g., Jan, Feb, etc.)',
    },
  )
  @ArrayMaxSize(3, { message: 'Maximum 3 months can be selected' })
  months?: string[];
}
