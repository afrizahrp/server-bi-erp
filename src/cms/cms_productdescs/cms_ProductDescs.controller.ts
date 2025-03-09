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
import { cms_ProductDescsService } from './cms_ProductDescs.service';
import { Cms_ResponseProductDescsDto } from './dto/cms_ResponseProductDescs.dto';
import { Cms_CreateProductDescsDto } from './dto/cms_CreateProductDescs.dto';
import { Cms_UpdateProductDescsDto } from './dto/cms_UpdateProductDescs.dto';
import { Public } from 'src/auth/decorators/public.decorator';

@Controller(':company_id/cms/productdescs')
export class cms_ProductDescsController {
  constructor(private readonly productDescsService: cms_ProductDescsService) {}

  @Public()
  @Post()
  async create(
    @Param('company_id') company_id: string,
    @Body() createProductDescsDto: Cms_CreateProductDescsDto,
  ): Promise<Cms_ResponseProductDescsDto> {
    createProductDescsDto.company_id = company_id;
    return this.productDescsService.create(createProductDescsDto);
  }

  @Public()
  @Get()
  async findAll(
    @Param('company_id') company_id: string,
  ): Promise<Cms_ResponseProductDescsDto[]> {
    return this.productDescsService.findAll(company_id);
  }

  @Public()
  @Get(':id')
  async findOne(
    @Param('company_id') company_id: string,
    @Param('id') id: string,
  ): Promise<Cms_ResponseProductDescsDto> {
    return this.productDescsService.findOne(company_id, id);
  }

  @Public()
  @Put(':id')
  async update(
    @Param('company_id') company_id: string,
    @Param('id') id: string,
    @Body() updateProductDescsDto: Cms_UpdateProductDescsDto,
  ): Promise<Cms_ResponseProductDescsDto> {
    return this.productDescsService.update(
      id,
      company_id,
      updateProductDescsDto,
    );
  }
}

// import { Controller, Get, Post, Body, Param, Put, Query } from '@nestjs/common';
// import { Cms_ResponseProductDescsDto } from './dto/cms_ResponseProductDescs.dto';
// import { Public } from 'src/auth/decorators/public.decorator';
// import { cms_ProductDescsService } from './cms_ProductDescs.service';

// // @Controller('im-productdescs')
// @Controller('cms/productdescs')
// export class cms_ProductDescsController {
//   constructor(private readonly productdescsService: cms_ProductDescsService) {}

//   @Public()
//   @Get(':id/:company_id')
//   async findOne(
//     @Param('id') id: string,
//     @Param('company_id') company_id: string,
//   ): Promise<Cms_ResponseProductDescsDto> {
//     return this.productdescsService.findOne(id, company_id);
//   }
// }
