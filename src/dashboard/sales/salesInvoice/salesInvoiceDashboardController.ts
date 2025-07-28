import {
  Controller,
  Logger,
  Get,
  Param,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { Public } from 'src/auth/decorators/public.decorator';
import { yearlySalesDashboardDto } from '../dto/yearlySalesDashboard.dto';
import { salesInvoiceDashboardService } from './salesInvoiceDashboard.service';

@Controller(':module_id/:subModule_id/get-dashboard')
export class salesInvoiceDashboardController {
  private readonly logger = new Logger(salesInvoiceDashboardController.name);

  constructor(
    private readonly salesDashboardService: salesInvoiceDashboardService,
  ) {}

  @Public()
  @Get('getYearlySalesInvoice')
  async getYearlySalesInvoice(
    @Param('module_id') module_id: string,
    @Param('subModule_id') subModule_id: string,
    @Query() query: Record<string, any>,
  ) {
    this.logger.debug(`Query params received: ${JSON.stringify(query)}`);

    // Helper untuk memastikan field menjadi array string
    function toArray(val: unknown): string[] {
      if (Array.isArray(val))
        return val.map((v) => {
          if (['string', 'number', 'boolean'].includes(typeof v)) {
            return String(v);
          }
          throw new BadRequestException(
            'Field array harus berupa string, angka, atau array string/angka.',
          );
        });
      if (val === undefined || val === null) return [];
      if (typeof val === 'object') {
        throw new BadRequestException(
          'Field array tidak boleh berupa objek. Harap kirimkan string, angka, atau array string/angka.',
        );
      }
      if (['string', 'number', 'boolean'].includes(typeof val)) {
        return [String(val)];
      }
      throw new BadRequestException(
        'Field array harus berupa string, angka, atau array string/angka.',
      );
    }

    // Konversi field yang bisa array
    const dto: yearlySalesDashboardDto = {
      company_id: toArray(query.company_id),
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
