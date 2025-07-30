import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { salesAnalyticsDto } from '../dto/salesAnalytics.dto';
import {
  format,
  parse,
  startOfYear,
  endOfYear,
  startOfMonth,
  endOfMonth,
} from 'date-fns';

import { monthMap } from 'src/utils/date/getMonthName';

@Injectable()
export class salesInvoiceAnalyticsService {
  private readonly logger = new Logger(salesInvoiceAnalyticsService.name);

  constructor(private readonly prisma: PrismaService) {}

  // / Function to get dashboard data by period with paidStatus,and salesPersonName filters
  // MONTHLY SALES ANALYTICS
  async getMonthlySalesInvoice(
    company_id: string[], // Explicitly define as string[]
    module_id: string,
    subModule_id: string,
    dto: salesAnalyticsDto,
  ) {
    const { startPeriod, endPeriod, paidStatus, poType, salesPersonName } = dto;

    // Validate company_id
    if (!company_id || !Array.isArray(company_id) || company_id.length === 0) {
      this.logger.error('company_id array is required and cannot be empty');
      throw new BadRequestException(
        'company_id array is required and cannot be empty',
      );
    }

    // Validate startPeriod and endPeriod
    if (!startPeriod || !endPeriod) {
      this.logger.error('startPeriod and endPeriod are required');
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

    // Validate paidStatus
    if (paidStatus && paidStatus.length > 0) {
      const paidStatuses = Array.isArray(paidStatus)
        ? paidStatus
        : [paidStatus];
      for (const status of paidStatuses) {
        const paidStatusExists = await this.prisma.sys_PaidStatus.findFirst({
          where: {
            company_id: { in: company_id }, // Support multiple company_ids
            name: { equals: status, mode: 'insensitive' },
          },
        });
        if (!paidStatusExists) {
          this.logger.warn(`Invalid paidStatus: ${status}`);
          throw new BadRequestException(`Invalid paidStatus: ${status}`);
        }
      }
    }

    // Validate poType
    if (poType && poType.length > 0) {
      const poTypes = Array.isArray(poType) ? poType : [poType];
      for (const type of poTypes) {
        const poTypeExists = await this.prisma.sls_InvoicePoType.findFirst({
          where: {
            company_id: { in: company_id }, // Support multiple company_ids
            name: { equals: type, mode: 'insensitive' },
          },
        });
        if (!poTypeExists) {
          this.logger.warn(`Invalid poType: ${type}`);
          throw new BadRequestException(`Invalid poType: ${type}`);
        }
      }
    }

    // Validate salesPersonName
    if (salesPersonName && salesPersonName.length > 0) {
      const salesPersonNames = Array.isArray(salesPersonName)
        ? salesPersonName
        : [salesPersonName];
      for (const name of salesPersonNames) {
        const salesPersonExists = await this.prisma.sls_InvoiceHd.findFirst({
          where: {
            company_id: { in: company_id }, // Support multiple company_ids
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

    // Build the where clause
    const where: any = {
      company_id: { in: company_id }, // Support multiple company_ids
      invoiceDate: {
        gte: new Date(format(startOfMonth(startDate), 'yyyy-MM-dd')),
        lte: new Date(format(endOfMonth(endDate), 'yyyy-MM-dd')),
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

    // Query the database
    const result = await this.prisma.sls_InvoiceHd.groupBy({
      by:
        salesPersonName && salesPersonName.length > 0
          ? ['salesPersonName', 'invoiceDate']
          : ['invoiceDate'],
      where,
      _sum: { total_amount: true },
    });

    const response: any = {
      company_id,
      module_id,
      subModule_id,
      data: [],
    };

    // Process results for monthly data
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
        );

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
        Object.values(yearData).map((entry) => ({
          period: entry.period,
          salesPersonName: entry.salesPersonName,
          totalInvoice: Math.round(entry.totalInvoice),
          months: monthMap.reduce(
            (acc, month) => {
              acc[month] = Math.round(entry.months[month] || 0);
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
        );

        if (!monthlyData[year]) {
          monthlyData[year] = { period: year, totalInvoice: 0, months: {} };
        }

        monthlyData[year].months[monthKey] =
          (monthlyData[year].months[monthKey] || 0) + amount;
        monthlyData[year].totalInvoice += amount;
      });

      response.data = Object.values(monthlyData).map((entry) => ({
        period: entry.period,
        totalInvoice: Math.round(entry.totalInvoice),
        months: monthMap.reduce(
          (acc, month) => {
            acc[month] = Math.round(entry.months[month] || 0);
            return acc;
          },
          {} as Record<string, number>,
        ),
      }));

      response.data.sort((a: any, b: any) => a.period.localeCompare(b.period));
    }

    return response;
  }

  async getMonthlyComparisonSalesInvoice(
    module_id: string,
    subModule_id: string,
    dto: salesAnalyticsDto,
  ) {
    const { startPeriod, endPeriod, paidStatus, poType, salesPersonName } = dto;

    // Validasi startPeriod dan endPeriod
    if (!startPeriod || !endPeriod) {
      this.logger.error('startPeriod and endPeriod are required');
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
    const companyIds = Array.isArray(dto.company_id)
      ? dto.company_id
      : dto.company_id
        ? [dto.company_id]
        : [];

    if (companyIds.length === 0) {
      throw new BadRequestException('At least one company_id is required');
    }

    // Pastikan semua company_id ada di database
    const companies = await this.prisma.sls_InvoiceHd.findMany({
      where: { company_id: { in: companyIds.map((id) => id.trim()) } },
      select: { company_id: true },
    });
    const foundCompanyIds = companies.map((c) => c.company_id.trim());
    const notFound = companyIds
      .map((id) => id.trim())
      .filter((id) => !foundCompanyIds.includes(id));
    if (notFound.length > 0) {
      throw new NotFoundException(
        `Company ID(s) not found: ${notFound.join(', ')}`,
      );
    }

    // Validasi filter paidStatus
    if (paidStatus && paidStatus.length > 0) {
      const paidStatuses = Array.isArray(paidStatus)
        ? paidStatus
        : [paidStatus];
      for (const status of paidStatuses) {
        const paidStatusExists = await this.prisma.sys_PaidStatus.findFirst({
          where: {
            company_id: { in: companyIds },
            name: { equals: status, mode: 'insensitive' },
          },
        });
        if (!paidStatusExists) {
          this.logger.warn(`Invalid paidStatus: ${status}`);
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
            company_id: { in: companyIds },
            name: { equals: type, mode: 'insensitive' },
          },
        });
        if (!poTypeExists) {
          this.logger.warn(`Invalid poType: ${type}`);
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
            company_id: { in: companyIds },
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

    // Buat where clause untuk query Prisma
    const where: any = {
      company_id: { in: companyIds },
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
      module_id,
      subModule_id,
      data: [],
    };

    if (salesPersonName && salesPersonName.length > 0) {
      const monthlyData: Record<
        string,
        Record<
          string,
          {
            period: string;
            salesPersonName: string;
            totalInvoice: number;
            months: Record<
              string,
              { amount: number; growthPercentage: number | null }
            >;
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
        );

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

        monthlyData[year][salesPerson].months[monthKey] = {
          amount:
            (monthlyData[year][salesPerson].months[monthKey]?.amount || 0) +
            amount,
          growthPercentage: null,
        };
        monthlyData[year][salesPerson].totalInvoice += amount;
      });

      // Hitung growthPercentage untuk setiap salesperson dan bulan
      for (const year in monthlyData) {
        const previousYear = (parseInt(year) - 1).toString();
        for (const salesPerson in monthlyData[year]) {
          const months = monthlyData[year][salesPerson].months;
          for (const monthKey of Object.keys(months)) {
            const monthIdx = monthMap.indexOf(monthKey);
            const previousYearStart = format(
              startOfMonth(new Date(parseInt(previousYear), monthIdx)),
              'yyyy-MM-dd',
            );
            const previousYearEnd = format(
              endOfMonth(new Date(parseInt(previousYear), monthIdx)),
              'yyyy-MM-dd',
            );

            const previousResult = await this.prisma.sls_InvoiceHd.groupBy({
              by: ['invoiceDate'],
              where: {
                company_id: { in: companyIds },
                salesPersonName: { equals: salesPerson, mode: 'insensitive' },
                invoiceDate: {
                  gte: new Date(previousYearStart),
                  lte: new Date(previousYearEnd),
                },
                ...(paidStatus && paidStatus.length > 0
                  ? {
                      sys_PaidStatus: {
                        name: {
                          in: Array.isArray(paidStatus)
                            ? paidStatus
                            : [paidStatus],
                          mode: 'insensitive',
                        },
                      },
                    }
                  : {}),
                ...(poType && poType.length > 0
                  ? {
                      sls_InvoicePoType: {
                        name: {
                          in: Array.isArray(poType) ? poType : [poType],
                          mode: 'insensitive',
                        },
                      },
                    }
                  : {}),
              },
              _sum: { total_amount: true },
            });

            const previousAmount = previousResult.reduce(
              (sum, item) =>
                sum +
                Math.round(
                  parseFloat((item._sum.total_amount || 0).toString()),
                ),
              0,
            );

            const currentAmount = months[monthKey].amount;

            let growthPercentage: number | null = null;
            if (previousAmount > 0) {
              growthPercentage =
                ((currentAmount - previousAmount) / previousAmount) * 100;
              growthPercentage = Number(growthPercentage.toFixed(1));
            } else if (currentAmount > 0) {
              growthPercentage = 100;
            } else {
              growthPercentage = 0;
            }

            months[monthKey].growthPercentage = growthPercentage;
          }
        }
      }

      response.data = Object.values(monthlyData).flatMap((yearData) =>
        Object.values(yearData).map((entry) => ({
          period: entry.period,
          salesPersonName: entry.salesPersonName,
          totalInvoice: Math.round(entry.totalInvoice),
          months: monthMap.reduce(
            (acc, month) => {
              acc[month] = {
                amount: Math.round(entry.months[month]?.amount || 0),
                growthPercentage: entry.months[month]?.growthPercentage || 0,
              };
              return acc;
            },
            {} as Record<
              string,
              { amount: number; growthPercentage: number | null }
            >,
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
        {
          period: string;
          totalInvoice: number;
          months: Record<
            string,
            { amount: number; growthPercentage: number | null }
          >;
        }
      > = {};

      result.forEach((item) => {
        const year = item.invoiceDate.getFullYear().toString();
        const monthIdx = item.invoiceDate.getMonth();
        const monthKey = monthMap[monthIdx];
        const amount = Math.round(
          parseFloat((item._sum.total_amount || 0).toString()),
        );

        if (!monthlyData[year]) {
          monthlyData[year] = { period: year, totalInvoice: 0, months: {} };
        }

        monthlyData[year].months[monthKey] = {
          amount: (monthlyData[year].months[monthKey]?.amount || 0) + amount,
          growthPercentage: null,
        };
        monthlyData[year].totalInvoice += amount;
      });

      // Ambil data untuk tahun sebelumnya untuk setiap bulan
      for (const year in monthlyData) {
        const previousYear = (parseInt(year) - 1).toString();

        const months = monthlyData[year].months;
        for (const monthKey of Object.keys(months)) {
          const monthIdx = monthMap.indexOf(monthKey);
          const previousYearStart = format(
            startOfMonth(new Date(parseInt(previousYear), monthIdx)),
            'yyyy-MM-dd',
          );
          const previousYearEnd = format(
            endOfMonth(new Date(parseInt(previousYear), monthIdx)),
            'yyyy-MM-dd',
          );

          const previousResult = await this.prisma.sls_InvoiceHd.groupBy({
            by: ['invoiceDate'],
            where: {
              company_id: { in: companyIds },
              invoiceDate: {
                gte: new Date(previousYearStart),
                lte: new Date(previousYearEnd),
              },
              ...(paidStatus && paidStatus.length > 0
                ? {
                    sys_PaidStatus: {
                      name: {
                        in: Array.isArray(paidStatus)
                          ? paidStatus
                          : [paidStatus],
                        mode: 'insensitive',
                      },
                    },
                  }
                : {}),
              ...(poType && poType.length > 0
                ? {
                    sls_InvoicePoType: {
                      name: {
                        in: Array.isArray(poType) ? poType : [poType],
                        mode: 'insensitive',
                      },
                    },
                  }
                : {}),
            },
            _sum: { total_amount: true },
          });

          const previousAmount = previousResult.reduce(
            (sum, item) =>
              sum +
              Math.round(parseFloat((item._sum.total_amount || 0).toString())),
            0,
          );

          const currentAmount = months[monthKey].amount;

          let growthPercentage: number | null = null;
          if (previousAmount > 0) {
            growthPercentage =
              ((currentAmount - previousAmount) / previousAmount) * 100;
            growthPercentage = Number(growthPercentage.toFixed(1));
          } else if (currentAmount > 0) {
            growthPercentage = 100;
          } else {
            growthPercentage = 0;
          }

          months[monthKey].growthPercentage = growthPercentage;
        }
      }

      response.data = Object.values(monthlyData).map((entry) => ({
        period: entry.period,
        totalInvoice: Math.round(entry.totalInvoice),
        months: monthMap.reduce(
          (acc, month) => {
            acc[month] = {
              amount: Math.round(entry.months[month]?.amount || 0),
              growthPercentage: entry.months[month]?.growthPercentage || 0,
            };
            return acc;
          },
          {} as Record<
            string,
            { amount: number; growthPercentage: number | null }
          >,
        ),
      }));

      response.data.sort((a: any, b: any) => a.period.localeCompare(b.period));
    }

    return response;
  }

  async getYearlySalesInvoiceByPoType(
    company_id: string,
    module_id: string,
    subModule_id: string,
    dto: salesAnalyticsDto,
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

  async getMonthlySalesInvoiceByPoType(
    company_id: string[], // Ubah ke string[]
    module_id: string,
    subModule_id: string,
    dto: salesAnalyticsDto,
  ) {
    const { startPeriod, endPeriod, poType } = dto;

    // Validasi startPeriod dan endPeriod
    if (!startPeriod || !endPeriod) {
      this.logger.error('startPeriod and endPeriod are required');
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
    if (!company_id || !Array.isArray(company_id) || company_id.length === 0) {
      this.logger.error('company_id array is required and cannot be empty');
      throw new BadRequestException(
        'company_id array is required and cannot be empty',
      );
    }

    // Cek apakah semua company_id valid
    for (const id of company_id) {
      const companyExists = await this.prisma.sls_InvoiceHd.findFirst({
        where: { company_id: id },
      });
      if (!companyExists) {
        this.logger.warn(`Company ID not found: ${id}`);
        throw new NotFoundException(`Company ID ${id} not found`);
      }
    }

    // Hitung rentang tanggal, termasuk tahun sebelumnya untuk growthPercentage
    const startYear = startDate.getFullYear();
    const formattedStartPeriod = format(
      startOfMonth(new Date(startYear - 1, startDate.getMonth(), 1)),
      'yyyy-MM-dd',
    );
    const formattedEndPeriod = format(endOfMonth(endDate), 'yyyy-MM-dd');

    // Buat where clause untuk query Prisma
    const where: any = {
      company_id: { in: company_id }, // Dukung multiple company_id
      invoiceDate: {
        gte: new Date(formattedStartPeriod),
        lte: new Date(formattedEndPeriod),
      },
    };

    // Tambahkan filter poType jika ada
    if (poType) {
      const poTypes = Array.isArray(poType) ? poType : [poType];
      // Validasi poType
      for (const type of poTypes) {
        const poTypeExists = await this.prisma.sls_InvoicePoType.findFirst({
          where: {
            company_id: { in: company_id },
            name: { equals: type, mode: 'insensitive' },
          },
        });
        if (!poTypeExists) {
          this.logger.warn(`Invalid poType: ${type}`);
          throw new BadRequestException(`Invalid poType: ${type}`);
        }
      }
      where.sls_InvoicePoType = {
        name: { in: poTypes, mode: 'insensitive' },
      };
    }

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
      Record<
        string,
        {
          period: string;
          poType: string;
          totalInvoice: number;
          months: Record<string, { amount: number; growthPercentage?: number }>;
        }
      >
    > = {};

    // Agregasi data
    for (const item of invoices) {
      const year = item.invoiceDate.getFullYear().toString();
      const monthIdx = item.invoiceDate.getMonth();
      const monthKey = monthMap[monthIdx];
      const poTypeName = item.sls_InvoicePoType?.name || 'Unknown';
      const amount = item.total_amount
        ? Math.round(parseFloat(item.total_amount.toString()))
        : 0;

      if (!yearlyData[year]) {
        yearlyData[year] = {};
      }
      if (!yearlyData[year][poTypeName]) {
        yearlyData[year][poTypeName] = {
          period: year,
          poType: poTypeName,
          totalInvoice: 0,
          months: monthMap.reduce(
            (acc, month) => {
              acc[month] = { amount: 0 };
              return acc;
            },
            {} as Record<string, { amount: number; growthPercentage?: number }>,
          ),
        };
      }

      yearlyData[year][poTypeName].months[monthKey].amount += amount;
      yearlyData[year][poTypeName].totalInvoice += amount;
    }

    // Hitung growth percentage berdasarkan bulan yang sama di tahun sebelumnya
    for (const year in yearlyData) {
      for (const poTypeName in yearlyData[year]) {
        const data = yearlyData[year][poTypeName];
        monthMap.forEach((month) => {
          const currentAmount = data.months[month].amount;
          let previousAmount = 0;

          // Ambil amount dari bulan yang sama di tahun sebelumnya
          const prevYear = (parseInt(year) - 1).toString();
          if (yearlyData[prevYear]?.[poTypeName]) {
            previousAmount =
              yearlyData[prevYear][poTypeName].months[month].amount;
          }

          if (previousAmount > 0 && currentAmount > 0) {
            const growth =
              ((currentAmount - previousAmount) / previousAmount) * 100;
            data.months[month].growthPercentage = parseFloat(growth.toFixed(2));
          } else if (currentAmount > 0) {
            data.months[month].growthPercentage = 0;
          } else {
            data.months[month].growthPercentage = undefined;
          }
        });
      }
    }

    // Filter data hanya untuk periode yang diminta
    const filteredData = Object.values(yearlyData)
      .flatMap((yearData) => Object.values(yearData))
      .filter((entry) => parseInt(entry.period) >= startYear)
      .sort((a, b) => a.period.localeCompare(b.period));

    // Bentuk response
    const response: any = {
      company_id,
      module_id,
      subModule_id,
      data: filteredData,
    };

    return response;
  }
}
