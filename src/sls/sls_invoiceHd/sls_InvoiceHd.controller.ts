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
  @Get('salesPersonName')
  async getSalesPersonName(
    @Param('company_id') company_id: string,
    @Param('module_id') module_id: string,
    @Query('salesPersonName') salesPersonName?: string,
  ) {
    const rawData =
      await this.sls_invoiceHdService.findAllInvoicesBySalesPersonName(
        company_id,
        module_id,
      );

    return { data: rawData ?? [] };
  }

  @Public()
  @Get('customerName')
  async getCustomerName(
    @Param('company_id') company_id: string,
    @Param('module_id') module_id: string,
    @Query('customerName') customerName?: string,
  ) {
    const rawData =
      await this.sls_invoiceHdService.findAllInvoicesByCustomerName(
        company_id,
        module_id,
      );

    return { data: rawData ?? [] };
  }

  @Public()
  @Get('statuses')
  async getCategoryStatuses(
    @Param('company_id') company_id: string,
    @Param('module_id') module_id: string,
    @Query('invoiceType') invoiceType?: string,
  ) {
    const rawData = await this.sls_invoiceHdService.findAllInvoiceStatuses(
      company_id,
      module_id,
      invoiceType, // Kirim filter categoryType jika ada
    );

    return { data: rawData ?? [] };
  }

  @Public()
  @Get('invoiceType')
  async getCategoryTypes(
    @Param('company_id') company_id: string,
    @Param('module_id') module_id: string,
    @Query('invoiceType') invoiceType?: string,
    @Query('status') status?: string,
  ) {
    const rawData = await this.sls_invoiceHdService.findAllInvoiceType(
      company_id,
      module_id,
      { invoiceType, status },
    );

    return { data: rawData ?? [] };
  }

  @Public()
  @Get('filter')
  async filterInvoices(
    @Param('company_id') company_id: string,
    @Param('module_id') module_id: string,
    @Query('status') status: string,
    @Query('customerName') customerName: string,
    @Query('salesPersonName') salesPersonName: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ): Promise<sls_ResponseInvoiceHdDto[]> {
    return this.sls_invoiceHdService.filterInvoices(
      company_id,
      module_id,
      status,
      customerName,
      salesPersonName,
      startDate,
      endDate,
    );
  }
}
