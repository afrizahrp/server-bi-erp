import {
  IsString,
  IsOptional,
  IsInt,
  IsBoolean,
  IsDate,
  IsEnum,
} from 'class-validator';

import { MasterRecordStatusEnum, WebsiteDisplayStatus } from '@prisma/client';

export class Cms_ResponseBillboardDto {
  @IsInt()
  id: string;

  @IsString()
  content_id: string;

  @IsInt()
  section: number;

  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  name?: string;

  @IsBoolean()
  @IsOptional()
  isImage?: boolean;

  @IsString()
  @IsOptional()
  contentType?: string;

  @IsString()
  contentURL: string;

  @IsEnum(MasterRecordStatusEnum)
  iStatus: MasterRecordStatusEnum;

  @IsEnum(WebsiteDisplayStatus)
  iShowedStatus?: WebsiteDisplayStatus;

  @IsString()
  @IsOptional()
  remarks?: string;

  @IsString()
  @IsOptional()
  module_id: string;

  // @IsBoolean()
  // @IsOptional()
  // isShowBtn?: boolean;

  // @IsString()
  // @IsOptional()
  // btnText?: string;

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
  // updatedAt: Date;

  // @IsString()
  // company_id: string;

  // @IsString()
  // branch_id: string;
}
