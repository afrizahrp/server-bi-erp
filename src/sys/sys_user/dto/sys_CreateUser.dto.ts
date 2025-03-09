import {
  IsString,
  IsEmail,
  IsBoolean,
  IsOptional,
  IsNumber,
  IsEnum,
} from 'class-validator';
import { MasterRecordStatusEnum } from '@prisma/client';

export class Sys_CreateUserDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  password: string;

  @IsString()
  @IsOptional()
  image?: string;

  @IsEnum(MasterRecordStatusEnum)
  iStatus: MasterRecordStatusEnum;

  @IsBoolean()
  @IsOptional()
  isAdmin: boolean;

  @IsString()
  @IsOptional()
  hashedRefreshToken?: string;
}
