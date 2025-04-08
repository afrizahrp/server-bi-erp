import {
  IsString,
  IsOptional,
  IsInt,
  IsDecimal,
  IsDate,
  IsEnum,
} from 'class-validator';
import { InvoiceStatusEnum } from '@prisma/client';

export class sls_CreateSlsInvoiceHdDto {
  @IsString()
  id: string;

  @IsString()
  @IsOptional()
  so_id?: string;

  @IsDate()
  @IsOptional()
  invoice_date?: Date;

  @IsString()
  @IsOptional()
  ref_id?: string;

  @IsString()
  @IsOptional()
  tax_id?: string;

  @IsInt()
  @IsOptional()
  tax_rate?: number;

  @IsString()
  debtor_id: string;

  @IsString()
  @IsOptional()
  debtor_name?: string;

  @IsString()
  customer_id: string;

  @IsString()
  @IsOptional()
  customer_name?: string;

  @IsInt()
  @IsOptional()
  credit_terms?: number;

  @IsDate()
  @IsOptional()
  duedate?: Date;

  @IsString()
  @IsOptional()
  sales_person_id?: string;

  @IsString()
  @IsOptional()
  sales_person_name?: string;

  @IsDecimal()
  @IsOptional()
  base_amt?: number;

  @IsDecimal()
  @IsOptional()
  dp_amt?: number;

  @IsDecimal()
  @IsOptional()
  discount_amt?: number;

  @IsDecimal()
  @IsOptional()
  total_discount?: number;

  @IsDecimal()
  @IsOptional()
  tax_amt?: number;

  @IsDecimal()
  @IsOptional()
  total_delivery_amt?: number;

  @IsDecimal()
  @IsOptional()
  total_amt?: number;

  @IsEnum(InvoiceStatusEnum)
  @IsOptional()
  invoice_status?: InvoiceStatusEnum;

  @IsString()
  company_id: string;

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
  branch_id?: string;
}
