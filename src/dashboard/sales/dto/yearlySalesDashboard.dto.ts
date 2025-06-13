import {
  IsArray,
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class yearlySalesDashboardDto {
  @IsArray()
  @IsString({ each: true })
  years: string[];

  @IsOptional()
  @IsString({ each: true })
  salesPersonName?: string | string[];

  @IsOptional()
  @IsString()
  @IsIn(['qty', 'total_amount'], {
    message: 'sortBy must be one of: qty, total_amount',
  })
  sortBy?: string;

  @IsOptional()
  @IsArray()
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
  @MaxLength(3, {
    each: false, // Validasi panjang array, bukan panjang string
    message: 'Maximum 3 months can be selected',
  })
  months?: string[];

  // @IsOptional()
  // @IsIn([0, 1], {
  //   message: 'includeHoSales must be 0 or 1',
  // })
  // includeHoSales?: number;
}
