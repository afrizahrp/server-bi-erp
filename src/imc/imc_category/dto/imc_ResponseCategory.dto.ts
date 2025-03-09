import { IsString, IsOptional } from 'class-validator';

export class Imc_ResponseCategoryDto {
  @IsString()
  id: string;

  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  slug?: string;

  @IsString()
  @IsOptional()
  imageURL?: string;
}
