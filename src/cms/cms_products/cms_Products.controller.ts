import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Cms_ResponseProductDto } from './dto/cms_ResponseProducts.dto';
import { Cms_CreateProductDto } from './dto/cms_CreateProduct.dto';
import { Cms_UpdateProductDto } from './dto/cms_UpdateProducts.dto';
import { cms_ProductsService } from './cms_Products.service';
import { Public } from 'src/auth/decorators/public.decorator';

@Controller(':company_id/cms/products')
export class cms_ProductsController {
  constructor(private readonly cms_productsService: cms_ProductsService) {}

  @Public()
  @Post()
  async create(
    @Param('company_id') company_id: string,
    @Body() cms_CreateProductDto: Cms_CreateProductDto,
  ): Promise<Cms_ResponseProductDto> {
    cms_CreateProductDto.company_id = company_id;
    return this.cms_productsService.create(cms_CreateProductDto);
  }

  @Public()
  @Get()
  async findAll(
    @Param('company_id') company_id: string,
    @Query('category_id') category_id: string,
  ): Promise<Cms_ResponseProductDto[]> {
    return this.cms_productsService.findAll(company_id, category_id);
  }

  @Public()
  @Get(':slug')
  async findBySlug(
    @Param('company_id') company_id: string,
    @Param('slug') slug: string,
  ): Promise<Cms_ResponseProductDto> {
    return this.cms_productsService.findBySlug(company_id, slug);
  }

  @Public()
  @Get('search/:name')
  async findByName(
    @Param('company_id') company_id: string,
    @Param('name') name: string,
  ): Promise<Cms_ResponseProductDto[]> {
    return this.cms_productsService.findByName(company_id, name);
  }

  @Public()
  @Put(':id')
  async update(
    @Param('company_id') company_id: string,
    @Param('id') id: string,
    @Body() cms_UpdateProductDto: Cms_UpdateProductDto,
  ): Promise<Cms_ResponseProductDto> {
    return this.cms_productsService.update(
      id,
      company_id,
      cms_UpdateProductDto,
    );
  }
}
