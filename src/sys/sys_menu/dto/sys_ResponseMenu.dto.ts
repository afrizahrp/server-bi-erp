import {
  IsString,
  IsOptional,
  IsInt,
  IsBoolean,
  IsDate,
  IsEnum,
} from 'class-validator';
import { MasterRecordStatusEnum } from '@prisma/client';

export class Sys_ResponseMenuDto {
  @IsInt()
  id: number;

  @IsInt()
  @IsOptional()
  parent_id?: number;

  @IsString()
  menu_description: string;

  @IsString()
  @IsOptional()
  href?: string;

  @IsString()
  module_id: string;

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
  createdAt: Date;

  @IsString()
  @IsOptional()
  updatedBy?: string;

  @IsDate()
  @IsOptional()
  updatedAt?: Date;

  @IsString()
  company_id: string;

  @IsString()
  branch_id: string;
}
