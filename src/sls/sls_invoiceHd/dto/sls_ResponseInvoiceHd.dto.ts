import {
  IsString,
  IsOptional,
  IsInt,
  IsDecimal,
  IsDate,
  IsEnum,
} from 'class-validator';
import { InvoicePaidStatusEnum } from '@prisma/client';

export class sls_ResponseInvoiceHdDto {
  @IsString()
  @IsOptional()
  po_id?: string;

  @IsInt()
  @IsOptional()
  invoiceType_id: number; // Tambahkan properti ini

  @IsInt()
  @IsOptional()
  poType_id: number;

  @IsOptional()
  @IsString()
  invoiceTypeName?: string; // Tambahkan properti ini

  @IsOptional()
  @IsString()
  invoicePoTypeName?: string; // Tambahkan properti ini

  @IsString()
  @IsOptional()
  eCatalog_id?: string; // Tambahkan properti ini

  @IsString()
  invoice_id: string;

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

  @IsEnum(InvoicePaidStatusEnum)
  paidStatus: InvoicePaidStatusEnum;

  @IsString()
  @IsOptional()
  monthYear?: string;
}
