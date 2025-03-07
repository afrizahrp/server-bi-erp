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
import { ResponseCategoryDto } from './dto/responseCategory.dto';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Public } from 'src/auth/decorators/public.decorator';

@Controller('cms/categories')
export class CategoriesController {
  constructor(private readonly categoryService: CategoriesService) {}

  // @Roles(1, 3)
  @Public()
  @Get()
  async findAll(
    @Query('company_id') company_id: string,
  ): Promise<{ data: ResponseCategoryDto[] }> {
    return this.categoryService.findAll(company_id);
  }

  @Public()
  @Get(':company_id/:id')
  async findOne(
    @Param('company_id') company_id: string,
    @Param('id') id: string,
  ): Promise<ResponseCategoryDto> {
    return this.categoryService.findOne(company_id, id);
  }

  @Get(':company_id/slug/:slug')
  @Public()
  async findBySlug(
    @Param('company_id') company_id: string,
    @Param('slug') slug: string,
  ): Promise<any> {
    return this.categoryService.findBySlug(company_id, slug);
  }
}
