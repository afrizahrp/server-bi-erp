// src/products/dto/create-product.dto.ts
import {
  IsString,
  IsOptional,
  IsInt,
  IsBoolean,
  IsDate,
  IsNumber,
  isString,
} from 'class-validator';

export class CreateProductDto {
  @IsString()
  id: string;

  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  register_id?: string;

  @IsString()
  @IsOptional()
  catalog_id?: string;

  @IsString()
  category_id: string;

  @IsString()
  subCategory_id: string;

  @IsString()
  brand_id: string;

  @IsInt()
  iStatus: number;

  @IsString()
  @IsOptional()
  slug?: string;

  @IsBoolean()
  isService?: boolean;

  @IsBoolean()
  isMaterial?: boolean;

  @IsBoolean()
  isFinishing?: boolean;
  @IsBoolean()
  isAccessories?: boolean;

  @IsBoolean()
  iShowedStatus?: boolean;

  @IsString()
  @IsOptional()
  uom_id: string;

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
  updatedAt: Date;

  @IsString()
  company_id: string;

  @IsString()
  branch_id: string;
}
