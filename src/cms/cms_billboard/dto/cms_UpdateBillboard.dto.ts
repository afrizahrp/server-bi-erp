import {
  IsString,
  IsOptional,
  IsInt,
  IsBoolean,
  IsDate,
  IsEnum,
  IsDateString,
} from 'class-validator';

import { MasterRecordStatusEnum, WebsiteDisplayStatus } from '@prisma/client';

export class Cms_UpdateBillboardDto {
  @IsInt()
  id: number;

  @IsInt()
  @IsOptional()
  section: number;

  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  contentURL: string;

  @IsString()
  @IsOptional()
  content_id: string;

  @IsEnum(MasterRecordStatusEnum)
  iStatus: MasterRecordStatusEnum;

  @IsEnum(WebsiteDisplayStatus)
  iShowedStatus: WebsiteDisplayStatus;

  @IsBoolean()
  @IsOptional()
  isImage: boolean;

  @IsString()
  @IsOptional()
  remarks: string;

  @IsOptional()
  @IsDateString()
  createdAt?: Date;

  @IsString()
  @IsOptional()
  createdBy?: string;

  @IsOptional()
  @IsDateString()
  updatedAt: Date;

  @IsString()
  @IsOptional()
  updatedBy?: string;

  @IsString()
  company_id: string;

  @IsString()
  branch_id: string;
}
