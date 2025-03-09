import { IsString, IsOptional, IsDate } from 'class-validator';

export class Cms_UpdateProductDescsDto {
  @IsString()
  id: string;

  @IsString()
  descriptions: string;

  @IsString()
  benefits: string;

  @IsString()
  @IsOptional()
  createdBy: string;

  @IsDate()
  @IsOptional()
  createdAt: Date;

  @IsString()
  @IsOptional()
  updatedBy: string;

  @IsDate()
  @IsOptional()
  updatedAt: Date;

  @IsString()
  company_id: string;

  @IsString()
  branch_id: string;
}
