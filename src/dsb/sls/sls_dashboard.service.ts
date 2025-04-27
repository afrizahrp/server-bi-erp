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

  // / Function to get dashboard data by period with paidStatus,and salesPersonName filters
  async getByPeriod(
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
      // this.logger.error(
      //   `Invalid period format: startPeriod=${startPeriod}, endPeriod=${endPeriod}`,
      // );
      throw new BadRequestException(
        'startPeriod and endPeriod must be in MMMYYYY format (e.g., Jan2023)',
      );
    }

    // Validasi company_id
    const companyExists = await this.prisma.sls_InvoiceHd.findFirst({
      where: { company_id },
    });
    if (!companyExists) {
      // this.logger.warn(`Company ID not found: ${company_id}`);
      throw new NotFoundException(`Company ID ${company_id} not found`);
    }

    // Log filter input
    // this.logger.debug(
    //   `Filter input: paidStatus=${JSON.stringify(paidStatus)}, poType=${JSON.stringify(poType)}, salesPersonName=${JSON.stringify(salesPersonName)}`,
    // );

    // Validasi filter paidStatus
    if (paidStatus && paidStatus.length > 0) {
      const paidStatuses = Array.isArray(paidStatus)
        ? paidStatus
        : [paidStatus];
      for (const status of paidStatuses) {
        const paidStatusExists = await this.prisma.sys_PaidStatus.findFirst({
          where: {
            company_id,
            name: { equals: status, mode: 'insensitive' },
          },
        });
        if (!paidStatusExists) {
          // this.logger.warn(`Invalid paidStatus: ${status}`);
          throw new BadRequestException(`Invalid paidStatus: ${status}`);
        }
      }
    }

    // Validasi filter poType
    if (poType && poType.length > 0) {
      const poTypes = Array.isArray(poType) ? poType : [poType];
      for (const type of poTypes) {
        const poTypeExists = await this.prisma.sls_InvoicePoType.findFirst({
          where: {
            company_id,
            name: { equals: type, mode: 'insensitive' },
          },
        });
        if (!poTypeExists) {
          // this.logger.warn(`Invalid poType: ${type}`);
          throw new BadRequestException(`Invalid poType: ${type}`);
        }
      }
    }

    // Validasi filter salesPersonName
    if (salesPersonName && salesPersonName.length > 0) {
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
          // this.logger.warn(`Invalid salesPersonName: ${name}`);
          throw new BadRequestException(
            `Invalid salesPersonName: ${name} for the given period`,
          );
        }
      }
    }

    // Hitung rentang tanggal
    const formattedStartPeriod = format(startOfMonth(startDate), 'yyyy-MM-dd');
    const formattedEndPeriod = format(endOfMonth(endDate), 'yyyy-MM-dd');

    // Buat where clause untuk query Prisma
    const where: any = {
      company_id,
      invoiceDate: {
        gte: new Date(formattedStartPeriod),
        lte: new Date(formattedEndPeriod),
      },
    };

    if (paidStatus && paidStatus.length > 0) {
      const paidStatuses = Array.isArray(paidStatus)
        ? paidStatus
        : [paidStatus];
      where.sys_PaidStatus = {
        name: { in: paidStatuses, mode: 'insensitive' },
      };
    }

    if (poType && poType.length > 0) {
      const poTypes = Array.isArray(poType) ? poType : [poType];
      where.sls_InvoicePoType = { name: { in: poTypes, mode: 'insensitive' } };
    }

    if (salesPersonName && salesPersonName.length > 0) {
      const salesPersonNames = Array.isArray(salesPersonName)
        ? salesPersonName
        : [salesPersonName];
      where.salesPersonName = { in: salesPersonNames, mode: 'insensitive' };
    }

    const result = await this.prisma.sls_InvoiceHd.groupBy({
      by:
        salesPersonName && salesPersonName.length > 0
          ? ['salesPersonName', 'invoiceDate']
          : ['invoiceDate'],
      where,
      _sum: { total_amount: true },
    });

    // Mapping month
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
    if (salesPersonName && salesPersonName.length > 0) {
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
        const amount = Math.round(
          parseFloat((item._sum.total_amount || 0).toString()),
        ); // Bulatkan

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

        // Jumlahkan nilai untuk bulan yang sama
        monthlyData[year][salesPerson].months[monthKey] =
          (monthlyData[year][salesPerson].months[monthKey] || 0) + amount;
        monthlyData[year][salesPerson].totalInvoice += amount;
      });

      response.data = Object.values(monthlyData).flatMap((yearData) =>
        Object.values(yearData).map((entry) => ({
          period: entry.period,
          salesPersonName: entry.salesPersonName,
          totalInvoice: Math.round(entry.totalInvoice), // Bulatkan
          months: monthMap.reduce(
            (acc, month) => {
              acc[month] = Math.round(entry.months[month] || 0); // Bulatkan
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
        const amount = Math.round(
          parseFloat((item._sum.total_amount || 0).toString()),
        ); // Bulatkan

        if (!monthlyData[year]) {
          monthlyData[year] = { period: year, totalInvoice: 0, months: {} };
        }

        // Jumlahkan nilai untuk bulan yang sama
        monthlyData[year].months[monthKey] =
          (monthlyData[year].months[monthKey] || 0) + amount;
        monthlyData[year].totalInvoice += amount;
      });

      response.data = Object.values(monthlyData).map((entry) => ({
        period: entry.period,
        totalInvoice: Math.round(entry.totalInvoice), // Bulatkan
        months: monthMap.reduce(
          (acc, month) => {
            acc[month] = Math.round(entry.months[month] || 0); // Bulatkan
            return acc;
          },
          {} as Record<string, number>,
        ),
      }));

      response.data.sort((a: any, b: any) => a.period.localeCompare(b.period));
    }

    return response;
  }

  async getBySalesPersonByPeriod(
    company_id: string,
    module_id: string,
    subModule_id: string,
    dto: sls_dashboardDto,
  ) {
    const { startPeriod, endPeriod, salesPersonName } = dto;

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
      throw new BadRequestException(
        'startPeriod and endPeriod must be in MMMYYYY format (e.g., Jan2023)',
      );
    }

    // Validasi company_id
    const companyExists = await this.prisma.sls_InvoiceHd.findFirst({
      where: { company_id },
    });
    if (!companyExists) {
      throw new NotFoundException(`Company ID ${company_id} not found`);
    }

    // Validasi salesPersonName jika ada
    if (salesPersonName && salesPersonName.length > 0) {
      const salesPersonNames = Array.isArray(salesPersonName)
        ? salesPersonName
        : [salesPersonName];
      for (const name of salesPersonNames) {
        const exists = await this.prisma.sls_InvoiceHd.findFirst({
          where: {
            company_id,
            salesPersonName: { equals: name, mode: 'insensitive' },
            invoiceDate: {
              gte: startOfMonth(startDate),
              lte: endOfMonth(endDate),
            },
          },
        });
        if (!exists) {
          throw new BadRequestException(
            `Invalid salesPersonName: ${name} for the given period`,
          );
        }
      }
    }

    // Prepare periode
    const formattedStartPeriod = format(startOfMonth(startDate), 'yyyy-MM-dd');
    const formattedEndPeriod = format(endOfMonth(endDate), 'yyyy-MM-dd');

    // Build where condition
    const where: any = {
      company_id,
      invoiceDate: {
        gte: new Date(formattedStartPeriod),
        lte: new Date(formattedEndPeriod),
      },
    };

    if (salesPersonName && salesPersonName.length > 0) {
      const salesPersonNames = Array.isArray(salesPersonName)
        ? salesPersonName
        : [salesPersonName];
      where.salesPersonName = { in: salesPersonNames, mode: 'insensitive' };
    }

    // Query groupBy
    const result = await this.prisma.sls_InvoiceHd.groupBy({
      by: ['salesPersonName', 'invoiceDate'],
      where,
      _sum: { total_amount: true },
    });

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

    if (salesPersonName && salesPersonName.length > 0) {
      // Kalau ada filter salesPersonName
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
        const amount = Math.round(Number(item._sum.total_amount || 0));

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

        monthlyData[year][salesPerson].months[monthKey] =
          (monthlyData[year][salesPerson].months[monthKey] || 0) + amount;
        monthlyData[year][salesPerson].totalInvoice += amount;
      });

      response.data = Object.values(monthlyData).flatMap((yearData) =>
        Object.values(yearData).map((entry) => {
          // Urutkan months berdasarkan monthMap
          const sortedMonths: Record<string, number> = {};
          monthMap.forEach((month) => {
            sortedMonths[month] = Math.round(entry.months[month] || 0);
          });

          return {
            period: entry.period,
            salesPersonName: entry.salesPersonName,
            totalInvoice: Math.round(entry.totalInvoice),
            months: sortedMonths,
          };
        }),
      );

      response.data.sort((a: any, b: any) =>
        a.period === b.period
          ? a.salesPersonName.localeCompare(b.salesPersonName)
          : a.period.localeCompare(b.period),
      );
    } else {
      // Kalau tanpa filter salesPersonName
      const monthlyData: Record<
        string,
        {
          period: string;
          totalInvoice: number;
          months: Record<string, Record<string, number>>;
        }
      > = {};

      result.forEach((item) => {
        const year = item.invoiceDate.getFullYear().toString();
        const monthIdx = item.invoiceDate.getMonth();
        const monthKey = monthMap[monthIdx];
        const salesPerson = item.salesPersonName || 'Unknown';
        const amount = Math.round(Number(item._sum.total_amount || 0));

        if (!monthlyData[year]) {
          monthlyData[year] = {
            period: year,
            totalInvoice: 0,
            months: {},
          };
        }
        if (!monthlyData[year].months[monthKey]) {
          monthlyData[year].months[monthKey] = {};
        }

        monthlyData[year].months[monthKey][salesPerson] =
          (monthlyData[year].months[monthKey][salesPerson] || 0) + amount;

        monthlyData[year].totalInvoice += amount;
      });

      response.data = Object.values(monthlyData).map((entry) => {
        // Buat array months dengan sales yang diurutkan
        const sortedMonths = monthMap
          .filter((month) => entry.months[month]) // Hanya bulan dengan data
          .map((month) => ({
            month,
            sales: Object.entries(entry.months[month])
              .sort(([, amountA], [, amountB]) => amountB - amountA) // Urutkan descending berdasarkan amount
              .map(([salesPersonName, amount]) => ({
                salesPersonName,
                amount,
              })),
          }));

        return {
          period: entry.period,
          totalInvoice: Math.round(entry.totalInvoice),
          months: sortedMonths,
        };
      });

      response.data.sort((a: any, b: any) => a.period.localeCompare(b.period));
    }
    return response;
  }

  async sls_periodPoType(
    company_id: string,
    module_id: string,
    subModule_id: string,
    dto: sls_dashboardDto,
  ) {
    const { startPeriod, endPeriod } = dto;

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
      // this.logger.error(
      //   `Invalid period format: startPeriod=${startPeriod}, endPeriod=${endPeriod}`,
      // );
      throw new BadRequestException(
        'startPeriod and endPeriod must be in MMMYYYY format (e.g., Jan2023)',
      );
    }

    // Validasi company_id
    const companyExists = await this.prisma.sls_InvoiceHd.findFirst({
      where: { company_id },
    });
    if (!companyExists) {
      // this.logger.warn(`Company ID not found: ${company_id}`);
      throw new NotFoundException(`Company ID ${company_id} not found`);
    }

    // Hitung rentang tanggal
    const formattedStartPeriod = format(startOfMonth(startDate), 'yyyy-MM-dd');
    const formattedEndPeriod = format(endOfMonth(endDate), 'yyyy-MM-dd');

    // Buat where clause untuk query Prisma
    const where: any = {
      company_id,
      invoiceDate: {
        gte: new Date(formattedStartPeriod),
        lte: new Date(formattedEndPeriod),
      },
    };

    // Query dengan findMany untuk mengambil data beserta relasi poType
    const invoices = await this.prisma.sls_InvoiceHd.findMany({
      where,
      select: {
        invoiceDate: true,
        total_amount: true,
        sls_InvoicePoType: {
          select: {
            name: true,
          },
        },
      },
    });

    // Mapping data ke format yang diinginkan
    const yearlyData: Record<
      string,
      { period: string; poTypes: Record<string, number> }
    > = {};

    for (const item of invoices) {
      const year = item.invoiceDate.getFullYear().toString();
      const poType = item.sls_InvoicePoType?.name || 'Unknown';
      const amount = item.total_amount
        ? Math.round(parseFloat(item.total_amount.toString()))
        : 0; // Round the value

      if (!yearlyData[year]) {
        yearlyData[year] = { period: year, poTypes: {} };
      }

      // Jumlahkan berdasarkan poType
      yearlyData[year].poTypes[poType] =
        (yearlyData[year].poTypes[poType] || 0) + amount;
    }

    // Bentuk response
    const response: any = {
      company_id,
      module_id,
      subModule_id,

      data: Object.values(yearlyData).sort((a, b) =>
        a.period.localeCompare(b.period),
      ),
    };

    return response;
  }
}
