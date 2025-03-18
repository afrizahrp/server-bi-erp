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

  // @IsString()
  // @IsOptional()
  // createdBy?: string;

  // @IsDate()
  // @IsOptional()
  // createdAt?: Date;

  // @IsString()
  // @IsOptional()
  // updatedBy?: string;

  // @IsDate()
  // @IsOptional()
  // updatedAt?: Date;

  @IsString()
  company_id: string;
}
