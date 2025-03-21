import {
  IsString,
  IsOptional,
  IsInt,
  IsBoolean,
  IsDate,
  IsEnum,
  IsDateString,
  isDateString,
} from 'class-validator';

import { MasterRecordStatusEnum, WebsiteDisplayStatus } from '@prisma/client';

export class Cms_ResponseBillboardDto {
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

  @IsString()
  company_id?: string;

  @IsDateString()
  createdAt: string;

  @IsDateString()
  updatedAt: string;
}
