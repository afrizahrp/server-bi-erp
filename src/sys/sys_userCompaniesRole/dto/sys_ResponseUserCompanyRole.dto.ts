import {
  IsInt,
  IsString,
  IsBoolean,
  IsEnum,
  IsOptional,
} from 'class-validator';
import { MasterRecordStatusEnum } from '@prisma/client';

export class Sys_ResponseUserCompanyRoleDto {
  @IsInt()
  id: number;

  @IsInt()
  user_id: number;

  @IsString()
  role_id: string;

  @IsString()
  company_id: string;

  @IsString()
  branch_id: string;

  @IsEnum(MasterRecordStatusEnum)
  iStatus: MasterRecordStatusEnum;

  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;
}
