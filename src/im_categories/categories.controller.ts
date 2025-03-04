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
import { ResponseCategorytDto } from './dto/responseCategory.dto';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Public } from 'src/auth/decorators/public.decorator';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoryService: CategoriesService) {}

  @Post()
  create(
    @Body() createCategoryDto: CreateCategoryDto,
  ): Promise<ResponseCategorytDto> {
    return this.categoryService.create(createCategoryDto);
  }

  // @Roles(1, 3)
  @Public()
  @Get()
  async findAll(
    @Query('company_id') company_id: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ): Promise<{ data: ResponseCategorytDto[]; total: number }> {
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);
    return this.categoryService.findAll(company_id, pageNumber, limitNumber);
  }

  @Get(':company_id/:id')
  async findOne(
    @Param('company_id') company_id: string,
    @Param('id') id: string,
  ): Promise<ResponseCategorytDto> {
    return this.categoryService.findOne(company_id, id);
  }

  @Put(':company_id/:id')
  async update(
    @Param('company_id') company_id: string,
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ): Promise<ResponseCategorytDto> {
    return this.categoryService.update(id, company_id, updateCategoryDto);
  }
}
