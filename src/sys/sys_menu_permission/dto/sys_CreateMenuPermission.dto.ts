import { MasterRecordStatusEnum } from '@prisma/client';
import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  IsDate,
  IsEnum,
} from 'class-validator';

export class Sys_CreateMenuPermissionDto {
  @IsInt()
  userCompanyRole_id: number;

  @IsInt()
  menu_id: number;

  @IsBoolean()
  @IsOptional()
  can_view?: boolean;

  @IsBoolean()
  @IsOptional()
  can_create?: boolean;

  @IsBoolean()
  @IsOptional()
  can_edit?: boolean;

  @IsBoolean()
  @IsOptional()
  can_delete?: boolean;

  @IsBoolean()
  @IsOptional()
  can_print?: boolean;

  @IsBoolean()
  @IsOptional()
  can_approve?: boolean;

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
  company_id: string;

  @IsString()
  branch_id: string;
}
