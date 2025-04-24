import { Controller, Get, Param, Query } from '@nestjs/common';
import { Public } from 'src/auth/decorators/public.decorator';

import { sls_PaginationInvoiceHdDto } from './dto/sls_PaginationInvoiceHd.dto';
import { sls_ResponseInvoiceHdDto } from './dto/sls_ResponseInvoiceHd.dto';

import { sls_InvoiceHdService } from './sls_InvoiceHd.service';

@Controller(':company_id/:module_id/get-invoiceHd')
export class sls_InvoiceHdController {
  constructor(private readonly sls_invoiceHdService: sls_InvoiceHdService) {}

  @Public()
  @Get()
  async findAll(
    @Param('company_id') company_id: string,
    @Param('module_id') module_id: string,
    @Query() paginationDto: sls_PaginationInvoiceHdDto,
  ): Promise<{ data: sls_ResponseInvoiceHdDto[]; totalRecords: number }> {
    return this.sls_invoiceHdService.findAll(
      company_id,
      module_id,
      paginationDto,
    );
  }

  @Public()
  @Get('detail/:id')
  async findOne(
    @Param('company_id') company_id: string,
    @Param('id') id: string,
  ): Promise<sls_ResponseInvoiceHdDto> {
    return this.sls_invoiceHdService.findOne(company_id, id);
  }

  @Public()
  @Get('getPaidStatus')
  async getPaidStatus(
    @Param('company_id') company_id: string,
    @Param('module_id') module_id: string,
    @Query() query: sls_PaginationInvoiceHdDto,
  ) {
    const rawData = await this.sls_invoiceHdService.filterByPaidStatus(
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
    @Query() query: sls_PaginationInvoiceHdDto,
  ) {
    const rawData = await this.sls_invoiceHdService.filterByPoType(
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
    @Query() query: sls_PaginationInvoiceHdDto,
  ) {
    const rawData = await this.sls_invoiceHdService.filterBySalesPersonName(
      company_id,
      module_id,
      query,
    );

    return rawData ?? { data: [], totalRecords: 0 };
  }
}
