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
import { salesInvoiceWhereCondition } from 'src/sales/helper/salesInvoiceWhereCondition';
import { SalesInvoiceFilter } from 'src/sales/helper/salesInvoiceFilter';

@Injectable()
export class salesInvoiceAnalyticsService {
  private readonly logger = new Logger(salesInvoiceAnalyticsService.name);

  constructor(private readonly prisma: PrismaService) {}

  // / Function to get dashboard data by period with paidStatus,and salesPersonName filters
  // MONTHLY SALES ANALYTICS

  async getMonthlySalesInvoice(
    module_id: string,
    subModule_id: string,
    dto: salesAnalyticsDto,
  ) {
    const {
      company_id,
      startPeriod,
      endPeriod,
      paidStatus,
      poType,
      salesPersonName,
    } = dto;

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

    // Normalisasi company_id ke array
    let companyIds: string[];
    if (!company_id) {
      companyIds = [];
    } else if (typeof company_id === 'string') {
      companyIds = [company_id];
    } else if (Array.isArray(company_id)) {
      companyIds = company_id
        .filter((id): id is string => typeof id === 'string' && id !== null)
        .map((id) => id.trim());
    } else {
      companyIds = [];
    }

    if (companyIds.length === 0) {
      throw new BadRequestException(
        'At least one valid company_id is required',
      );
    }

    // Validasi company_id
    console.log('Validating company_ids:', companyIds);
    for (const id of companyIds) {
      const companyExists = await this.prisma.sls_InvoiceHd.findFirst({
        where: { company_id: { equals: id, mode: 'insensitive' } },
      });
      if (!companyExists) {
        console.log(`Company ID not found: ${id}`);
        throw new NotFoundException(`Company ID ${id} not found`);
      }
    }

    // Gunakan salesInvoiceWhereCondition untuk filtering
    const filter: SalesInvoiceFilter = {
      company_id: companyIds,
      paidStatus,
      poType,
      salesPersonName,
      startPeriod,
      endPeriod,
    };

    const where = salesInvoiceWhereCondition(filter, {
      requiredFilters: {
        company_id: true,
        paidStatus: !!paidStatus,
        poType: !!poType,
        salesPersonName: !!salesPersonName,
      },
    });

    console.log('Where condition:', JSON.stringify(where, null, 2));

    const result = await this.prisma.sls_InvoiceHd.groupBy({
      by:
        salesPersonName && salesPersonName.length > 0
          ? ['company_id', 'salesPersonName', 'invoiceDate']
          : ['company_id', 'invoiceDate'],
      where,
      _sum: { total_amount: true },
    });

    console.log('Query result:', JSON.stringify(result, null, 2));

    const response: any = {
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
          Record<
            string,
            {
              company_id: string;
              period: string;
              salesPersonName: string;
              totalInvoice: number;
              months: Record<string, number>;
            }
          >
        >
      > = {};

      result.forEach((item) => {
        const year = item.invoiceDate.getFullYear().toString();
        const monthIdx = item.invoiceDate.getMonth();
        const monthKey = monthMap[monthIdx];
        const salesPerson = item.salesPersonName || 'Unknown';
        const companyId = item.company_id;
        const amount = Math.round(Number(item._sum.total_amount) || 0);

        if (!monthlyData[companyId]) {
          monthlyData[companyId] = {};
        }
        if (!monthlyData[companyId][year]) {
          monthlyData[companyId][year] = {};
        }
        if (!monthlyData[companyId][year][salesPerson]) {
          monthlyData[companyId][year][salesPerson] = {
            company_id: companyId,
            period: year,
            salesPersonName: salesPerson,
            totalInvoice: 0,
            months: {},
          };
        }

        monthlyData[companyId][year][salesPerson].months[monthKey] =
          (monthlyData[companyId][year][salesPerson].months[monthKey] || 0) +
          amount;
        monthlyData[companyId][year][salesPerson].totalInvoice += amount;
      });

      response.data = Object.values(monthlyData).flatMap((companyData) =>
        Object.values(companyData).flatMap((yearData) =>
          Object.values(yearData).map((entry) => ({
            company_id: entry.company_id,
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
        ),
      );

      response.data.sort((a: any, b: any) =>
        a.company_id === b.company_id
          ? a.period === b.period
            ? a.salesPersonName.localeCompare(b.salesPersonName)
            : a.period.localeCompare(b.period)
          : a.company_id.localeCompare(b.company_id),
      );
    } else {
      const monthlyData: Record<
        string,
        Record<
          string,
          {
            company_id: string;
            period: string;
            totalInvoice: number;
            months: Record<string, number>;
          }
        >
      > = {};

      result.forEach((item) => {
        const year = item.invoiceDate.getFullYear().toString();
        const monthIdx = item.invoiceDate.getMonth();
        const monthKey = monthMap[monthIdx];
        const companyId = item.company_id;
        const amount = Math.round(Number(item._sum.total_amount) || 0);

        if (!monthlyData[companyId]) {
          monthlyData[companyId] = {};
        }
        if (!monthlyData[companyId][year]) {
          monthlyData[companyId][year] = {
            company_id: companyId,
            period: year,
            totalInvoice: 0,
            months: {},
          };
        }

        monthlyData[companyId][year].months[monthKey] =
          (monthlyData[companyId][year].months[monthKey] || 0) + amount;
        monthlyData[companyId][year].totalInvoice += amount;
      });

      response.data = Object.values(monthlyData).flatMap((companyData) =>
        Object.values(companyData).map((entry) => ({
          company_id: entry.company_id,
          period: entry.period,
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
        a.company_id === b.company_id
          ? a.period.localeCompare(b.period)
          : a.company_id.localeCompare(b.company_id),
      );
    }

    return response;
  }

  async getMonthlyComparisonSalesInvoice(
    company_id: string,
    module_id: string,
    subModule_id: string,
    dto: salesAnalyticsDto,
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

    const response: any = {
      company_id,
      module_id,
      subModule_id,
      data: [],
    };

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
        {
          period: string;
          totalInvoice: number;
          months: Record<
            string,
            { amount: number; growthPercentage: number | null }
          >;
        }
      > = {};

      // Proses data untuk periode saat ini
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
        monthlyData[year].months[monthKey] = {
          amount: (monthlyData[year].months[monthKey]?.amount || 0) + amount,
          growthPercentage: null, // Akan diisi setelah menghitung
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

          // Query untuk data tahun sebelumnya
          const previousResult = await this.prisma.sls_InvoiceHd.groupBy({
            by: ['invoiceDate'],
            where: {
              company_id,
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

          // Hitung total_amount untuk bulan yang sama di tahun sebelumnya
          const previousAmount = previousResult.reduce(
            (sum, item) =>
              sum +
              Math.round(parseFloat((item._sum.total_amount || 0).toString())),
            0,
          );

          const currentAmount = months[monthKey].amount;

          // Hitung growthPercentage
          let growthPercentage: number | null = null;
          if (previousAmount > 0) {
            growthPercentage =
              ((currentAmount - previousAmount) / previousAmount) * 100;
            growthPercentage = Number(growthPercentage.toFixed(1)); // Bulatkan ke 1 desimal
          } else if (currentAmount > 0) {
            growthPercentage = 100; // Pertumbuhan "infinite" jika previousAmount = 0 dan currentAmount > 0
          } else {
            growthPercentage = 0; // Tidak ada pertumbuhan jika keduanya 0
          }

          months[monthKey].growthPercentage = growthPercentage;
        }
      }

      response.data = Object.values(monthlyData).map((entry) => ({
        period: entry.period,
        totalInvoice: Math.round(entry.totalInvoice), // Bulatkan
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
    company_id: string,
    module_id: string,
    subModule_id: string,
    dto: salesAnalyticsDto,
  ) {
    const { startPeriod, endPeriod, poType } = dto;

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

    // Hitung rentang tanggal, termasuk tahun sebelumnya untuk growthPercentage
    const startYear = startDate.getFullYear();
    const formattedStartPeriod = format(
      startOfMonth(new Date(startYear - 1, startDate.getMonth(), 1)),
      'yyyy-MM-dd',
    ); // Mulai dari bulan yang sama tahun sebelumnya
    const formattedEndPeriod = format(endOfMonth(endDate), 'yyyy-MM-dd');

    // Buat where clause untuk query Prisma
    const where: any = {
      company_id,
      invoiceDate: {
        gte: new Date(formattedStartPeriod),
        lte: new Date(formattedEndPeriod),
      },
    };

    // Tambahkan filter poType jika ada
    if (poType) {
      const poTypes = Array.isArray(poType) ? poType : [poType];
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

    // Inisialisasi monthMap
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
