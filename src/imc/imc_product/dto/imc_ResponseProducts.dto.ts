import {
  IsString,
  IsBoolean,
  IsOptional,
  IsDate,
  IsEnum,
} from 'class-validator';

import { MasterRecordStatusEnum, WebsiteDisplayStatus } from '@prisma/client';

export class Imc_ResponseProductDto {
  @IsString()
  id: string;

  @IsString()
  @IsOptional()
  register_id?: string;

  @IsString()
  @IsOptional()
  catalog_id?: string;

  @IsString()
  name: string;

  @IsString()
  category_id: string;

  @IsString()
  subCategory_id: string;

  @IsString()
  brand_id: string;

  @IsEnum(MasterRecordStatusEnum)
  iStatus: MasterRecordStatusEnum;

  @IsEnum(WebsiteDisplayStatus)
  iShowedStatus?: WebsiteDisplayStatus;

  @IsString()
  @IsOptional()
  slug?: string;

  @IsBoolean()
  isMaterial: boolean;

  @IsBoolean()
  isService: boolean;

  @IsBoolean()
  isFinishing: boolean;

  @IsBoolean()
  isAccessories: boolean;

  @IsString()
  @IsOptional()
  uom_id?: string;

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
