import { IsString, IsOptional, IsEnum } from 'class-validator';
import { MasterRecordStatusEnum, WebsiteDisplayStatus } from '@prisma/client';

export class Imc_ResponseCategoryDto {
  @IsString()
  id: string;

  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  categoryType?: string;

  @IsString()
  @IsOptional()
  slug?: string;

  @IsEnum(MasterRecordStatusEnum)
  iStatus: MasterRecordStatusEnum;

  @IsString()
  @IsOptional()
  imageURL?: string;

  @IsString()
  @IsOptional()
  remarks?: string;

  @IsEnum(WebsiteDisplayStatus)
  @IsOptional()
  iShowedStatus?: WebsiteDisplayStatus;

  @IsString()
  @IsOptional()
  module_id?: string;
}
