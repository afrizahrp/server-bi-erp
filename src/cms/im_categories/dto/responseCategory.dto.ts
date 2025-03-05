import { IsString, IsOptional } from 'class-validator';

export class ResponseCategoryDto {
  @IsString()
  id: string;

  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  categoryType?: string;

  @IsString()
  @IsOptional()
  status?: string;

  @IsString()
  @IsOptional()
  remarks?: string;
}
