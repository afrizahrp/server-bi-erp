import { PartialType } from '@nestjs/mapped-types';
import { Imc_CreateProductStockCardDto } from './imc_CreateProductStockCard.dto';

export class Imc_UpdateProductStockCardDto extends PartialType(
  Imc_CreateProductStockCardDto,
) {}
