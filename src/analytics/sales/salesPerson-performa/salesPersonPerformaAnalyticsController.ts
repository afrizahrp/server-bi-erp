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
    private readonly salesAnalytics: salesPersonPerformaAnalyticsService,
  ) {}

  @Public()
  @Get('getYearlySalespersonInvoice') // Tambahkan path spesifik
  async getYearlySalespersonInvoice(
    @Param('company_id') company_id: string,
    @Param('module_id') module_id: string,
    @Param('subModule_id') subModule_id: string,
    @Query('years') years: string | string[], // Query bisa string atau array
  ) {
    const yearsArray = Array.isArray(years) ? years : [years];

    return this.salesAnalytics.getYearlySalespersonInvoice(
      company_id,
      module_id,
      subModule_id,
      { years: yearsArray },
    );
  }

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
      return await this.salesAnalytics.getMonthlySalespersonInvoice(
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

  // @Public()
  // @Get('getSalesByPoTypeByPeriod')
  // async getSalesByPoTypeByPeriod(
  //   @Param('company_id') company_id: string,
  //   @Param('module_id') module_id: string,
  //   @Param('subModule_id') subModule_id: string,
  //   @Query() query: salesAnalyticsDto,
  // ) {
  //   this.logger.debug(`Query params received: ${JSON.stringify(query)}`);

  //   try {
  //     return await this.salesAnalytics.getSalesByPoTypeByPeriod(
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

  @Public()
  @Get('getSelectedSalesPersonInvoice')
  async getSelectedSalesPersonInvoice(
    @Param('company_id') company_id: string,
    @Param('module_id') module_id: string,
    @Param('subModule_id') subModule_id: string,
    @Query() query: salesAnalyticsDto,
  ) {
    this.logger.debug(`Query params received: ${JSON.stringify(query)}`);

    try {
      return await this.salesAnalytics.getSelectedSalesPersonInvoice(
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
  @Get('getProductSoldFromSelectedSalesPerson')
  async getProductSoldFromSelectedSalesPerson(
    @Param('company_id') company_id: string,
    @Param('module_id') module_id: string,
    @Param('subModule_id') subModule_id: string,
    @Query('salesPersonName') salesPersonName: string,
    @Query('yearPeriod') yearPeriod: string,
    @Query('monthPeriod') monthPeriod: string,
    @Query('sortBy') sortBy: string,
  ) {
    this.logger.debug(
      `Received params: company_id=${company_id}, module_id=${module_id}, subModule_id=${subModule_id}, salesPersonName=${salesPersonName}, yearPeriod=${yearPeriod}, monthPeriod=${monthPeriod},sortBy=${sortBy}`,
    );
    try {
      return await this.salesAnalytics.getProductSoldFromSelectedSalesPerson(
        company_id,
        salesPersonName,
        yearPeriod,
        monthPeriod,
        sortBy,
      );
    } catch (error) {
      this.logger.error(`Error processing request: ${error.message}`);
      throw error;
    }
  }
}
