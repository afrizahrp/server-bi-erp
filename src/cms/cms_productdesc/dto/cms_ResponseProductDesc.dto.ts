import { IsString, IsOptional, IsDate } from 'class-validator';

export class Cms_ResponseProductDescDto {
  @IsString()
  id: string;

  @IsString()
  descriptions: string;

  @IsString()
  benefits: string;

  @IsString()
  @IsOptional()
  createdBy?: string;

  @IsDate()
  createdAt: Date;

  @IsString()
  @IsOptional()
  updatedBy?: string;

  @IsDate()
  updatedAt: Date;

  @IsString()
  company_id: string;

  @IsString()
  branch_id: string;
}
