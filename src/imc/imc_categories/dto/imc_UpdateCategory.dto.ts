// src/products/dto/update-product.dto.ts
import {
  IsString,
  IsOptional,
  IsInt,
  IsBoolean,
  IsDate,
  IsNumber,
  IsEnum,
} from 'class-validator';
import { MasterRecordStatusEnum, WebsiteDisplayStatus } from '@prisma/client';

export class Imc_UpdateCategoryDto {
  @IsString()
  @IsOptional()
  name: string;

  @IsNumber()
  type: number;

  @IsOptional()
  @IsEnum(MasterRecordStatusEnum)
  iStatus: MasterRecordStatusEnum;

  @IsOptional()
  @IsEnum(WebsiteDisplayStatus)
  iShowedStatus?: WebsiteDisplayStatus;

  @IsString()
  @IsOptional()
  createdBy?: string;

  @IsDate()
  @IsOptional()
  createdAt?: Date;

  @IsString()
  @IsOptional()
  updatedBy?: string;

  @IsDate()
  @IsOptional()
  updatedAt?: Date;

  @IsString()
  @IsOptional()
  company_id?: string;

  @IsString()
  @IsOptional()
  branch_id?: string;
}
