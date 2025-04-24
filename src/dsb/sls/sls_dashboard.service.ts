import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { sls_dashboardDto } from './dto/sls_dashboard.dto';
import { slsInvoiceHdWherecondition } from 'src/sls/helper/sls_InvoiceHd_wherecondition';
import { format, parse, startOfMonth, endOfMonth } from 'date-fns';
import { SlsInvoiceFilter } from 'src/sls/helper/sls_filter';

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
    const { startPeriod, endPeriod, paidStatus, poType, salesPersonName } = dto;

    // Validasi startPeriod dan endPeriod
    if (!startPeriod || !endPeriod) {
      throw new BadRequestException('startPeriod and endPeriod are required');
    }

    let startDate: Date, endDate: Date;
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

    // Validasi company_id
    const companyExists = await this.prisma.sls_InvoiceHd.findFirst({
      where: { company_id },
    });
    if (!companyExists) {
      this.logger.warn(`Company ID not found: ${company_id}`);
      throw new NotFoundException(`Company ID ${company_id} not found`);
    }

    // // Validasi module_id
    // const moduleExists = await this.prisma.sls_InvoiceHd.findFirst({
    //   where: { module_id },
    // });
    // if (!moduleExists) {
    //   this.logger.warn(`Module ID not found: ${module_id}`);
    //   throw new NotFoundException(`Module ID ${module_id} not found`);
    // }

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
        paidStatus: true,
        poType: true,
        salesPersonName: true,
      },
      additionalConditions: {
        module_id,
        // subModule_id, // Aktifkan jika ada di database
      },
    });

    this.logger.debug(`Where condition: ${JSON.stringify(whereCondition)}`);

    // Hitung rentang tanggal (awal dan akhir bulan)
    const formattedStartPeriod = format(startOfMonth(startDate), 'yyyy-MM-dd');
    const formattedEndPeriod = format(endOfMonth(endDate), 'yyyy-MM-dd');

    this.logger.debug(
      `Formatted periods: ${formattedStartPeriod} to ${formattedEndPeriod}`,
    );

    // Tentukan jenis pengelompokan
    const startYear = startDate.getFullYear();
    const endYear = endDate.getFullYear();
    const startMonth = startDate.getMonth();
    const endMonth = endDate.getMonth();
    const isSameYear = startYear === endYear;
    const isSameMonth = startMonth === endMonth;

    // Query raw dengan parameterisasi dan type casting
    const queryParams: any[] = [
      company_id,
      formattedStartPeriod,
      formattedEndPeriod,
    ];
    let query = `
      SELECT 
        EXTRACT(YEAR FROM "invoiceDate") AS year,
        EXTRACT(MONTH FROM "invoiceDate") AS month,
        SUM("total_amount") AS "totalInvoice"
      FROM "sls_InvoiceHd"
      WHERE "company_id" = $1
        AND "invoiceDate" BETWEEN $2::timestamp AND $3::timestamp
    `;

    // Tambahkan filter opsional
    let paramIndex = 4;
    if (paidStatus) {
      query += ` AND "paidStatus" = $${paramIndex}`;
      queryParams.push(paidStatus);
      paramIndex++;
    }
    if (poType) {
      query += ` AND "poType_id" = $${paramIndex}`; // Asumsi poType adalah poType_id (int)
      if (typeof poType === 'string') {
        queryParams.push(parseInt(poType, 10));
        paramIndex++;
      } else {
        throw new BadRequestException('Invalid poType format');
      }
    }
    if (salesPersonName) {
      query += ` AND "salesPersonName" = $${paramIndex}`;
      queryParams.push(salesPersonName);
      paramIndex++;
    }

    query += `
      GROUP BY year, month
      ORDER BY year, month
    `;

    this.logger.debug(`Raw SQL: ${query}`);
    this.logger.debug(`Query params: ${JSON.stringify(queryParams)}`);

    const result = await this.prisma.$queryRawUnsafe<any[]>(
      query,
      ...queryParams,
    );

    if (!result.length) {
      this.logger.warn(
        `No data found for company_id: ${company_id}, module_id: ${module_id}, period: ${startPeriod}-${endPeriod}`,
      );
      throw new NotFoundException('No sales data found for the given criteria');
    }

    // Mapping bulan
    const monthMap = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];

    const response: any = {
      company_id,
      module_id,
      subModule_id,
      data: [],
    };

    if (isSameYear || isSameMonth) {
      // Pengelompokan bulanan
      const monthlyData: Record<
        string,
        { period: string; totalInvoice: number; months: Record<string, number> }
      > = {};

      result.forEach((item) => {
        const year = item.year.toString();
        const monthIdx = parseInt(item.month) - 1;
        const monthKey = monthMap[monthIdx];
        const amount = parseFloat(item.totalInvoice || 0).toFixed(2);

        if (!monthlyData[year]) {
          monthlyData[year] = { period: year, totalInvoice: 0, months: {} };
        }

        monthlyData[year].months[monthKey] = parseFloat(amount);
        monthlyData[year].totalInvoice += parseFloat(amount);
      });

      response.data = Object.values(monthlyData).map((entry) => ({
        period: entry.period,
        totalInvoice: parseFloat(entry.totalInvoice.toFixed(2)),
        months: monthMap.reduce(
          (acc, month) => {
            acc[month] = entry.months[month] || 0;
            return acc;
          },
          {} as Record<string, number>,
        ),
      }));
    } else {
      // Pengelompokan tahunan
      response.data = result
        .reduce(
          (acc, item) => {
            const year = item.year.toString();
            const amount = parseFloat(item.totalInvoice || 0).toFixed(2);
            const existing = acc.find((entry: any) => entry.period === year);
            if (existing) {
              existing.totalInvoice += parseFloat(amount);
            } else {
              acc.push({ period: year, totalInvoice: parseFloat(amount) });
            }
            return acc;
          },
          [] as { period: string; totalInvoice: number }[],
        )
        .sort((a, b) => a.period.localeCompare(b.period));
    }

    return response;
  }
}
