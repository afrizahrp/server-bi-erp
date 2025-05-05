import { Controller, Get, Param, Query } from '@nestjs/common';
import { Public } from 'src/auth/decorators/public.decorator';
import { Logger } from '@nestjs/common';
import { salesInvoiceDashboardService } from './salesInvoiceDashboard.service';

@Controller(':company_id/:module_id/:subModule_id/get-dashboard')
export class salesInvoiceDashboardController {
  private readonly logger = new Logger(salesInvoiceDashboardController.name);

  constructor(
    private readonly salesDashboardService: salesInvoiceDashboardService,
  ) {}

  @Public()
  @Get('getYearlySalesInvoice')
  async getYearlySalesInvoice(
    @Param('company_id') company_id: string,
    @Param('module_id') module_id: string,
    @Param('subModule_id') subModule_id: string,
    @Query('years') years: string | string[], // Query bisa string atau array
  ) {
    const yearsArray = Array.isArray(years) ? years : [years];

    return this.salesDashboardService.getYearlySalesInvoice(
      company_id,
      module_id,
      subModule_id,
      { years: yearsArray },
    );
  }

  @Public()
  @Get('getYearlySalesInvoiceByPoType')
  async getYearlySalesInvoiceByPoType(
    @Param('company_id') company_id: string,
    @Param('module_id') module_id: string,
    @Param('subModule_id') subModule_id: string,
    @Query('years') years: string | string[], // Query bisa string atau array
  ) {
    const yearsArray = Array.isArray(years) ? years : [years];

    return this.salesDashboardService.getYearlySalesInvoiceByPoType(
      company_id,
      module_id,
      subModule_id,
      { years: yearsArray },
    );
  }
}
