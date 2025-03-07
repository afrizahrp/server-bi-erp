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
import { ResponseCmsProductDto } from './dto/responseCmsProduct.dto';
import { Public } from 'src/auth/decorators/public.decorator';

// import { UpdateProductDto } from './dto/updateProduct.dto';
// import { CreateProductDto } from './dto/createProduct.dto';

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
  @Get(':slug')
  async findBySlug(
    @Param('company_id') company_id: string,
    @Param('slug') slug: string,
  ): Promise<ResponseCmsProductDto> {
    return this.productsService.findBySlug(company_id, slug);
  }

  @Public()
  @Get('search/:name')
  async findByName(
    @Param('company_id') company_id: string,
    @Param('name') name: string,
  ): Promise<ResponseCmsProductDto[]> {
    return this.productsService.findByName(company_id, name);
  }
}
