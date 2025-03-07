import {
  IsString,
  IsOptional,
  IsInt,
  IsBoolean,
  IsDate,
  IsEnum,
} from 'class-validator';

import { MasterRecordStatusEnum, WebsiteDisplayStatus } from '@prisma/client';

export class UpdateBillboardDto {
  @IsInt()
  @IsOptional()
  id?: number;

  @IsInt()
  @IsOptional()
  section?: number;

  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(MasterRecordStatusEnum)
  iStatus: MasterRecordStatusEnum;

  @IsEnum(WebsiteDisplayStatus)
  iShowedStatus?: WebsiteDisplayStatus;

  @IsBoolean()
  @IsOptional()
  isShowBtn?: boolean;

  @IsString()
  @IsOptional()
  btnText?: string;

  @IsBoolean()
  @IsOptional()
  isImage?: boolean;

  @IsString()
  @IsOptional()
  remarks?: string;

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

  @IsString()
  @IsOptional()
  contentURL?: string;

  @IsString()
  @IsOptional()
  content_id?: string;
}
