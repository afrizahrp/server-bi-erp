import { IsString, IsOptional, IsInt, IsDecimal } from 'class-validator';

export class responseSalesInvoiceItemDto {
  @IsString()
  invoice_id: string;

  @IsInt()
  line_no: number;

  @IsString()
  @IsOptional()
  acct_id: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  product_id: string;

  @IsString()
  @IsOptional()
  productName: string;

  @IsString()
  @IsOptional()
  uom_id: string;

  @IsDecimal()
  unitPrice?: number;

  @IsInt()
  qty: number;

  @IsDecimal()
  sellingPrice: number;

  @IsDecimal()
  base_amount: number;

  @IsDecimal()
  discount_amount?: number;

  @IsDecimal()
  tax_amount?: number;

  @IsDecimal()
  delivery_amount: number;

  @IsDecimal()
  total_amount?: number;
}
