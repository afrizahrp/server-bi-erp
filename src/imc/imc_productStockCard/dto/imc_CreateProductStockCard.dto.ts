import {
  IsString,
  IsOptional,
  IsInt,
  IsDecimal,
  IsDate,
  IsEnum,
} from 'class-validator';
import { MasterRecordStatusEnum } from '@prisma/client';

export class Imc_CreateProductStockCardDto {
  @IsString()
  customer_or_supplier_id: string;

  @IsString()
  trx_id: string;

  @IsString()
  trx_class: string;

  @IsString()
  module_id: string;

  @IsString()
  is_in_or_out: string;

  @IsInt()
  doc_year: number;

  @IsInt()
  doc_month: number;

  @IsDate()
  doc_date: Date;

  @IsString()
  doc_id: string;

  @IsString()
  @IsOptional()
  descs?: string;

  @IsString()
  mutation_id: string;

  @IsDate()
  mutation_date: Date;

  @IsString()
  ref_id: string;

  @IsDate()
  ref_date: Date;

  @IsEnum(MasterRecordStatusEnum)
  iStatus: MasterRecordStatusEnum;

  @IsString()
  warehouse_id: string;

  @IsString()
  to_warehouse_id: string;

  @IsInt()
  srn_seq: number;

  @IsString()
  product_id: string;

  @IsDecimal()
  qty: number;

  @IsDecimal()
  mutation_qty: number;

  @IsDecimal()
  @IsOptional()
  unit_cost?: number;

  @IsDecimal()
  @IsOptional()
  mutation_cost?: number;

  @IsString()
  floor_id: string;

  @IsString()
  shelf_id: string;

  @IsString()
  row_id: string;

  @IsString()
  batch_no: string;

  @IsString()
  mExpired_dt: string;

  @IsString()
  yExpired_dt: string;

  @IsString()
  @IsOptional()
  product_cd?: string;

  @IsInt()
  @IsOptional()
  i_month_expired?: number;

  @IsInt()
  @IsOptional()
  i_year_expired?: number;

  @IsDecimal()
  @IsOptional()
  selling_price?: number;

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
