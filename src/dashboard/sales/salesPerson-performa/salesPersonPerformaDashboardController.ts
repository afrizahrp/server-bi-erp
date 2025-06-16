import { Controller, Get, Param, Query } from '@nestjs/common';
import { Public } from 'src/auth/decorators/public.decorator';
import { salesPersonPerformaDashboardService } from './salesPersonPerformaDashboardService';
import { Logger } from '@nestjs/common';
import { yearlySalesDashboardDto } from '../dto/yearlySalesDashboard.dto';

@Controller(':company_id/:module_id/:subModule_id/get-dashboard')
export class salesPersonPerformaDashboardController {
  private readonly logger = new Logger(
    salesPersonPerformaDashboardController.name,
  );

  constructor(
    private readonly salesPersonPerformaDashboardService: salesPersonPerformaDashboardService,
  ) {}

  @Public()
  @Get('getYearlySalespersonInvoice')
  async getYearlySalespersonInvoice(
    @Param('company_id') company_id: string,
    @Param('module_id') module_id: string,
    @Param('subModule_id') subModule_id: string,
    @Query('years') years: string | string[],
    @Query('months') months?: string | string[], // Konsisten dengan DTO
  ) {
    const yearsArray = Array.isArray(years) ? years : [years];

    const monthsArray = months
      ? Array.isArray(months)
        ? months
        : [months]
      : undefined;

    return this.salesPersonPerformaDashboardService.getYearlySalespersonInvoice(
      company_id,
      module_id,
      subModule_id,
      {
        years: yearsArray,
        months: monthsArray, // Konsisten dengan DTO
      },
    );
  }

  @Public()
  @Get('getYearlySalesPersonInvoiceFiltered')
  async getYearlySalesPersonInvoiceFiltered(
    @Param('company_id') company_id: string,
    @Param('module_id') module_id: string,
    @Param('subModule_id') subModule_id: string,
    @Query('years') years: string | string[], // Query bisa string atau array

    @Query('salesPersonName') salesPersonName: string | string[], // Query bisa string atau array
  ) {
    try {
      const yearsArray = Array.isArray(years) ? years : [years];

      const salesPersonNameArray = Array.isArray(salesPersonName)
        ? salesPersonName
        : [salesPersonName];

      return await this.salesPersonPerformaDashboardService.getYearlySalesPersonInvoiceFiltered(
        company_id,
        module_id,
        subModule_id,
        { years: yearsArray, salesPersonName: salesPersonNameArray },
      );
    } catch (error) {
      this.logger.error(`Error processing request: ${error.message}`);
      throw error;
    }
  }

  @Public()
  @Get('getYearlyProductSoldFromSalesPersonFiltered')
  async getYearlyProductSoldFromSalesPersonFiltered(
    @Param('company_id') company_id: string,
    @Param('module_id') module_id: string,
    @Param('subModule_id') subModule_id: string,
    @Query() query: yearlySalesDashboardDto,
  ) {
    try {
      return await this.salesPersonPerformaDashboardService.getYearlyProductSoldFromSalesPersonFiltered(
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
