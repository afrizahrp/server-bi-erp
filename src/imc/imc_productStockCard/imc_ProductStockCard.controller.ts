import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
} from '@nestjs/common';
import { imc_ProductStockCardService } from './imc_ProductStockCard.service';
import { Imc_CreateProductStockCardDto } from './dto/imc_CreateProductStockCard.dto';
import { Public } from 'src/auth/decorators/public.decorator';

@Controller(':company_id/imc/product-stock-card')
export class imc_ProductStockCardController {
  constructor(private readonly service: imc_ProductStockCardService) {}

  @Post()
  async create(@Body() createDto: Imc_CreateProductStockCardDto): Promise<any> {
    return this.service.create(createDto);
  }

  @Public()
  @Get()
  async findAll(): Promise<any[]> {
    return this.service.findAll();
  }

  @Get(':product_id/:doc_id')
  async findOne(
    @Param('product_id') product_id: string,
    @Param('doc_id') doc_id: string,
  ): Promise<any> {
    return this.service.findOne(product_id, doc_id);
  }
}
