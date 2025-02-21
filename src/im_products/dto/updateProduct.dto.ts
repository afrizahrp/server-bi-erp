// src/products/dto/update-product.dto.ts
import {
  IsString,
  IsOptional,
  IsInt,
  IsBoolean,
  IsDate,
} from 'class-validator';

export class UpdateProductDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  register_id?: string;

  @IsString()
  @IsOptional()
  catalog_id?: string;

  @IsString()
  @IsOptional()
  category_id?: string;

  @IsString()
  @IsOptional()
  subCategory_id?: string;

  @IsString()
  @IsOptional()
  brand_id?: string;

  @IsInt()
  @IsOptional()
  iStatus?: number;

  @IsString()
  @IsOptional()
  slug?: string;

  @IsBoolean()
  @IsOptional()
  isMaterial?: boolean;

  @IsBoolean()
  @IsOptional()
  isService?: boolean;

  @IsBoolean()
  @IsOptional()
  isFinishing?: boolean;

  @IsBoolean()
  @IsOptional()
  isAccessories?: boolean;

  @IsBoolean()
  @IsOptional()
  iShowedStatus?: boolean;

  @IsString()
  @IsOptional()
  uom_id?: string;

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
  company_id?: string;

  @IsString()
  @IsOptional()
  branch_id?: string;
}
