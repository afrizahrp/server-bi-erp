import {
  IsString,
  IsOptional,
  IsInt,
  IsBoolean,
  IsDate,
  IsEnum,
} from 'class-validator';

// import { MasterRecordStatusEnum, WebsiteDisplayStatus } from '@prisma/client';

export class Cms_ResponseBillboardDto {
  @IsInt()
  id: number;

  @IsInt()
  section: number;

  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  // @IsEnum(MasterRecordStatusEnum)
  // iStatus: MasterRecordStatusEnum;

  // @IsEnum(WebsiteDisplayStatus)
  // iShowedStatus?: WebsiteDisplayStatus;

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
  updatedAt: Date;

  @IsString()
  company_id: string;

  @IsString()
  branch_id: string;

  @IsString()
  contentURL: string;

  @IsString()
  content_id: string;
}
