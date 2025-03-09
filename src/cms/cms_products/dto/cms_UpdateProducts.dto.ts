// src/products/dto/update-product.dto.ts
import {
  IsString,
  IsOptional,
  IsInt,
  IsBoolean,
  IsDate,
  IsEnum,
} from 'class-validator';

import { MasterRecordStatusEnum, WebsiteDisplayStatus } from '@prisma/client';

export class Cms_UpdateProductDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  register_id?: string;

  @IsString()
  @IsOptional()
  catalog_id?: string;

  @IsString()
  @IsOptional()
  category_id?: string;

  @IsString()
  @IsOptional()
  subCategory_id?: string;

  @IsString()
  @IsOptional()
  brand_id?: string;

  @IsEnum(MasterRecordStatusEnum)
  @IsOptional()
  iStatus?: MasterRecordStatusEnum;

  @IsString()
  @IsOptional()
  slug?: string;

  @IsBoolean()
  @IsOptional()
  isMaterial?: boolean;

  @IsBoolean()
  @IsOptional()
  isService?: boolean;

  @IsBoolean()
  @IsOptional()
  isFinishing?: boolean;

  @IsBoolean()
  @IsOptional()
  isAccessories?: boolean;

  @IsEnum(WebsiteDisplayStatus)
  @IsOptional()
  iShowedStatus?: WebsiteDisplayStatus;

  @IsString()
  @IsOptional()
  uom_id?: string;

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
