import { MasterRecordStatusEnum } from '@prisma/client';
import {
  IsString,
  IsOptional,
  IsInt,
  IsBoolean,
  IsDate,
  IsEnum,
} from 'class-validator';

export class Sys_UpdateMenuDto {
  @IsInt()
  @IsOptional()
  parent_id?: number;

  @IsString()
  @IsOptional()
  menu_description?: string;

  @IsString()
  @IsOptional()
  href?: string;

  @IsString()
  @IsOptional()
  module_id?: string;

  @IsString()
  @IsOptional()
  menu_type?: string;

  @IsBoolean()
  @IsOptional()
  has_child?: boolean;

  @IsString()
  @IsOptional()
  icon?: string;

  @IsEnum(MasterRecordStatusEnum)
  iStatus: MasterRecordStatusEnum;

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
