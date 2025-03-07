import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Public } from 'src/auth/decorators/public.decorator';
import { BillboardsService } from './billboards.service';
import { CreateBillboardDto } from './dto/createBillboard.dto';
import { UpdateBillboardDto } from './dto/updateBillboard.dto';
import { ResponseBillboardDto } from './dto/responseBillboard.dto';

@Controller(':company_id/cms/billboards')
export class BillboardsController {
  constructor(private readonly billboardsService: BillboardsService) {}

  @Public()
  @Post()
  async create(
    @Param('company_id') company_id: string,
    @Body() createBillboardDto: CreateBillboardDto,
  ): Promise<ResponseBillboardDto> {
    createBillboardDto.company_id = company_id;
    return this.billboardsService.create(createBillboardDto);
  }

  @Public()
  @Get()
  async findAll(
    @Param('company_id') company_id: string,
  ): Promise<ResponseBillboardDto[]> {
    return this.billboardsService.findAll(company_id);
  }

  @Public()
  @Get(':id')
  async findOne(
    @Param('company_id') company_id: string,
    @Param('id') id: number,
  ): Promise<ResponseBillboardDto> {
    return this.billboardsService.findOne(company_id, id);
  }

  @Public()
  @Put(':id')
  async update(
    @Param('company_id') company_id: string,
    @Param('id') id: number,
    @Body() updateBillboardDto: UpdateBillboardDto,
  ): Promise<ResponseBillboardDto> {
    updateBillboardDto.company_id = company_id;
    return this.billboardsService.update(id, company_id, updateBillboardDto);
  }

  @Public()
  @Delete(':id')
  async remove(
    @Param('company_id') company_id: string,
    @Param('id') id: number,
  ): Promise<void> {
    return this.billboardsService.remove(company_id, id);
  }
}
