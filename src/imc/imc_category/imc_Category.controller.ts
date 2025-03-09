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
import { Imc_ResponseCategoryDto } from './dto/imc_ResponseCategory.dto';
import { Imc_CreateCategoryDto } from './dto/imc_CreateCategory.dto';
import { Imc_UpdateCategoryDto } from './dto/imc_UpdateCategory.dto';
import { imc_CategoryService } from './imc_Category.service';
import { Public } from 'src/auth/decorators/public.decorator';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Imc_PaginationCategoryDto } from './dto/imc_PaginationCategory.dto';

@Controller(':company_id/imc/categories')
export class imc_CategoryController {
  constructor(private readonly imc_categoryService: imc_CategoryService) {}

  @Roles('ADMIN')
  @Post()
  async create(
    @Param('company_id') company_id: string,
    @Body() imc_CreateCategoryDto: Imc_CreateCategoryDto,
  ): Promise<Imc_ResponseCategoryDto> {
    imc_CreateCategoryDto.company_id = company_id;
    return this.imc_categoryService.create(imc_CreateCategoryDto);
  }

  @Public()
  @Get()
  async findAll(
    @Param('company_id') company_id: string,
    @Query() paginationDto: Imc_PaginationCategoryDto,
  ): Promise<{ data: Imc_ResponseCategoryDto[]; totalRecords: number }> {
    return this.imc_categoryService.findAll(company_id, paginationDto);
  }

  @Public()
  @Get(':id')
  async findByid(
    @Param('company_id') company_id: string,
    @Param('id') id: string,
  ): Promise<Imc_ResponseCategoryDto> {
    return this.imc_categoryService.findOne(company_id, id);
  }

  @Public()
  @Put(':id')
  async update(
    @Param('company_id') company_id: string,
    @Param('id') id: string,
    @Body() imc_UpdateCategoryDto: Imc_UpdateCategoryDto,
  ): Promise<Imc_ResponseCategoryDto> {
    return this.imc_categoryService.update(
      id,
      company_id,
      imc_UpdateCategoryDto,
    );
  }
}
