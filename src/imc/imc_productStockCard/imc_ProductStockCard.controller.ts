import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  Query,
} from '@nestjs/common';
import { imc_ProductStockCardService } from './imc_ProductStockCard.service';
import { Imc_CreateProductStockCardDto } from './dto/imc_CreateProductStockCard.dto';
import { Public } from 'src/auth/decorators/public.decorator';
import { Imc_PaginationProductStockCardDto } from './dto/imc_PaginationProductStockCard.dto';
import { Imc_ResponseProductStockCardDto } from './dto/imc_ResponseProductStockCard.dto';

@Controller(':company_id/imc/product-stock-card')
export class imc_ProductStockCardController {
  constructor(private readonly service: imc_ProductStockCardService) {}

  @Post()
  async create(@Body() createDto: Imc_CreateProductStockCardDto): Promise<any> {
    return this.service.create(createDto);
  }

  @Public()
  @Get()
  async findAll(
    @Param('company_id') company_id: string,
    @Query() paginationDto: Imc_PaginationProductStockCardDto,
  ): Promise<{
    data: Imc_ResponseProductStockCardDto[];
    totalRecords: number;
  }> {
    return this.service.findAll(company_id, paginationDto);
  }

  @Get(':product_id/:doc_id')
  async findOne(
    @Param('company_id') company_id: string,
    @Param('product_id') product_id: string,
    @Param('doc_id') doc_id: string,
  ): Promise<any> {
    return this.service.findOne(company_id, product_id, doc_id);
  }
}
