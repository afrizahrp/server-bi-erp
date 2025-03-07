import { Controller, Get, Post, Body, Param, Put, Query } from '@nestjs/common';

import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/createProduct.dto';
import { UpdateProductDto } from './dto/updateProduct.dto';
import { ResponseProductDto } from './dto/responseProduct.dto';
import { Public } from 'src/auth/decorators/public.decorator';

@Controller('cms/products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  async create(
    @Body() createProductDto: CreateProductDto,
  ): Promise<ResponseProductDto> {
    return this.productsService.create(createProductDto);
  }

  @Public()
  @Get(':company_id/:category_id')
  async findAll(
    @Param('company_id') company_id: string,
    @Param('category_id') category_id: string,
  ): Promise<ResponseProductDto[]> {
    return this.productsService.findAll(company_id, category_id);
  }

  @Get(':company_id/:id')
  @Public()
  async findOne(
    @Param('company_id') company_id: string,
    @Param('id') id: string,
  ): Promise<ResponseProductDto> {
    return this.productsService.findOne(company_id, id);
  }

  @Get(':company_id/slug/:slug')
  @Public()
  async findBySlug(
    @Param('company_id') company_id: string,
    @Param('slug') slug: string,
  ): Promise<any> {
    return this.productsService.findBySlug(company_id, slug);
  }

  @Get(':company_id/name/:name')
  @Public()
  async findByName(
    @Param('company_id') company_id: string,
    @Param('name') name: string,
  ): Promise<any> {
    return this.productsService.findByName(company_id, name);
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
