import {
  IsString,
  IsOptional,
  IsInt,
  IsDecimal,
  IsDate,
  IsEnum,
} from 'class-validator';
import { InvoiceStatusEnum } from '@prisma/client';

export class sls_ResponseInvoiceHdDto {
  @IsString()
  id: string;

  @IsString()
  @IsOptional()
  so_id?: string;

  @IsDate()
  invoice_date: Date;

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

  @IsInt()
  base_amt?: number;

  @IsInt()
  dp_amt?: number;

  @IsInt()
  discount_amt?: number;
  @IsInt()
  total_discount?: number;
  @IsInt()
  tax_amt?: number;
  @IsInt()
  total_delivery_amt?: number;
  @IsInt()
  total_amt?: number;

  @IsEnum(InvoiceStatusEnum)
  invoice_status: InvoiceStatusEnum;
}
