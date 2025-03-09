import { MasterRecordStatusEnum } from '@prisma/client';
import {
  IsString,
  IsOptional,
  IsInt,
  IsBoolean,
  IsDate,
  IsEnum,
} from 'class-validator';

export class Sys_MenuWithPermissionDto {
  @IsInt()
  id: number | null;

  @IsInt()
  @IsOptional()
  parent_id?: number | null;

  @IsString()
  menu_description: string;

  @IsString()
  @IsOptional()
  href?: string | null;

  @IsString()
  module_id: string | null;

  @IsString()
  @IsOptional()
  menu_type?: string | null;

  @IsBoolean()
  @IsOptional()
  has_child?: boolean | null;

  @IsString()
  @IsOptional()
  icon?: string | null;

  @IsEnum(MasterRecordStatusEnum)
  iStatus?: MasterRecordStatusEnum;

  @IsString()
  @IsOptional()
  createdBy?: string | null;

  @IsDate()
  createdAt: Date | null;

  @IsString()
  @IsOptional()
  updatedBy?: string | null;

  @IsDate()
  @IsOptional()
  updatedAt?: Date | null;

  @IsString()
  company_id: string | null;

  @IsString()
  branch_id: string;

  @IsBoolean()
  can_view: boolean;

  @IsBoolean()
  can_create: boolean;

  @IsBoolean()
  can_edit: boolean;

  @IsBoolean()
  can_delete: boolean;

  @IsBoolean()
  can_print: boolean;

  @IsBoolean()
  can_approve: boolean;
}
