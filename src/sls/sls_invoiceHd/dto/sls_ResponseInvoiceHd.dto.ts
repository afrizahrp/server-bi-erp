import {
  IsString,
  IsOptional,
  IsInt,
  IsNumber,
  IsDate,
  IsEnum,
  IsDecimal,
} from 'class-validator';

export class sls_ResponseInvoiceHdDto {
  @IsString()
  @IsOptional()
  po_id?: string;

  @IsInt()
  @IsOptional()
  invoiceType_id?: number;

  @IsInt()
  @IsOptional()
  poType_id?: number;

  @IsString()
  @IsOptional()
  invoiceType?: string;

  @IsString()
  @IsOptional()
  poType?: string;

  @IsString()
  @IsOptional()
  ecatalog_id?: string;

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
  @IsOptional()
  debtor_id?: string;

  @IsString()
  @IsOptional()
  debtorName?: string;

  @IsString()
  @IsOptional()
  customer_id?: string;

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
  salesPerson_id?: string;

  @IsString()
  @IsOptional()
  salesPersonName?: string;

  @IsNumber()
  @IsOptional()
  base_amount?: number;

  @IsNumber()
  @IsOptional()
  dp_amount?: number;

  @IsNumber()
  @IsOptional()
  discount_amount?: number;

  @IsNumber()
  @IsOptional()
  totalDiscount_amount?: number;

  @IsNumber()
  @IsOptional()
  tax_amount?: number;

  @IsNumber()
  @IsOptional()
  totalDelivery_amount?: number;

  @IsNumber()
  @IsOptional()
  total_amount?: number;

  @IsInt()
  @IsOptional()
  paidStatus_id?: number;

  @IsString()
  @IsOptional()
  paidStatus?: string;

  @IsDecimal()
  @IsOptional()
  grandTotal_amount?: number;
}
