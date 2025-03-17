import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Patch,
  Delete,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { Public } from 'src/auth/decorators/public.decorator';
import { Cms_CreateBillboardDto } from './dto/cms_CreateBillboard.dto';
import { Cms_UpdateBillboardDto } from './dto/cms_UpdateBillboard.dto';
import { Cms_ResponseBillboardDto } from './dto/cms_ResponseBillboard.dto';
import { cms_BillboardService } from './cms_Billboard.service';
import { Cms_PaginationBillboardDto } from './dto/cms_PaginationBillboard.dto';

@Controller(':company_id/cms/billboards')
export class cms_BillboardController {
  constructor(private readonly cms_billboardService: cms_BillboardService) {}

  @Public()
  @Post()
  async create(
    @Param('company_id') company_id: string,
    @Body() cms_CreateBillboardDto: Cms_CreateBillboardDto,
  ): Promise<Cms_ResponseBillboardDto> {
    cms_CreateBillboardDto.company_id = company_id;
    return this.cms_billboardService.create(cms_CreateBillboardDto);
  }

  @Public()
  @Get()
  async getShowedBillboard(
    @Param('company_id') company_id: string,
  ): Promise<Cms_ResponseBillboardDto[]> {
    return this.cms_billboardService.getShowedBillboard(company_id);
  }

  @Public()
  @Get('all')
  async findAll(
    @Param('company_id') company_id: string,
    @Param('module_id') module_id: string,
    @Query() paginationDto: Cms_PaginationBillboardDto,
  ): Promise<{ data: Cms_ResponseBillboardDto[]; totalRecords: number }> {
    return this.cms_billboardService.findAll(
      company_id,
      module_id,
      paginationDto,
    );
  }

  @Public()
  @Get(':id')
  async findOne(
    @Param('company_id') company_id: string,
    @Param('id') id: string,
  ): Promise<Cms_ResponseBillboardDto> {
    return this.cms_billboardService.findOne(company_id, id);
  }

  @Public()
  @Patch(':id')
  async update(
    @Param('company_id') company_id: string,
    @Param('id') id: number,
    @Body() cms_UpdateBillboardDto: Cms_UpdateBillboardDto,
  ): Promise<Cms_ResponseBillboardDto> {
    cms_UpdateBillboardDto.company_id = company_id;
    return this.cms_billboardService.update(
      id,
      company_id,
      cms_UpdateBillboardDto,
    );
  }

  @Public()
  @Delete(':id')
  async remove(
    @Param('company_id') company_id: string,
    @Param('id') id: number,
  ): Promise<void> {
    return this.cms_billboardService.remove(company_id, id);
  }
}
