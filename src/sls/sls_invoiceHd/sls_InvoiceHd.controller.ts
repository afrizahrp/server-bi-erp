import { Controller, Get, Param, Query } from '@nestjs/common';
import { Public } from 'src/auth/decorators/public.decorator';

import { sls_PaginationInvoiceHdDto } from './dto/sls_PaginationInvoiceHd.dto';
import { sls_ResponseInvoiceHdDto } from './dto/sls_ResponseInvoiceHd.dto';

import { sls_InvoiceHdService } from './sls_InvoiceHd.service';
import { sls_FilterInvoiceHdDto } from './dto/sls_FilterInvoiceHdDto';

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
  @Get('getSalesPerson')
  async getSalesPerson(
    @Param('company_id') company_id: string,
    @Param('module_id') module_id: string,
    @Query('paidStatus') paidStatus?: string, // Tambahkan query parameter paidStatus
  ) {
    const rawData = await this.sls_invoiceHdService.filterBySalesPerson(
      company_id,
      module_id,
      paidStatus, // Send paidStatus to the service
    );

    return { data: rawData ?? [] };
  }

  @Public()
  @Get('getPaidStatus')
  async getPaidStatus(
    @Param('company_id') company_id: string,
    @Param('module_id') module_id: string,
    @Query() query: sls_FilterInvoiceHdDto,
  ) {
    const { startPeriod, endPeriod, poType, salesPersonName } = query;

    const rawData = await this.sls_invoiceHdService.filterByPaidStatus(
      company_id,
      module_id,
      startPeriod,
      endPeriod,
      poType,
      salesPersonName,
    );

    return { data: rawData ?? [] };
  }

  // @Public()
  // @Get('getPaidStatus')
  // async getPaidStatus(
  //   @Param('company_id') company_id: string,
  //   @Param('module_id') module_id: string,
  //   @Query('startPeriod') startPeriod?: string,
  //   @Query('endPeriod') endPeriod?: string,
  //   @Query('salesPersonName') salesPersonName?: string,
  // ) {
  //   const rawData = await this.sls_invoiceHdService.filterByPaidStatus(
  //     company_id,
  //     module_id,
  //     startPeriod,
  //     endPeriod,
  //     salesPersonName ? [salesPersonName] : undefined, // Send salesPersonName as an array if it exists
  //   );

  //   return { data: rawData ?? [] };
  // }

  @Public()
  @Get('getPoType')
  async getPoType(
    @Param('company_id') company_id: string,
    @Param('module_id') module_id: string,
    @Query() query: sls_FilterInvoiceHdDto,
  ) {
    const { startPeriod, endPeriod, paidStatus, salesPersonName } = query;

    const rawData = await this.sls_invoiceHdService.filterByPoType(
      company_id,
      module_id,
      startPeriod,
      endPeriod,
      paidStatus,
      salesPersonName,
    );

    return { data: rawData ?? [] };
  }
}
