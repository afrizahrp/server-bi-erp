import {
  Controller,
  Get,
  Query,
  Param,
  BadRequestException,
} from '@nestjs/common';
import { Public } from 'src/auth/decorators/public.decorator';
import { salesPersonPerformaDashboardService } from './salesPersonPerformaDashboardService';
import { yearlySalesDashboardDto } from '../dto/yearlySalesDashboard.dto';
import { Logger } from '@nestjs/common';

@Controller(':module_id/:subModule_id/get-dashboard')
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
    @Param('module_id') module_id: string,
    @Param('subModule_id') subModule_id: string,
    @Query() query: yearlySalesDashboardDto,
  ) {
    this.logger.debug(`Query params received: ${JSON.stringify(query)}`);

    const { company_id, years, months, sortBy } = query;

    // Log nilai years sebelum konversi
    this.logger.debug(`Raw years value: ${JSON.stringify(years)}`);

    // Pastikan company_id adalah array
    const companyIds = Array.isArray(company_id)
      ? company_id
      : company_id
        ? [company_id]
        : [];

    if (companyIds.length === 0) {
      this.logger.error('At least one company_id is required');
      throw new BadRequestException('At least one company_id is required');
    }

    // Konversi years menjadi array jika string tunggal
    const yearsArray = Array.isArray(years) ? years : years ? [years] : [];

    if (yearsArray.length === 0) {
      this.logger.error('At least one year is required');
      throw new BadRequestException('At least one year is required');
    }

    // Log months dan years setelah konversi
    this.logger.debug(`Processed months: ${JSON.stringify(months)}`);
    this.logger.debug(`Processed years: ${JSON.stringify(yearsArray)}`);

    try {
      return await this.salesPersonPerformaDashboardService.getYearlySalespersonInvoice(
        companyIds,
        module_id,
        subModule_id,
        {
          company_id: companyIds,
          years: yearsArray,
          months,
          sortBy,
        },
      );
    } catch (error) {
      this.logger.error(`Error processing request: ${error.message}`);
      throw new BadRequestException(error.message);
    }
  }
}
