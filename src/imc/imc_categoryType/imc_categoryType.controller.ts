import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Patch,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { Public } from 'src/auth/decorators/public.decorator';
import { imc_CategoryTypeService } from './imc_categoryType.service';
import { Imc_CreateCategoryTypeDto } from './dto/imc_CreateCategoryType.dto';
import { Imc_UpdateCategoryTypeDto } from './dto/imc_UpdateCategoryType.dto';
import { Imc_ResponseCategoryTypeDto } from './dto/imc_ResponseCategoryType.dto';
import { Imc_PaginationCategoryTypeDto } from './dto/imc_PaginationCategoryType.dto';

@Controller(':company_id/:module_id/get-categoryType')
export class imc_CategoryTypeController {
  constructor(
    private readonly imc_categoryTypeService: imc_CategoryTypeService,
  ) {}

  @Post()
  async create(
    @Body() imc_CreateCategoryTypeDto: Imc_CreateCategoryTypeDto,
  ): Promise<Imc_ResponseCategoryTypeDto> {
    return this.imc_categoryTypeService.create(imc_CreateCategoryTypeDto);
  }

  @Public()
  @Get()
  async findAll(
    @Param('company_id') company_id: string,
    @Param('module_id') module_id: string,
    @Query() paginationDto: Imc_PaginationCategoryTypeDto,
  ): Promise<{ data: Imc_ResponseCategoryTypeDto[]; totalRecords: number }> {
    return this.imc_categoryTypeService.findAll(
      company_id,
      module_id,
      paginationDto,
    );
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<Imc_ResponseCategoryTypeDto> {
    return this.imc_categoryTypeService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() imc_UpdateCategoryTypeDto: Imc_UpdateCategoryTypeDto,
  ): Promise<Imc_ResponseCategoryTypeDto> {
    return this.imc_categoryTypeService.update(id, imc_UpdateCategoryTypeDto);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.imc_categoryTypeService.remove(id);
  }
}
