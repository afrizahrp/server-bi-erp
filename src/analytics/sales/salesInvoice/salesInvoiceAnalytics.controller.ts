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

  // @Public()
  // @Get('getMonthlySalesInvoice')
  // async getMonthlySalesInvoice(
  //   @Param('company_id') company_id: string,
  //   @Param('module_id') module_id: string,
  //   @Param('subModule_id') subModule_id: string,
  //   @Query() query: salesAnalyticsDto,
  // ) {
  //   // console.log('Query params received:', JSON.stringify(query)); // Tambah log

  //   return this.salesInvoiceAnalyticsService.getMonthlySalesInvoice(
  //     company_id,
  //     module_id,
  //     subModule_id,
  //     query,
  //   );
  // }

  @Public()
  @Get('getMonthlySalesInvoice')
  async getMonthlySalesInvoice(
    @Param('subModule_id') subModule_id: string,
    @Query() query: salesAnalyticsDto,
  ) {
    const { company_id, startPeriod, endPeriod } = query;

    // Validasi company_id
    if (!company_id || company_id.length === 0) {
      throw new BadRequestException('At least one company_id is required');
    }

    const module_id = 'SLS';

    return this.salesInvoiceAnalyticsService.getMonthlySalesInvoice(
      module_id,
      subModule_id,
      query,
    );
  }

  @Public()
  @Get('getMonthlyComparisonSalesInvoice')
  async getMonthlyComparisonSalesInvoice(
    @Param('company_id') company_id: string,
    @Param('module_id') module_id: string,
    @Param('subModule_id') subModule_id: string,
    @Query() query: salesAnalyticsDto,
  ) {
    // console.log('Query params received:', JSON.stringify(query)); // Tambah log

    return this.salesInvoiceAnalyticsService.getMonthlyComparisonSalesInvoice(
      company_id,
      module_id,
      subModule_id,
      query,
    );
  }

  @Public()
  @Get('getMonthlySalesInvoiceByPoType')
  async getMonthlySalesInvoiceByPoType(
    @Param('company_id') company_id: string,
    @Param('module_id') module_id: string,
    @Param('subModule_id') subModule_id: string,
    @Query() query: salesAnalyticsDto,
  ) {
    // console.log('Query params received:', JSON.stringify(query)); // Tambah log

    return this.salesInvoiceAnalyticsService.getMonthlySalesInvoiceByPoType(
      company_id,
      module_id,
      subModule_id,
      query,
    );
  }
}
