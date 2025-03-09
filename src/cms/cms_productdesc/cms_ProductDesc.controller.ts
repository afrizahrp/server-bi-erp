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
import { cms_ProductDescService } from './cms_ProductDesc.service';
import { Cms_ResponseProductDescDto } from './dto/cms_ResponseProductDesc.dto';
import { Cms_CreateProductDescDto } from './dto/cms_CreateProductDesc.dto';
import { Cms_UpdateProductDescDto } from './dto/cms_UpdateProductDesc.dto';
import { Public } from 'src/auth/decorators/public.decorator';

@Controller(':company_id/cms/productdescs')
export class cms_ProductDescController {
  constructor(
    private readonly cms_productDescService: cms_ProductDescService,
  ) {}

  @Public()
  @Post()
  async create(
    @Param('company_id') company_id: string,
    @Body() cms_CreateProductDescsDto: Cms_CreateProductDescDto,
  ): Promise<Cms_ResponseProductDescDto> {
    cms_CreateProductDescsDto.company_id = company_id;
    return this.cms_productDescService.create(cms_CreateProductDescsDto);
  }

  @Public()
  @Get()
  async findAll(
    @Param('company_id') company_id: string,
  ): Promise<Cms_ResponseProductDescDto[]> {
    return this.cms_productDescService.findAll(company_id);
  }

  @Public()
  @Get(':id')
  async findOne(
    @Param('company_id') company_id: string,
    @Param('id') id: string,
  ): Promise<Cms_ResponseProductDescDto> {
    return this.cms_productDescService.findOne(company_id, id);
  }

  @Public()
  @Put(':id')
  async update(
    @Param('company_id') company_id: string,
    @Param('id') id: string,
    @Body() cms_UpdateProductDescsDto: Cms_UpdateProductDescDto,
  ): Promise<Cms_ResponseProductDescDto> {
    return this.cms_productDescService.update(
      id,
      company_id,
      cms_UpdateProductDescsDto,
    );
  }
}
