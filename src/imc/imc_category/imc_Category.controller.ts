import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Patch,
  BadRequestException,
} from '@nestjs/common';
import { Imc_ResponseCategoryDto } from './dto/imc_ResponseCategory.dto';
import { Imc_CreateCategoryDto } from './dto/imc_CreateCategory.dto';
import { Imc_UpdateCategoryDto } from './dto/imc_UpdateCategory.dto';
import { imc_CategoryService } from './imc_Category.service';
import { Public } from 'src/auth/decorators/public.decorator';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Imc_PaginationCategoryDto } from './dto/imc_PaginationCategory.dto';
import { Imc_SearchCategoryDto } from './dto/imc_SeachCategory.dto';

@Controller(':company_id/:module_id/get-categories')
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
    @Param('module_id') module_id: string,
    @Query('status') status: string | string[], // ✅ Pastikan bisa menerima array atau string
    @Query('categoryType') categoryType: string | string[], // ✅ Pastikan bisa menerima array atau string
    @Query() paginationDto: Imc_PaginationCategoryDto,
  ): Promise<{ data: Imc_ResponseCategoryDto[]; totalRecords: number }> {
    return this.imc_categoryService.findAll(
      company_id,
      module_id,
      paginationDto,
    );
  }

  @Public()
  @Get('statuses')
  async getCategoryStatuses(
    @Param('company_id') company_id: string,
    @Param('module_id') module_id: string,
    @Query('categoryType') categoryType?: string,
  ) {
    const rawData = await this.imc_categoryService.findAllStatuses(
      company_id,
      module_id,
      categoryType, // Kirim filter categoryType jika ada
    );

    return { data: rawData ?? [] };
  }

  @Public()
  @Get('types')
  async getCategoryTypes(
    @Param('company_id') company_id: string,
    @Param('module_id') module_id: string,
    @Query('types') categoryType?: string,
    @Query('status') status?: string,
  ) {
    const rawData = await this.imc_categoryService.findAllCategoryType(
      company_id,
      module_id,
      { categoryType, status },
    );

    return { data: rawData ?? [] };
  }

  // @Public()
  // @Get('search')
  // async findBySearch(
  //   @Param('company_id') company_id: string,
  //   @Query('searchBy') searchBy: string,
  //   @Query('searchTerm') searchTerm: string,
  //   // @Query() paginationDto: Imc_PaginationCategoryDto,
  //   @Query() query: Imc_SearchCategoryDto,
  // ): Promise<{ data: any[]; totalRecords: number }> {
  //   if (!searchTerm) {
  //     throw new BadRequestException('Search parameter is required.');
  //   }
  //   return this.imc_categoryService.findBySearch(
  //     company_id,
  //     searchBy,
  //     searchTerm,
  //   );
  // }

  @Public()
  @Get('search')
  async findByName(
    @Param('company_id') company_id: string,
    @Query('name') name: string,
    @Query() paginationDto: Imc_PaginationCategoryDto,
  ): Promise<{ data: any[]; totalRecords: number }> {
    if (!name) {
      throw new BadRequestException('Name parameter is required.');
    }
    return this.imc_categoryService.findByName(company_id, name, paginationDto);
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
  @Patch(':company_id/:id')
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
