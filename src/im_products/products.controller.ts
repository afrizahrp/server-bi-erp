import { Controller, Get, Post, Body, Param, Put, Query } from '@nestjs/common';

import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/createProduct.dto';
import { UpdateProductDto } from './dto/updateProduct.dto';
import { ResponseProductDto } from './dto/responseProduct.dto';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  async create(
    @Body() createProductDto: CreateProductDto,
  ): Promise<ResponseProductDto> {
    return this.productsService.create(createProductDto);
  }

  @Get()
  async findAll(
    @Query('company_id') company_id: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ): Promise<ResponseProductDto[]> {
    return this.productsService.findAll(company_id, page, limit);
  }

  @Get(':company_id/:id')
  async findOne(
    @Param('company_id') company_id: string,
    @Param('id') id: string,
  ): Promise<ResponseProductDto> {
    return this.productsService.findOne(company_id, id);
  }

  @Put(':company_id/:id')
  async update(
    @Param('company_id') company_id: string,
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
  ): Promise<ResponseProductDto> {
    return this.productsService.update(id, company_id, updateProductDto);
  }
}
