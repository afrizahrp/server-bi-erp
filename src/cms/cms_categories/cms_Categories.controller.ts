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
import { cms_CategoriesService } from './cms_Categories.service';
import { Cms_ResponseCategoryDto } from './dto/cms_ResponseCategory.dto';
import { Cms_CreateCategoryDto } from './dto/cms_CreateCategory.dto';
import { Cms_UpdateCategoryDto } from './dto/cms_UpdateCategory.dto';
import { Public } from 'src/auth/decorators/public.decorator';

@Controller(':company_id/cms/categories')
export class cms_CategoriesController {
  constructor(private readonly categoryService: cms_CategoriesService) {}

  @Public()
  @Post()
  async create(
    @Param('company_id') company_id: string,
    @Body() createCategoryDto: Cms_CreateCategoryDto,
  ): Promise<Cms_ResponseCategoryDto> {
    createCategoryDto.company_id = company_id;
    return this.categoryService.create(createCategoryDto);
  }

  @Public()
  @Get()
  async findAll(
    @Query('company_id') company_id: string,
  ): Promise<{ data: Cms_ResponseCategoryDto[] }> {
    return this.categoryService.findAll(company_id);
  }

  @Public()
  @Get(':slug')
  async findBySlug(
    @Param('company_id') company_id: string,
    @Param('slug') slug: string,
  ): Promise<Cms_ResponseCategoryDto> {
    return this.categoryService.findBySlug(company_id, slug);
  }

  @Public()
  @Put(':id')
  async update(
    @Param('company_id') company_id: string,
    @Param('id') id: string,
    @Body() updateCategoryDto: Cms_UpdateCategoryDto,
  ): Promise<Cms_ResponseCategoryDto> {
    return this.categoryService.update(id, company_id, updateCategoryDto);
  }
}
