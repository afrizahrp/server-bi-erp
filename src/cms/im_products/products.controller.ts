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
import { ProductsService } from './products.service';
import { UpdateProductDto } from './dto/updateProduct.dto';
import { CreateProductDto } from './dto/createProduct.dto';
import { ResponseCmsProductDto } from './dto/responseCmsProduct.dto';
import { Public } from 'src/auth/decorators/public.decorator';

@Controller(':company_id/cms/products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Public()
  @Get()
  async findAll(
    @Param('company_id') company_id: string,
    @Query('category_id') category_id: string,
  ): Promise<ResponseCmsProductDto[]> {
    return this.productsService.findAll(company_id, category_id);
  }

  @Public()
  @Get(':id')
  async findOne(
    @Param('company_id') company_id: string,
    @Param('id') id: string,
  ): Promise<ResponseCmsProductDto> {
    return this.productsService.findOne(company_id, id);
  }

  @Public()
  @Get('slug/:slug')
  async findBySlug(
    @Param('company_id') company_id: string,
    @Param('slug') slug: string,
  ): Promise<ResponseCmsProductDto> {
    return this.productsService.findBySlug(company_id, slug);
  }

  @Public()
  @Get('name/:name')
  async findByName(
    @Param('company_id') company_id: string,
    @Param('name') name: string,
  ): Promise<ResponseCmsProductDto> {
    return this.productsService.findByName(company_id, name);
  }
}
