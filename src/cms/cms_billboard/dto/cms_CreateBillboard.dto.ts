import {
  IsString,
  IsOptional,
  IsInt,
  IsBoolean,
  IsDate,
  IsNumber,
  IsEnum,
} from 'class-validator';
import { MasterRecordStatusEnum, WebsiteDisplayStatus } from '@prisma/client';

export class Cms_CreateBillboardDto {
  @IsInt()
  id: number;

  @IsInt()
  section: number;

  @IsString()
  title: string;

  @IsString()
  name: string;

  @IsString()
  contentURL: string;

  @IsString()
  contentType: string;

  @IsString()
  content_id: string;

  @IsEnum(MasterRecordStatusEnum)
  iStatus: MasterRecordStatusEnum;

  @IsEnum(WebsiteDisplayStatus)
  iShowedStatus?: WebsiteDisplayStatus;

  @IsBoolean()
  isImage: boolean;

  @IsString()
  remarks: string;

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
}
