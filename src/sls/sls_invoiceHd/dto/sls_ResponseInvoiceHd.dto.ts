import {
  IsString,
  IsOptional,
  IsInt,
  IsDecimal,
  IsDate,
  IsEnum,
} from 'class-validator';
import { InvoicePaidStatusEnum, InvoiceTypeEnum } from '@prisma/client';

export class sls_ResponseInvoiceHdDto {
  @IsString()
  invoice_id: string;

  @IsString()
  @IsOptional()
  po_id?: string;

  @IsDate()
  invoiceDate: Date;

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
  creditTerms?: number;

  @IsDate()
  @IsOptional()
  dueDate?: Date;

  @IsString()
  @IsOptional()
  salesPerson_id?: string;

  @IsString()
  @IsOptional()
  salesPersonName?: string;

  @IsInt()
  base_amount?: number;

  @IsInt()
  dp_amount?: number;

  @IsInt()
  discount_amount?: number;
  @IsInt()
  totalDiscount_amount?: number;
  @IsInt()
  tax_amount?: number;
  @IsInt()
  totalDelivery_amount?: number;
  @IsInt()
  total_amount?: number;

  @IsEnum(InvoiceTypeEnum)
  invoiceType: InvoiceTypeEnum;

  @IsEnum(InvoicePaidStatusEnum)
  paidStatus: InvoicePaidStatusEnum;
}
