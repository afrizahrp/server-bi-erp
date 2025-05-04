import {
  BadRequestException,
  Controller,
  Get,
  Param,
  Query,
  Request,
} from '@nestjs/common';
import { Public } from 'src/auth/decorators/public.decorator';

import { paginationSalesInvoiceHdDto } from './dto/paginationSalesInvoiceHd.dto';
import { responseSalesInvoiceHdDto } from './dto/responseSalesInvoiceHd';

import { salesInvoiceHdService } from './salesInvoiceHd.service';

@Controller(':company_id/:module_id/get-invoiceHd')
export class salesInvoiceHdController {
  constructor(private readonly salesInvoiceHdService: salesInvoiceHdService) {}

  @Public()
  @Get()
  async findAll(
    @Param('company_id') company_id: string,
    @Param('module_id') module_id: string,
    @Query() paginationDto: paginationSalesInvoiceHdDto,
    // @Request() req, // Ambil userId dari request
  ): Promise<{ data: responseSalesInvoiceHdDto[]; totalRecords: number }> {
    // const userId = req.user?.id; // Pastikan userId tersedia di request
    // if (!userId) {
    //   throw new BadRequestException('User ID is required');
    // }

    return this.salesInvoiceHdService.findAll(
      company_id,
      module_id,
      paginationDto,
      // userId,
    );
  }

  @Public()
  @Get('detail/:id')
  async findOne(
    @Param('company_id') company_id: string,
    @Param('id') id: string,
  ): Promise<responseSalesInvoiceHdDto> {
    return this.salesInvoiceHdService.findOne(company_id, id);
  }

  @Public()
  @Get('getPaidStatus')
  async getPaidStatus(
    @Param('company_id') company_id: string,
    @Param('module_id') module_id: string,
    @Query() query: paginationSalesInvoiceHdDto,
  ) {
    const rawData = await this.salesInvoiceHdService.filterByPaidStatus(
      company_id,
      module_id,
      query,
    );

    return rawData ?? { data: [], totalRecords: 0 };
  }

  @Public()
  @Get('getPoType')
  async getPoType(
    @Param('company_id') company_id: string,
    @Param('module_id') module_id: string,
    @Query() query: paginationSalesInvoiceHdDto,
  ) {
    const rawData = await this.salesInvoiceHdService.filterByPoType(
      company_id,
      module_id,
      query,
    );

    return rawData ?? { data: [], totalRecords: 0 };
  }
  @Public()
  @Get('getSalesPerson')
  async getSalesPerson(
    @Param('company_id') company_id: string,
    @Param('module_id') module_id: string,
    @Query() query: paginationSalesInvoiceHdDto,
  ) {
    const rawData = await this.salesInvoiceHdService.filterBySalesPersonName(
      company_id,
      module_id,
      query,
    );

    return rawData ?? { data: [], totalRecords: 0 };
  }
}
