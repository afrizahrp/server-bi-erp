import { Controller, Get, Param, Query } from '@nestjs/common';
import { Public } from 'src/auth/decorators/public.decorator';
import { sls_AnalythicsService } from './sls_analytics.service';
import { sls_analyticsDto } from './dto/sls_analytics.dto';
import { Logger } from '@nestjs/common';

@Controller(':company_id/:module_id/:subModule_id/get-analytics')
export class sls_AnalythicsController {
  private readonly logger = new Logger(sls_AnalythicsController.name);

  constructor(private readonly salesAnalytics: sls_AnalythicsService) {}

  @Public()
  @Get('getByTopNSalesPersonByPeriod')
  async getByTopNSalesPersonByPeriod(
    @Param('company_id') company_id: string,
    @Param('module_id') module_id: string,
    @Param('subModule_id') subModule_id: string,
    @Query() query: sls_analyticsDto,
  ) {
    this.logger.debug(`Query params received: ${JSON.stringify(query)}`);

    try {
      return await this.salesAnalytics.getByTopNSalesPersonByPeriod(
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
  @Get('getBySalesPersonByPeriod')
  async getBySalesPersonByPeriod(
    @Param('company_id') company_id: string,
    @Param('module_id') module_id: string,
    @Param('subModule_id') subModule_id: string,
    @Query() query: sls_analyticsDto,
  ) {
    this.logger.debug(`Query params received: ${JSON.stringify(query)}`);

    try {
      return await this.salesAnalytics.getBySalesPersonByPeriod(
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
  @Get('getProductSoldCountBySalesPerson')
  async getProductSoldCountBySalesPerson(
    @Param('company_id') company_id: string,
    @Param('module_id') module_id: string,
    @Param('subModule_id') subModule_id: string,
    @Query('salesPersonName') salesPersonName: string,
    @Query('startPeriod') startPeriod: string,
    @Query('endPeriod') endPeriod: string,
  ) {
    this.logger.debug(
      `Received params: company_id=${company_id}, module_id=${module_id}, subModule_id=${subModule_id}, salesPersonName=${salesPersonName}, startPeriod=${startPeriod}, endPeriod=${endPeriod}`,
    );
    try {
      return await this.salesAnalytics.getProductSoldCountBySalesPerson(
        company_id,
        salesPersonName,
        startPeriod,
        endPeriod,
      );
    } catch (error) {
      this.logger.error(`Error processing request: ${error.message}`);
      throw error;
    }
  }
}
