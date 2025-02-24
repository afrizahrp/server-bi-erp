import {
  IsString,
  IsEmail,
  IsBoolean,
  IsOptional,
  IsNumber,
} from 'class-validator';

export class CreateUserDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  password: string;

  @IsOptional()
  @IsNumber()
  role_id: string;

  @IsString()
  @IsOptional()
  image?: string;

  @IsNumber()
  iStatus: number = 1;

  @IsBoolean()
  @IsOptional()
  isAuthorized?: boolean;

  @IsString()
  @IsOptional()
  hashedRefreshToken?: string;
}
