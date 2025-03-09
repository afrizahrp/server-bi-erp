import {
  IsString,
  IsOptional,
  IsBoolean,
  IsDate,
  IsEnum,
} from 'class-validator';
import { MasterRecordStatusEnum, WebsiteDisplayStatus } from '@prisma/client';

export class Imc_CreateProductDto {
  @IsString()
  id: string;

  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  register_id?: string;

  @IsString()
  @IsOptional()
  catalog_id?: string;

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
  isService?: boolean;

  @IsBoolean()
  isMaterial?: boolean;

  @IsBoolean()
  isFinishing?: boolean;

  @IsBoolean()
  isAccessories?: boolean;

  @IsString()
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
