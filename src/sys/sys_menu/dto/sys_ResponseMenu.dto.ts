import {
  IsString,
  IsOptional,
  IsInt,
  IsBoolean,
  IsDate,
  IsEnum,
} from 'class-validator';
import { MasterRecordStatusEnum } from '@prisma/client';

export class Sys_ResponseMenuDto {
  id: number;
  parent_id: number | null;
  menu_description: string;
  href: string | null;
  module_id: string;
  menu_type: string | null;
  has_child: boolean;
  icon: string | null;
  // iStatus: MasterRecordStatusEnum;
  createdBy: string | null;
  createdAt: Date;
  updatedBy: string | null;
  updatedAt: Date | null;
  company_id: string;
  branch_id: string;
  child?: Sys_ResponseMenuDto[]; // Tambahkan field child untuk nested menu
}

//   @IsInt()
//   id: number;

//   @IsInt()
//   @IsOptional()
//   parent_id?: number | null;

//   @IsString()
//   menu_description: string;

//   @IsString()
//   @IsOptional()
//   href?: string | null;

//   @IsString()
//   module_id: string;

//   @IsString()
//   @IsOptional()
//   menu_type?: string;

//   @IsBoolean()
//   @IsOptional()
//   has_child?: boolean;

//   @IsString()
//   @IsOptional()
//   icon?: string;

//   @IsEnum(MasterRecordStatusEnum)
//   iStatus: MasterRecordStatusEnum;

//   @IsString()
//   @IsOptional()
//   createdBy?: string;

//   @IsDate()
//   createdAt: Date;

//   @IsString()
//   @IsOptional()
//   updatedBy?: string;

//   @IsDate()
//   @IsOptional()
//   updatedAt?: Date;

//   @IsString()
//   company_id: string;

//   @IsString()
//   branch_id: string;

//   child?: Sys_ResponseMenuDto[];
// }
