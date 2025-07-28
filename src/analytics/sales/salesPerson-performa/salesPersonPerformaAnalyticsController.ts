import {
  Controller,
  Get,
  Param,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { Public } from 'src/auth/decorators/public.decorator';
import { salesPersonPerformaAnalyticsService } from './salesPersonPerformaAnalyticsService';
import { salesAnalyticsDto } from '../dto/salesAnalytics.dto';
import { Logger } from '@nestjs/common';

@Controller(':module_id/:subModule_id/get-analytics')
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
    @Param('module_id') module_id: string,
    @Param('subModule_id') subModule_id: string,
    @Query() query: salesAnalyticsDto,
  ) {
    this.logger.debug(`Query params received: ${JSON.stringify(query)}`);

    const { company_id, startPeriod, endPeriod, salesPersonName, ...rest } =
      query;

    // Pastikan company_id adalah array
    const companyIds = Array.isArray(company_id)
      ? company_id
      : company_id
        ? [company_id]
        : [];

    if (companyIds.length === 0) {
      throw new BadRequestException('At least one company_id is required');
    }

    try {
      return await this.salesPersonPerformaAnalyticsService.getMonthlySalespersonInvoice(
        companyIds, // Kirim sebagai array
        module_id,
        subModule_id,
        {
          company_id: companyIds,
          startPeriod,
          endPeriod,
          salesPersonName,
          ...rest,
        },
      );
    } catch (error) {
      this.logger.error(`Error processing request: ${error.message}`);
      throw error;
    }
  }

  @Public()
  @Get('getMonthlySalesPersonInvoiceFiltered')
  async getMonthlySalesPersonInvoiceFiltered(
    @Param('module_id') module_id: string,
    @Param('subModule_id') subModule_id: string,
    @Query() query: salesAnalyticsDto,
  ) {
    this.logger.debug(`Query params received: ${JSON.stringify(query)}`);

    const { company_id, startPeriod, endPeriod, salesPersonName, ...rest } =
      query;

    // Pastikan company_id adalah array
    const companyIds = Array.isArray(company_id)
      ? company_id
      : company_id
        ? [company_id]
        : [];

    if (companyIds.length === 0) {
      throw new BadRequestException('At least one company_id is required');
    }

    try {
      return await this.salesPersonPerformaAnalyticsService.getMonthlySalesPersonInvoiceFiltered(
        companyIds, // Kirim sebagai array
        module_id,
        subModule_id,
        {
          company_id: companyIds,
          startPeriod,
          endPeriod,
          salesPersonName,
          ...rest,
        },
      );
    } catch (error) {
      this.logger.error(`Error processing request: ${error.message}`);
      throw error;
    }
  }

  @Public()
  @Get('getMonthlyComparisonSalesPersonInvoice')
  async getMonthlyComparisonSalesPersonInvoice(
    @Param('module_id') module_id: string,
    @Param('subModule_id') subModule_id: string,
    @Query() query: salesAnalyticsDto,
  ) {
    this.logger.debug(`Query params received: ${JSON.stringify(query)}`);

    const { company_id, startPeriod, endPeriod, salesPersonName, ...rest } =
      query;

    // Pastikan company_id adalah array
    const companyIds = Array.isArray(company_id)
      ? company_id
      : company_id
        ? [company_id]
        : [];

    if (companyIds.length === 0) {
      throw new BadRequestException('At least one company_id is required');
    }

    try {
      return await this.salesPersonPerformaAnalyticsService.getMonthlyComparisonSalesPersonInvoice(
        companyIds, // Kirim sebagai array
        module_id,
        subModule_id,
        {
          company_id: companyIds,
          startPeriod,
          endPeriod,
          salesPersonName,
          ...rest,
        },
      );
    } catch (error) {
      this.logger.error(`Error processing request: ${error.message}`);
      throw error;
    }
  }

  @Public()
  @Get('getMonthlyProductSoldFromSalesPersonFiltered')
  async getMonthlyProductSoldFromSalesPersonFiltered(
    @Param('module_id') module_id: string,
    @Param('subModule_id') subModule_id: string,
    @Query() query: salesAnalyticsDto,
  ) {
    this.logger.debug(`Query params received: ${JSON.stringify(query)}`);

    const { company_id, yearPeriod, monthPeriod, salesPersonName, ...rest } =
      query;

    // Pastikan company_id adalah array
    const companyIds = Array.isArray(company_id)
      ? company_id
      : company_id
        ? [company_id]
        : [];

    if (companyIds.length === 0) {
      throw new BadRequestException('At least one company_id is required');
    }

    try {
      return await this.salesPersonPerformaAnalyticsService.getMonthlyProductSoldFromSalesPersonFiltered(
        companyIds, // Kirim sebagai array
        module_id,
        subModule_id,
        {
          company_id: companyIds,
          yearPeriod,
          monthPeriod,
          salesPersonName,
          ...rest,
        },
      );
    } catch (error) {
      this.logger.error(`Error processing request: ${error.message}`);
      throw error;
    }
  }

  @Public()
  @Get('getSalespersonFilteredSummary')
  async getSalespersonFilteredSummary(
    @Param('module_id') module_id: string,
    @Param('subModule_id') subModule_id: string,
    @Query() query: salesAnalyticsDto,
  ) {
    this.logger.debug(`Query params received: ${JSON.stringify(query)}`);

    const { company_id, startPeriod, endPeriod, salesPersonName, ...rest } =
      query;

    // Pastikan company_id adalah array
    const companyIds = Array.isArray(company_id)
      ? company_id
      : company_id
        ? [company_id]
        : [];

    if (companyIds.length === 0) {
      throw new BadRequestException('At least one company_id is required');
    }

    try {
      return await this.salesPersonPerformaAnalyticsService.getSalespersonFilteredSummary(
        companyIds, // Kirim sebagai array
        module_id,
        subModule_id,
        {
          company_id: companyIds,
          startPeriod,
          endPeriod,
          salesPersonName,
          ...rest,
        },
      );
    } catch (error) {
      this.logger.error(`Error processing request: ${error.message}`);
      throw error;
    }
  }
}
