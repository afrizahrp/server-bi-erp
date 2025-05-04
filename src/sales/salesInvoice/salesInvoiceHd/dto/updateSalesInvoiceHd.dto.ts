import {
  IsString,
  IsOptional,
  IsInt,
  IsDecimal,
  IsDate,
} from 'class-validator';

export class updateSalesInvoiceHdDto {
  @IsString()
  id: string;

  @IsInt()
  line_no: number;

  @IsString()
  acct_id: string;

  @IsString()
  product_id: string;

  @IsString()
  uom_id: string;

  @IsString()
  @IsOptional()
  po_no?: string;

  @IsString()
  @IsOptional()
  ecat_no?: string;

  @IsString()
  @IsOptional()
  so_no?: string;

  @IsString()
  @IsOptional()
  spk_id?: string;

  @IsString()
  @IsOptional()
  delivery_id?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  product_name?: string;

  @IsDecimal()
  @IsOptional()
  unit_price?: number;

  @IsDecimal()
  @IsOptional()
  qty?: number;

  @IsDecimal()
  @IsOptional()
  selling_price?: number;

  @IsDecimal()
  @IsOptional()
  base_amt?: number;

  @IsDecimal()
  @IsOptional()
  discount_amt?: number;

  @IsDecimal()
  @IsOptional()
  tax_amt?: number;

  @IsDecimal()
  @IsOptional()
  delivery_amt?: number;

  @IsDecimal()
  @IsOptional()
  total_amt?: number;

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
