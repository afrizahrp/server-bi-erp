// src/products/dto/create-product.dto.ts
import {
  IsString,
  IsOptional,
  IsInt,
  IsBoolean,
  IsDate,
  IsNumber,
  isString,
  IsEnum,
} from 'class-validator';

import { MasterRecordStatusEnum, WebsiteDisplayStatus } from '@prisma/client';

export class CreateCategoryDto {
  @IsNumber()
  type: number;

  @IsString()
  id: string;

  @IsString()
  name: string;

  @IsEnum(MasterRecordStatusEnum)
  iStatus: MasterRecordStatusEnum;

  @IsEnum(WebsiteDisplayStatus)
  iShowedStatus?: WebsiteDisplayStatus;

  @IsString()
  @IsOptional()
  uom_id: string;

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
  updatedAt: Date;

  @IsString()
  company_id: string;

  @IsString()
  branch_id: string;
}
