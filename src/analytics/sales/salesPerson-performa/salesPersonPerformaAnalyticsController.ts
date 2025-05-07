import { Controller, Get, Param, Query } from '@nestjs/common';
import { Public } from 'src/auth/decorators/public.decorator';
import { salesPersonPerformaAnalyticsService } from './salesPersonPerformaAnalyticsService';
import { salesAnalyticsDto } from '../dto/salesAnalytics.dto';
import { Logger } from '@nestjs/common';

@Controller(':company_id/:module_id/:subModule_id/get-analytics')
export class salesPersonPerformaAnalyticsController {
  private readonly logger = new Logger(
    salesPersonPerformaAnalyticsController.name,
  );

  constructor(
    private readonly salesPersonPerformaAnalyticsService: salesPersonPerformaAnalyticsService,
  ) {}

  @Public()
  @Get('getMonthlySalespersonInvoice')
  async getMonthlySalespersonInvoice(
    @Param('company_id') company_id: string,
    @Param('module_id') module_id: string,
    @Param('subModule_id') subModule_id: string,
    @Query() query: salesAnalyticsDto,
  ) {
    this.logger.debug(`Query params received: ${JSON.stringify(query)}`);

    try {
      return await this.salesPersonPerformaAnalyticsService.getMonthlySalespersonInvoice(
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
  @Get('getMonthlySalesPersonInvoiceFiltered')
  async getMonthlySalesPersonInvoiceFiltered(
    @Param('company_id') company_id: string,
    @Param('module_id') module_id: string,
    @Param('subModule_id') subModule_id: string,
    @Query() query: salesAnalyticsDto,
  ) {
    this.logger.debug(`Query params received: ${JSON.stringify(query)}`);

    try {
      return await this.salesPersonPerformaAnalyticsService.getMonthlySalesPersonInvoiceFiltered(
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
  @Get('getMonthlyComparisonSalesPersonInvoice')
  async getMonthlyComparisonSalesPersonInvoice(
    @Param('company_id') company_id: string,
    @Param('module_id') module_id: string,
    @Param('subModule_id') subModule_id: string,
    @Query() query: salesAnalyticsDto,
  ) {
    this.logger.debug(`Query params received: ${JSON.stringify(query)}`);

    try {
      return await this.salesPersonPerformaAnalyticsService.getMonthlyComparisonSalesPersonInvoice(
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
  @Get('getMonthlyProductSoldFromSalesPersonFiltered')
  async getMonthlyProductSoldFromSalesPersonFiltered(
    @Param('company_id') company_id: string,
    @Param('module_id') module_id: string,
    @Param('subModule_id') subModule_id: string,
    @Query() query: salesAnalyticsDto,
  ) {
    try {
      return await this.salesPersonPerformaAnalyticsService.getMonthlyProductSoldFromSalesPersonFiltered(
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
