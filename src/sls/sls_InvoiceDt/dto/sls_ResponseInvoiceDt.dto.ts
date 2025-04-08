import { IsString, IsOptional, IsInt, IsDecimal } from 'class-validator';

export class sls_ResponseInvoiceDtDto {
  @IsString()
  id: string;

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
  product_name: string;

  @IsString()
  @IsOptional()
  uom_id: string;

  @IsDecimal()
  unit_price?: number;

  @IsInt()
  qty?: number;

  @IsDecimal()
  selling_price?: number;

  @IsDecimal()
  base_amt?: number;

  @IsDecimal()
  discount_amt?: number;

  @IsDecimal()
  tax_amt?: number;

  @IsDecimal()
  delivery_amt?: number;

  @IsDecimal()
  total_amt?: number;
}
