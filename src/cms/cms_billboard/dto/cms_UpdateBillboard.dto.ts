import {
  IsString,
  IsOptional,
  IsInt,
  IsBoolean,
  IsDate,
  IsEnum,
} from 'class-validator';

import { MasterRecordStatusEnum, WebsiteDisplayStatus } from '@prisma/client';

export class Cms_UpdateBillboardDto {
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
  iShowedStatus: WebsiteDisplayStatus;

  @IsBoolean()
  isImage: boolean;

  @IsString()
  remarks: string;

  @IsString()
  company_id?: string;
}
