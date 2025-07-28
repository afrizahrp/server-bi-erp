import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { Public } from 'src/auth/decorators/public.decorator';
import { salesInvoiceAnalyticsService } from './salesInvoiceAnalytics.service';
import { salesAnalyticsDto } from '../dto/salesAnalytics.dto';
import { Logger } from '@nestjs/common';

@Controller(':module_id/:subModule_id/get-analytics')
export class salesInvoiceAnalyticsController {
  private readonly logger = new Logger(salesInvoiceAnalyticsController.name);

  constructor(
    private readonly salesInvoiceAnalyticsService: salesInvoiceAnalyticsService,
  ) {}

  @Public()
  @Get('getMonthlySalesInvoice')
  async getMonthlySalesInvoice(@Query() query: salesAnalyticsDto) {
    this.logger.log('Query params received:', JSON.stringify(query));

    // Since company_id is expected as an array in the service, ensure it's passed correctly
    const { company_id, startPeriod, endPeriod, ...rest } = query;

    // Handle company_id and compny_id (if it's a typo, map it to company_id)
    const companyIds = Array.isArray(company_id)
      ? company_id
      : company_id
        ? [company_id]
        : [];

    // If compny_id is present (due to typo in URL), include it
    if (rest['compny_id']) {
      const compnyId = Array.isArray(rest['compny_id'])
        ? rest['compny_id']
        : [rest['compny_id']];
      companyIds.push(...compnyId);
    }

    if (companyIds.length === 0) {
      throw new BadRequestException('At least one company_id is required');
    }

    return this.salesInvoiceAnalyticsService.getMonthlySalesInvoice(
      companyIds, // Pass as array
      'ANT', // Hardcode module_id or get from config
      'sls', // Hardcode subModule_id or get from config
      {
        company_id: companyIds,
        startPeriod,
        endPeriod,
        ...rest,
      },
    );
  }

  @Public()
  @Get('getMonthlySalesInvoiceByPoType')
  async getMonthlySalesInvoiceByPoType(
    @Param('module_id') module_id: string,
    @Param('subModule_id') subModule_id: string,
    @Query() query: salesAnalyticsDto,
  ) {
    this.logger.log('Query params received:', JSON.stringify(query));

    const { company_id, startPeriod, endPeriod, poType, ...rest } = query;

    // Pastikan company_id adalah array
    const companyIds = Array.isArray(company_id)
      ? company_id
      : company_id
        ? [company_id]
        : [];

    if (companyIds.length === 0) {
      throw new BadRequestException('At least one company_id is required');
    }

    return this.salesInvoiceAnalyticsService.getMonthlySalesInvoiceByPoType(
      companyIds, // Kirim sebagai array
      module_id,
      subModule_id,
      {
        company_id: companyIds,
        startPeriod,
        endPeriod,
        poType,
        ...rest,
      },
    );
  }
}
