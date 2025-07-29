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
import { toArray } from 'src/utils/toArray';

import { Logger } from '@nestjs/common';

@Controller(':module_id/:subModule_id/get-analytics')
export class salesInvoiceAnalyticsController {
  private readonly logger = new Logger(salesInvoiceAnalyticsController.name);

  constructor(
    private readonly salesInvoiceAnalyticsService: salesInvoiceAnalyticsService,
  ) {}

  private parseCompanyIds(companyId: unknown): string[] {
    if (Array.isArray(companyId)) {
      return companyId.map((id) => String(id));
    }
    if (companyId === undefined || companyId === null) return [];
    if (typeof companyId === 'string') {
      // Handle string yang dipisahkan koma (e.g., "BIS,BIP")
      return companyId
        .split(',')
        .map((id) => id.trim())
        .filter((id) => id.length > 0);
    }
    if (typeof companyId === 'number' || typeof companyId === 'boolean') {
      return [String(companyId)];
    }
    throw new BadRequestException('Invalid company_id format');
  }

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
  @Get('getMonthlyComparisonSalesInvoice')
  async getMonthlyComparisonSalesInvoice(
    @Param('module_id') module_id: string,
    @Param('subModule_id') subModule_id: string,
    @Query() query: Record<string, any>,
  ) {
    // console.log('Query params received:', JSON.stringify(query)); // Tambah log
    const parsedCompanyIds = this.parseCompanyIds(query.company_id);

    const dto: salesAnalyticsDto = {
      company_id: parsedCompanyIds,
      startPeriod: query.startPeriod,
      endPeriod: query.endPeriod,
      yearPeriod: query.yearPeriod,
      monthPeriod: query.monthPeriod,
      paidStatus: query.paidStatus ? toArray(query.paidStatus) : undefined,
      poType: query.poType ? toArray(query.poType) : undefined,
      salesPersonName: query.salesPersonName
        ? toArray(query.salesPersonName)
        : undefined,
      topN: query.topN ? Number(query.topN) : undefined,
      sortBy: query.sortBy,
    };

    return this.salesInvoiceAnalyticsService.getMonthlyComparisonSalesInvoice(
      module_id,
      subModule_id,
      dto,
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
