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
  id: number;
  parent_id: number | null;
  menu_description: string;
  href: string;
  module_id: string;
  menu_type: string;
  has_child: boolean;
  icon: string;
  createdBy: string;
  createdAt: Date;
  updatedBy: string;
  updatedAt: Date;
  company_id: string;
  branch_id: string;
  can_view: boolean;
  can_create: boolean;
  can_edit: boolean;
  can_delete: boolean;
  can_print: boolean;
  can_approve: boolean;
  child?: Sys_MenuWithPermissionDto[]; // Pastikan child ada di sini
}

// @IsInt()
// id: number | null;

// @IsInt()
// @IsOptional()
// parent_id?: number | null;

// @IsString()
// menu_description: string;

// @IsString()
// @IsOptional()
// href?: string | null;

// @IsString()
// module_id: string | null;

// @IsString()
// @IsOptional()
// menu_type?: string | null;

// @IsBoolean()
// @IsOptional()
// has_child?: boolean | null;

// @IsString()
// @IsOptional()
// icon?: string | null;

// @IsEnum(MasterRecordStatusEnum)
// iStatus?: MasterRecordStatusEnum;

// @IsString()
// @IsOptional()
// createdBy?: string | null;

// @IsDate()
// createdAt: Date | null;

// @IsString()
// @IsOptional()
// updatedBy?: string | null;

// @IsDate()
// @IsOptional()
// updatedAt?: Date | null;

// @IsString()
// company_id: string | null;

// @IsString()
// branch_id: string;

// @IsBoolean()
// can_view: boolean;

// @IsBoolean()
// can_create: boolean;

// @IsBoolean()
// can_edit: boolean;

// @IsBoolean()
// can_delete: boolean;

// @IsBoolean()
// can_print: boolean;

// @IsBoolean()
// can_approve: boolean;

// child?: Sys_MenuWithPermissionDto[];
// }
