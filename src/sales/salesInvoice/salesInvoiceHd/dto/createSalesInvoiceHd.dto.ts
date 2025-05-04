import {
  IsString,
  IsOptional,
  IsInt,
  IsDecimal,
  IsDate,
  IsEnum,
} from 'class-validator';
import { InvoicePaidStatusEnum } from '@prisma/client';

export class createSalesInvoiceHdDto {
  @IsString()
  @IsOptional()
  po_id: string;

  @IsString()
  @IsOptional()
  ecatalog_id: string;

  @IsString()
  invoice_id: string;

  @IsString()
  @IsOptional()
  so_id?: string;

  @IsDate()
  @IsOptional()
  invoiceDate?: Date;

  @IsString()
  @IsOptional()
  ref_id?: string;

  @IsString()
  @IsOptional()
  tax_id?: string;

  @IsInt()
  @IsOptional()
  taxRate?: number;

  @IsString()
  debtor_id: string;

  @IsString()
  @IsOptional()
  debtorName?: string;

  @IsString()
  customer_id: string;

  @IsString()
  @IsOptional()
  customerName?: string;

  @IsInt()
  @IsOptional()
  creditTerms?: number;

  @IsDate()
  @IsOptional()
  dueDate?: Date;

  @IsString()
  @IsOptional()
  sales_person_id?: string;

  @IsString()
  @IsOptional()
  salesPersonName?: string;

  @IsDecimal()
  @IsOptional()
  base_amount?: number;

  @IsDecimal()
  @IsOptional()
  dp_amount?: number;

  @IsDecimal()
  @IsOptional()
  discount_amount?: number;

  @IsDecimal()
  @IsOptional()
  total_discount?: number;

  @IsDecimal()
  @IsOptional()
  tax_amount?: number;

  @IsDecimal()
  @IsOptional()
  total_delivery_amount?: number;

  @IsDecimal()
  @IsOptional()
  total_amount?: number;

  @IsEnum(InvoicePaidStatusEnum)
  @IsOptional()
  paidStatus?: InvoicePaidStatusEnum;

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
