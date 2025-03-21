import {
  IsString,
  IsOptional,
  IsInt,
  IsBoolean,
  IsDate,
  IsNumber,
  IsEnum,
  IsDateString,
} from 'class-validator';
import { MasterRecordStatusEnum, WebsiteDisplayStatus } from '@prisma/client';

export class Cms_CreateBillboardDto {
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
  iShowedStatus?: WebsiteDisplayStatus;

  @IsBoolean()
  @IsOptional()
  isImage: boolean;

  @IsString()
  @IsOptional()
  remarks: string;

  @IsString()
  @IsOptional()
  createdBy?: string;

  @IsOptional()
  @IsDateString()
  createdAt?: Date;

  @IsString()
  @IsOptional()
  updatedBy?: string;

  @IsOptional()
  @IsDateString()
  updatedAt: Date;

  @IsString()
  company_id: string;

  @IsString()
  branch_id: string;
}
