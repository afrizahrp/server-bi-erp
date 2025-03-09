import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  IsDate,
  IsEnum,
} from 'class-validator';
import { MasterRecordStatusEnum } from '@prisma/client';

export class Sys_ResponseMenuPermissionDto {
  @IsInt()
  id: number;

  @IsInt()
  userCompanyRole_id: number;

  @IsInt()
  menu_id: number;

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
