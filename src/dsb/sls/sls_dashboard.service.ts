import {
  Injectable,
  NotFoundException,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { sls_dashboardDto } from './dto/sls_dashboard.dto';
import { slsInvoiceHdWherecondition } from 'src/sls/helper/sls_InvoiceHd_wherecondition';
import { SlsInvoiceFilter } from 'src/sls/helper/sls_filter';
import { format, parse } from 'date-fns';

@Injectable()
export class sls_DashboardService {
  private readonly logger = new Logger(sls_DashboardService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getSalesDashboard(
    company_id: string,
    module_id: string,
    subModule_id: string,
    dto: sls_dashboardDto,
  ) {
    // Validasi company_id
    const companyExists = await this.prisma.sls_InvoiceHd.findFirst({
      where: { company_id },
    });
    if (!companyExists) {
      this.logger.warn(`Company ID not found: ${company_id}`);
      throw new NotFoundException(`Company ID ${company_id} not found`);
    }

    // Validasi module_id
    // const moduleExists = await this.prisma.sls_InvoiceHd.findFirst({
    //   where: { module_id },
    // });
    // if (!moduleExists) {
    //   this.logger.warn(`Module ID not found: ${module_id}`);
    //   throw new NotFoundException(`Module ID ${module_id} not found`);
    // }

    const { paidStatus, poType, salesPersonName, startPeriod, endPeriod } = dto;

    // Validasi startPeriod dan endPeriod
    let startDate: Date | undefined;
    let endDate: Date | undefined;
    if (startPeriod && endPeriod) {
      try {
        startDate = parse(startPeriod, 'MMMyyyy', new Date());
        endDate = parse(endPeriod, 'MMMyyyy', new Date());
        if (startDate > endDate) {
          throw new BadRequestException('endPeriod must be after startPeriod');
        }
      } catch (error) {
        this.logger.error(
          `Invalid period format: startPeriod=${startPeriod}, endPeriod=${endPeriod}`,
        );
        throw new BadRequestException(
          'startPeriod and endPeriod must be in MMMYYYY format (e.g., Jan2023)',
        );
      }
    }

    const filter: SlsInvoiceFilter = {
      paidStatus,
      poType,
      salesPersonName,
      startPeriod,
      endPeriod,
    };

    this.logger.debug(`Input filter: ${JSON.stringify(filter)}`);

    const whereCondition = slsInvoiceHdWherecondition(company_id, filter, {
      requiredFilters: {
        paidStatus: false,
        poType: false,
        salesPersonName: false,
      },
    });

    this.logger.debug(`Where condition: ${JSON.stringify(whereCondition)}`);

    // Konversi whereCondition ke string SQL
    const whereSql = Object.entries(whereCondition)
      .map(([key, value]) => {
        if (typeof value === 'string') {
          return `"${key}" = '${value}'`;
        } else if (value && typeof value === 'object') {
          if ('gt' in value) {
            return `"${key}" > ${value.gt}`;
          } else if ('gte' in value && 'lte' in value) {
            return `"${key}" BETWEEN '${value.gte}' AND '${value.lte}'`;
          }
        }
        return '';
      })
      .filter(Boolean)
      .join(' AND ');

    // Tentukan jenis pengelompokan
    let isSameYear = false;
    let isSameMonth = false;
    if (startDate && endDate) {
      const startYear = startDate.getFullYear();
      const endYear = endDate.getFullYear();
      const startMonth = startDate.getMonth();
      const endMonth = endDate.getMonth();
      isSameYear = startYear === endYear;
      isSameMonth = startMonth === endMonth;
    }

    let salesData: any[];

    if (isSameYear || isSameMonth) {
      // Pengelompokan bulanan (tahun sama atau bulan sama)
      const query = `
        SELECT 
          TO_CHAR("invoiceDate", 'YYYY-MM') AS period,
          SUM(total_amount) AS total_amount
        FROM "sls_InvoiceHd"
        WHERE ${whereSql}
        GROUP BY TO_CHAR("invoiceDate", 'YYYY-MM')
        ORDER BY period ASC
      `;
      this.logger.debug(`Raw SQL: ${query}`);
      salesData = await this.prisma.$queryRawUnsafe(query);
    } else {
      // Pengelompokan tahunan (tahun berbeda, bulan berbeda)
      const query = `
        SELECT 
          EXTRACT(YEAR FROM "invoiceDate") AS period,
          SUM(total_amount) AS total_amount
        FROM "sls_InvoiceHd"
        WHERE ${whereSql}
        GROUP BY EXTRACT(YEAR FROM "invoiceDate")
        ORDER BY period ASC
      `;
      this.logger.debug(`Raw SQL: ${query}`);
      salesData = await this.prisma.$queryRawUnsafe(query);
    }

    if (!salesData.length) {
      this.logger.warn(
        `No data found for company_id: ${company_id}, module_id: ${module_id}, period: ${startPeriod}-${endPeriod}`,
      );
      throw new NotFoundException('No sales data found for the given criteria');
    }

    const formattedData = salesData.map((item) => {
      if (isSameYear || isSameMonth) {
        // Format bulanan: MMM YYYY
        const date = parse(item.period, 'yyyy-MM', new Date());
        return {
          period: format(date, 'MMM yyyy'),
          totalInvoice: Number(item.total_amount) || 0,
        };
      } else {
        // Format tahunan: YYYY
        return {
          period: item.period.toString(),
          totalInvoice: Number(item.total_amount) || 0,
        };
      }
    });

    return formattedData;
  }
}
