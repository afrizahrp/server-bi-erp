import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { sls_dashboardDto } from './dto/sls_dashboard.dto';
import { format, parse, startOfMonth, endOfMonth } from 'date-fns';

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

    // Log raw input
    this.logger.debug(`Raw DTO input: ${JSON.stringify(dto)}`);

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

    // Log filter input
    this.logger.debug(
      `Filter input: paidStatus=${paidStatus}, poType=${poType}, salesPersonName=${JSON.stringify(salesPersonName)}`,
    );

    // Validasi filter
    if (paidStatus) {
      const paidStatusExists = await this.prisma.sys_PaidStatus.findFirst({
        where: {
          company_id,
          name: { equals: paidStatus, mode: 'insensitive' },
        },
      });
      if (!paidStatusExists) {
        this.logger.warn(`Invalid paidStatus: ${paidStatus}`);
        throw new BadRequestException(`Invalid paidStatus: ${paidStatus}`);
      }
    }
    if (poType) {
      const poTypeExists = await this.prisma.sls_InvoicePoType.findFirst({
        where: { company_id, name: { equals: poType, mode: 'insensitive' } },
      });
      if (!poTypeExists) {
        this.logger.warn(`Invalid poType: ${poType}`);
        throw new BadRequestException(`Invalid poType: ${poType}`);
      }
    }
    if (salesPersonName) {
      const salesPersonNames = Array.isArray(salesPersonName)
        ? salesPersonName
        : [salesPersonName];
      for (const name of salesPersonNames) {
        const salesPersonExists = await this.prisma.sls_InvoiceHd.findFirst({
          where: {
            company_id,
            salesPersonName: { equals: name, mode: 'insensitive' },
            invoiceDate: {
              gte: new Date(startOfMonth(startDate)),
              lte: new Date(endOfMonth(endDate)),
            },
          },
        });
        if (!salesPersonExists) {
          this.logger.warn(`Invalid salesPersonName: ${name}`);
          throw new BadRequestException(
            `Invalid salesPersonName: ${name} for the given period`,
          );
        }
      }
    }

    // Hitung rentang tanggal
    const formattedStartPeriod = format(startOfMonth(startDate), 'yyyy-MM-dd');
    const formattedEndPeriod = format(endOfMonth(endDate), 'yyyy-MM-dd');

    this.logger.debug(
      `Formatted periods: ${formattedStartPeriod} to ${formattedEndPeriod}`,
    );

    // Coba pakai Prisma query biasa
    const where: any = {
      company_id,
      invoiceDate: {
        gte: new Date(formattedStartPeriod),
        lte: new Date(formattedEndPeriod),
      },
    };

    if (paidStatus) {
      where.paidStatus = { name: { equals: paidStatus, mode: 'insensitive' } };
    }
    if (poType) {
      where.poType = { name: { equals: poType, mode: 'insensitive' } };
    }
    if (salesPersonName) {
      const salesPersonNames = Array.isArray(salesPersonName)
        ? salesPersonName
        : [salesPersonName];
      where.salesPersonName = { in: salesPersonNames, mode: 'insensitive' };
    }

    const result = await this.prisma.sls_InvoiceHd.groupBy({
      by: salesPersonName
        ? ['salesPersonName', 'invoiceDate']
        : ['invoiceDate'],
      where,
      _sum: { total_amount: true },
    });

    this.logger.debug(`Prisma query result: ${JSON.stringify(result)}`);

    if (!result.length) {
      this.logger.warn(
        `No data found for company_id: ${company_id}, module_id: ${module_id}, period: ${startPeriod}-${endPeriod}, filters: ${JSON.stringify(dto)}`,
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

    // Pengelompokan bulanan
    if (salesPersonName) {
      const monthlyData: Record<
        string,
        Record<
          string,
          {
            period: string;
            salesPersonName: string;
            totalInvoice: number;
            months: Record<string, number>;
          }
        >
      > = {};

      result.forEach((item) => {
        const year = item.invoiceDate.getFullYear().toString();
        const monthIdx = item.invoiceDate.getMonth();
        const monthKey = monthMap[monthIdx];
        const salesPerson = item.salesPersonName || 'Unknown';
        const amount = parseFloat(
          (item._sum.total_amount || 0).toString(),
        ).toFixed(2);

        if (!monthlyData[year]) {
          monthlyData[year] = {};
        }
        if (!monthlyData[year][salesPerson]) {
          monthlyData[year][salesPerson] = {
            period: year,
            salesPersonName: salesPerson,
            totalInvoice: 0,
            months: {},
          };
        }

        monthlyData[year][salesPerson].months[monthKey] = parseFloat(amount);
        monthlyData[year][salesPerson].totalInvoice += parseFloat(amount);
      });

      response.data = Object.values(monthlyData).flatMap((yearData) =>
        Object.values(yearData).map((entry) => ({
          period: entry.period,
          salesPersonName: entry.salesPersonName,
          totalInvoice: parseFloat(entry.totalInvoice.toFixed(2)),
          months: monthMap.reduce(
            (acc, month) => {
              acc[month] = entry.months[month] || 0;
              return acc;
            },
            {} as Record<string, number>,
          ),
        })),
      );

      response.data.sort((a: any, b: any) =>
        a.period === b.period
          ? a.salesPersonName.localeCompare(b.salesPersonName)
          : a.period.localeCompare(b.period),
      );
    } else {
      const monthlyData: Record<
        string,
        { period: string; totalInvoice: number; months: Record<string, number> }
      > = {};

      result.forEach((item) => {
        const year = item.invoiceDate.getFullYear().toString();
        const monthIdx = item.invoiceDate.getMonth();
        const monthKey = monthMap[monthIdx];
        const amount = parseFloat(
          (item._sum.total_amount || 0).toString(),
        ).toFixed(2);

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

      response.data.sort((a: any, b: any) => a.period.localeCompare(b.period));
    }

    return response;
  }
}
