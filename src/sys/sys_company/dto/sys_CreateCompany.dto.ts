import { IsString, IsOptional, IsInt, IsDate, IsNumber } from 'class-validator';

export class Sys_CreateCompanyDto {
  @IsString()
  id: string;

  @IsNumber()
  seq_no: number;

  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  province?: string;

  @IsString()
  @IsOptional()
  district?: string;

  @IsString()
  @IsOptional()
  city?: string;

  @IsString()
  @IsOptional()
  address1?: string;

  @IsString()
  @IsOptional()
  address2?: string;

  @IsString()
  @IsOptional()
  address3?: string;

  @IsString()
  @IsOptional()
  postalCode?: string;

  @IsString()
  @IsOptional()
  phone1?: string;

  @IsString()
  @IsOptional()
  phone2?: string;

  @IsString()
  @IsOptional()
  phone3?: string;

  @IsString()
  @IsOptional()
  mobile1?: string;

  @IsString()
  @IsOptional()
  mobile2?: string;

  @IsString()
  @IsOptional()
  mobile3?: string;

  @IsString()
  @IsOptional()
  email1?: string;

  @IsString()
  @IsOptional()
  email2?: string;

  @IsString()
  @IsOptional()
  email3?: string;

  @IsString()
  @IsOptional()
  officialWebsite?: string;

  @IsString()
  @IsOptional()
  createdBy?: string;

  @IsDate()
  createdAt: Date;

  @IsString()
  @IsOptional()
  updatedBy?: string;

  @IsDate()
  updatedAt: Date;
}
