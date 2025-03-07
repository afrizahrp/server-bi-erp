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
import { CategoriesService } from './categories.service';
import { UpdateCategoryDto } from './dto/updateCategory.dto';
import { CreateCategoryDto } from './dto/createCategory.dto';
import { ResponseCmsCategoryDto } from './dto/responseCmsCategory.dto';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Public } from 'src/auth/decorators/public.decorator';
import { PaginationDto } from './dto/pagination.dto';

@Controller(':company_id/cms/categories')
export class CategoriesController {
  constructor(private readonly categoryService: CategoriesService) {}

  // @Roles(1, 3)
  @Public()
  @Get()
  async findAll(
    @Query('company_id') company_id: string,
    @Query() paginationDto: PaginationDto,
  ): Promise<{ data: ResponseCmsCategoryDto[] }> {
    return this.categoryService.findAll(company_id, paginationDto);
  }

  @Public()
  @Get(':id')
  async findOne(
    @Param('company_id') company_id: string,
    @Param('id') id: string,
  ): Promise<ResponseCmsCategoryDto> {
    return this.categoryService.findOne(company_id, id);
  }

  @Public()
  @Get('slug/:slug')
  async findBySlug(
    @Param('company_id') company_id: string,
    @Param('slug') slug: string,
  ): Promise<ResponseCmsCategoryDto> {
    return this.categoryService.findBySlug(company_id, slug);
  }
}
