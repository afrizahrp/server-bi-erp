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
import { toArray } from 'src/utils/toArray';

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
    @Query() query: Record<string, any>,
  ) {
    this.logger.debug(`Query params received: ${JSON.stringify(query)}`);

    // Konversi field yang bisa array
    const companyIds = toArray(query.company_id);
    const yearsArray = toArray(query.years);
    const monthsArray = query.months ? toArray(query.months) : undefined;
    const sortBy = typeof query.sortBy === 'string' ? query.sortBy : undefined;

    if (companyIds.length === 0) {
      this.logger.error('At least one company_id is required');
      throw new BadRequestException('At least one company_id is required');
    }
    if (yearsArray.length === 0) {
      this.logger.error('At least one year is required');
      throw new BadRequestException('At least one year is required');
    }

    this.logger.debug(`Processed months: ${JSON.stringify(monthsArray)}`);
    this.logger.debug(`Processed years: ${JSON.stringify(yearsArray)}`);

    try {
      return await this.salesPersonPerformaDashboardService.getYearlySalespersonInvoice(
        module_id,
        subModule_id,
        {
          company_id: companyIds,
          years: yearsArray,
          months: monthsArray,
          sortBy,
        },
      );
    } catch (error) {
      const errorMessage =
        typeof error === 'object' && error !== null && 'message' in error
          ? (error as { message?: string }).message || 'Unknown error'
          : 'Unknown error';
      this.logger.error(`Error processing request: ${errorMessage}`);
      throw new BadRequestException(errorMessage);
    }
  }
}
