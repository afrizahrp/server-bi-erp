import { Controller, Get, Param, Query } from '@nestjs/common';
import { Public } from 'src/auth/decorators/public.decorator';
import { salesInvoiceAnalyticsService } from './salesInvoiceAnalytics.service';
import { salesAnalyticsDto } from '../dto/salesAnalytics.dto';
import { Logger } from '@nestjs/common';

@Controller(':company_id/:module_id/:subModule_id/get-analytics')
export class salesInvoiceAnalyticsController {
  private readonly logger = new Logger(salesInvoiceAnalyticsController.name);

  constructor(
    private readonly salesDashboardService: salesInvoiceAnalyticsService,
  ) {}
  @Public()
  @Get('getByPeriod') // Tambahkan path spesifik
  async sls_periodComparison(
    @Param('company_id') company_id: string,
    @Param('module_id') module_id: string,
    @Param('subModule_id') subModule_id: string,
    @Query() query: salesAnalyticsDto,
  ) {
    // console.log('Query params received:', JSON.stringify(query)); // Tambah log

    return this.salesDashboardService.getByPeriod(
      company_id,
      module_id,
      subModule_id,
      query,
    );
  }

  @Public()
  @Get('sls_periodPoType') // Tambahkan path spesifik
  async sls_periodPoType(
    @Param('company_id') company_id: string,
    @Param('module_id') module_id: string,
    @Param('subModule_id') subModule_id: string,
    @Query() query: salesAnalyticsDto,
  ) {
    // console.log('Query params received:', JSON.stringify(query)); // Tambah log

    return this.salesDashboardService.sls_periodPoType(
      company_id,
      module_id,
      subModule_id,
      query,
    );
  }

  @Public()
  @Get('getBySalesPersonByPeriod')
  async getBySalesPersonByPeriod(
    @Param('company_id') company_id: string,
    @Param('module_id') module_id: string,
    @Param('subModule_id') subModule_id: string,
    @Query() query: salesAnalyticsDto,
  ) {
    this.logger.debug(`Query params received: ${JSON.stringify(query)}`);

    try {
      return await this.salesDashboardService.getBySalesPersonByPeriod(
        company_id,
        module_id,
        subModule_id,
        query,
      );
    } catch (error) {
      this.logger.error(`Error processing request: ${error.message}`);
      throw error;
    }
  }

  @Public()
  @Get('getByTopNSalesPersonByPeriod')
  async getByTopNSalesPersonByPeriod(
    @Param('company_id') company_id: string,
    @Param('module_id') module_id: string,
    @Param('subModule_id') subModule_id: string,
    @Query() query: salesAnalyticsDto,
  ) {
    this.logger.debug(`Query params received: ${JSON.stringify(query)}`);

    try {
      return await this.salesDashboardService.getByTopNSalesPersonByPeriod(
        company_id,
        module_id,
        subModule_id,
        query,
      );
    } catch (error) {
      this.logger.error(`Error processing request: ${error.message}`);
      throw error;
    }
  }
}
