import {
  BadRequestException,
  Controller,
  Get,
  Param,
  Query,
} from '@nestjs/common';
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
    @Query('years') years: string | string[],
    @Query('months') months?: string | string[], // Bisa string atau array
    @Query('includeHoSales') includeHoSales?: string,
  ) {
    try {
      // Konversi years ke array
      const yearsArray = Array.isArray(years) ? years : [years];

      // Konversi months ke array (jika ada)
      const monthsArray = months
        ? Array.isArray(months)
          ? months
          : [months]
        : undefined;

      // Validasi dan konversi includeHoSales
      let includeHoSalesValue: number | undefined;
      if (includeHoSales !== undefined) {
        const parsedValue = parseInt(includeHoSales, 10);
        if (isNaN(parsedValue) || ![0, 1].includes(parsedValue)) {
          throw new BadRequestException('includeHoSales must be 0 or 1');
        }
        includeHoSalesValue = parsedValue;
      } else {
        includeHoSalesValue = 0; // Default ke 0 jika tidak ada
      }

      // Logging untuk debug
      this.logger.log(`Received years: ${JSON.stringify(yearsArray)}`);
      if (monthsArray) {
        this.logger.log(`Received months: ${JSON.stringify(monthsArray)}`);
        // Validasi manual sebagai cadangan (opsional)
        if (monthsArray.length > 6) {
          throw new BadRequestException('Maximum 3 months can be selected');
        }
      }

      this.logger.log(`Received includeHoSales: ${includeHoSalesValue}`);

      return await this.salesDashboardService.getYearlySalesInvoice(
        company_id,
        module_id,
        subModule_id,
        {
          years: yearsArray,
          months: monthsArray,
          includeHoSales: includeHoSalesValue,
        },
      );
    } catch (error) {
      this.logger.error(`Error processing request: ${error.message}`);
      throw new BadRequestException(error.message);
    }
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
