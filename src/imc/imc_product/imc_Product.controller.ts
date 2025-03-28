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
import { Public } from 'src/auth/decorators/public.decorator';
import { Imc_ResponseProductDto } from './dto/imc_ResponseProducts.dto';
import { Imc_CreateProductDto } from './dto/imc_CreateProduct.dto';
import { Imc_UpdateProductDto } from './dto/imc_UpdateProducts.dto';
import { imc_ProductService } from './imc_Product.service';
import { Imc_PaginationProductDto } from './dto/imc_PaginationProduct.dto';

@Controller(':company_id/imc/products')
export class imc_ProductController {
  constructor(private readonly imc_productService: imc_ProductService) {}

  @Public()
  @Get()
  async findAll(
    @Param('company_id') company_id: string,
    @Query() paginationDto: Imc_PaginationProductDto,
  ): Promise<{ data: Imc_ResponseProductDto[]; totalRecords: number }> {
    return this.imc_productService.findAll(company_id, paginationDto);
  }

  @Public()
  @Get(':id')
  async findOne(
    @Param('company_id') company_id: string,
    @Param('id') id: string,
  ): Promise<Imc_ResponseProductDto> {
    return this.imc_productService.findOne(company_id, id);
  }

  @Public()
  @Get('search/:name')
  async findByName(
    @Param('company_id') company_id: string,
    @Param('name') name: string,
  ): Promise<Imc_ResponseProductDto[]> {
    return this.imc_productService.findByName(company_id, name);
  }

  @Public()
  @Post()
  async create(
    @Param('company_id') company_id: string,
    @Body() imc_CreateProductDto: Imc_CreateProductDto,
  ): Promise<Imc_ResponseProductDto> {
    imc_CreateProductDto.company_id = company_id;
    return this.imc_productService.create(imc_CreateProductDto);
  }

  @Public()
  @Put(':id')
  async update(
    @Param('company_id') company_id: string,
    @Param('id') id: string,
    @Body() imc_UpdateProductDto: Imc_UpdateProductDto,
  ): Promise<Imc_ResponseProductDto> {
    return this.imc_productService.update(id, company_id, imc_UpdateProductDto);
  }
}
