import {
  Controller,
  Get,
  Query,
  Param,
  BadRequestException,
} from '@nestjs/common';
import { Public } from 'src/auth/decorators/public.decorator';
import { salesInvoiceDashboardService } from './salesInvoiceDashboard.service';
import { yearlySalesDashboardDto } from '../dto/yearlySalesDashboard.dto';
import { Logger } from '@nestjs/common';
import { toArray } from 'src/utils/toArray';

@Controller(':module_id/:subModule_id/get-dashboard')
export class salesInvoiceDashboardController {
  private readonly logger = new Logger(salesInvoiceDashboardController.name);

  constructor(
    private readonly salesDashboardService: salesInvoiceDashboardService,
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
  @Get('getYearlySalesInvoice')
  async getYearlySalesInvoice(
    @Param('module_id') module_id: string,
    @Param('subModule_id') subModule_id: string,
    @Query() query: Record<string, any>,
  ) {
    this.logger.debug(`Query params received: ${JSON.stringify(query)}`);

    // Parse company_ids
    const parsedCompanyIds = this.parseCompanyIds(query.company_id);
    this.logger.debug(
      `Parsed company_ids: ${JSON.stringify(parsedCompanyIds)}`,
    );

    // Konversi field yang bisa array
    const dto: yearlySalesDashboardDto = {
      company_id: parsedCompanyIds,
      years: toArray(query.years),
      months: query.months ? toArray(query.months) : undefined,
      salesPersonName: query.salesPersonName
        ? toArray(query.salesPersonName)
        : undefined,
      sortBy: typeof query.sortBy === 'string' ? query.sortBy : undefined,
    };

    // Validasi manual jika perlu (opsional, jika pakai ValidationPipe global, ini tidak perlu)
    if (!dto.company_id.length) {
      throw new BadRequestException('At least one company_id is required');
    }
    if (!dto.years.length) {
      throw new BadRequestException('At least one year is required');
    }

    try {
      return await this.salesDashboardService.getYearlySalesInvoice(
        module_id,
        subModule_id,
        dto,
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
