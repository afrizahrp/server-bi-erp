import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { Public } from 'src/auth/decorators/public.decorator';
import { salesInvoiceAnalyticsService } from './salesInvoiceAnalytics.service';
import { salesAnalyticsDto } from '../dto/salesAnalytics.dto';
import { yearlySalesAnalyticsDto } from '../dto/yearlySalesAnalytics.dto';
import { Logger } from '@nestjs/common';

@Controller(':company_id/:module_id/:subModule_id/get-analytics')
export class salesInvoiceAnalyticsController {
  private readonly logger = new Logger(salesInvoiceAnalyticsController.name);

  constructor(
    private readonly salesDashboardService: salesInvoiceAnalyticsService,
  ) {}

  @Public()
  @Get('getYearlySalesInvoice') // Tambahkan path spesifik
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
  @Get('getMonthlySalesInvoice') // Tambahkan path spesifik
  async sls_periodComparison(
    @Param('company_id') company_id: string,
    @Param('module_id') module_id: string,
    @Param('subModule_id') subModule_id: string,
    @Query() query: salesAnalyticsDto,
  ) {
    // console.log('Query params received:', JSON.stringify(query)); // Tambah log

    return this.salesDashboardService.getMonthlySalesInvoice(
      company_id,
      module_id,
      subModule_id,
      query,
    );
  }

  @Public()
  @Get('getYearlySalesInvoiceByPoType') // Tambahkan path spesifik
  async getYearlySalesInvoiceByPoType(
    @Param('company_id') company_id: string,
    @Param('module_id') module_id: string,
    @Param('subModule_id') subModule_id: string,
    @Query() query: salesAnalyticsDto,
  ) {
    // console.log('Query params received:', JSON.stringify(query)); // Tambah log

    return this.salesDashboardService.getYearlySalesInvoiceByPoType(
      company_id,
      module_id,
      subModule_id,
      query,
    );
  }

  // @Public()
  // @Get('getBySalesPersonByPeriod')
  // async getBySalesPersonByPeriod(
  //   @Param('company_id') company_id: string,
  //   @Param('module_id') module_id: string,
  //   @Param('subModule_id') subModule_id: string,
  //   @Query() query: salesAnalyticsDto,
  // ) {
  //   this.logger.debug(`Query params received: ${JSON.stringify(query)}`);

  //   try {
  //     return await this.salesDashboardService.getBySalesPersonByPeriod(
  //       company_id,
  //       module_id,
  //       subModule_id,
  //       query,
  //     );
  //   } catch (error) {
  //     this.logger.error(`Error processing request: ${error.message}`);
  //     throw error;
  //   }
  // }
}
