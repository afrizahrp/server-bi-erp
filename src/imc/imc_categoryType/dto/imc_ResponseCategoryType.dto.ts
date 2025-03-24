import { IsString, IsOptional, IsInt, IsDate, IsEnum } from 'class-validator';
import { MasterRecordStatusEnum } from '@prisma/client';

export class Imc_ResponseCategoryTypeDto {
  @IsInt()
  id: number;

  @IsString()
  @IsOptional()
  name?: string;

  @IsEnum(MasterRecordStatusEnum)
  iStatus: MasterRecordStatusEnum;

  @IsString()
  @IsOptional()
  remarks?: string;

  @IsString()
  @IsOptional()
  stock_acct?: string;

  @IsString()
  @IsOptional()
  sales_acct?: string;

  @IsString()
  @IsOptional()
  cogs_acct?: string;

  @IsString()
  @IsOptional()
  expense_acct?: string;

  @IsString()
  @IsOptional()
  asset_acct?: string;

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

  @IsString()
  branch_id: string;
}
