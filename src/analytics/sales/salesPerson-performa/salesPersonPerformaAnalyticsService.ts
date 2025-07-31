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
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
} from 'date-fns';
import { monthMap } from 'src/utils/date/getMonthName';
import { Prisma } from '@prisma/client';

@Injectable()
export class salesPersonPerformaAnalyticsService {
  private readonly logger = new Logger(
    salesPersonPerformaAnalyticsService.name,
  );

  constructor(private readonly prisma: PrismaService) {}
  //afriza top N sales person MONTHLY
  async getMonthlySalespersonInvoice(
    company_id: string[], // Mendukung array company_id
    module_id: string,
    subModule_id: string,
    dto: salesAnalyticsDto,
  ) {
    this.logger.debug('Starting getMonthlySalespersonInvoice...');

    const { startPeriod, endPeriod, salesPersonName } = dto;

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

    // Validasi salesPersonName jika ada
    if (salesPersonName && salesPersonName.length > 0) {
      const salesPersonNames = Array.isArray(salesPersonName)
        ? salesPersonName
        : [salesPersonName];
      for (const name of salesPersonNames) {
        const salesPersonExists = await this.prisma.sls_InvoiceHd.findFirst({
          where: {
            company_id: { in: company_id },
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

    const formattedStartPeriod = new Date(
      format(startOfMonth(startDate), 'yyyy-MM-dd'),
    );
    const formattedEndPeriod = new Date(
      format(endOfMonth(endDate), 'yyyy-MM-dd'),
    );

    this.logger.debug('Executing query...');
    const result = await this.prisma.sls_InvoiceHd.groupBy({
      by: ['salesPersonName', 'invoiceDate'],
      where: {
        company_id: { in: company_id }, // Dukung multiple company_id
        total_amount: { gt: 0 },
        invoiceDate: {
          gte: formattedStartPeriod,
          lte: formattedEndPeriod,
        },
        ...(salesPersonName && salesPersonName.length > 0
          ? {
              salesPersonName: {
                in: Array.isArray(salesPersonName)
                  ? salesPersonName
                  : [salesPersonName],
                mode: 'insensitive',
              },
            }
          : {}),
      },
      _sum: { total_amount: true },
      having: {
        total_amount: { _sum: { gte: 300000000 } },
      },
      orderBy: [{ invoiceDate: 'asc' }, { _sum: { total_amount: 'desc' } }],
    });

    this.logger.debug(
      'Query Result:',
      result.length > 0 ? JSON.stringify(result, null, 2) : 'No data found',
    );

    if (result.length === 0) {
      this.logger.debug(
        'No salespeople with total_amount >= 300 million found.',
      );
      return {
        company_id,
        module_id,
        subModule_id,
        data: [],
      };
    }

    const response: any = {
      company_id,
      module_id,
      subModule_id,
      data: [],
    };

    const monthlyData: Record<
      string,
      {
        period: string;
        totalInvoice: number;
        months: Record<string, { salesPersonName: string; amount: number }[]>;
      }
    > = {};

    this.logger.debug('Starting result processing...');
    result.forEach((item, index) => {
      this.logger.debug(
        `Processing item ${index}:`,
        JSON.stringify(item, null, 2),
      );

      const year = item.invoiceDate.getFullYear().toString();
      const monthIdx = item.invoiceDate.getMonth();
      const monthKey = monthMap[monthIdx];

      if (!monthKey) {
        this.logger.error(`Invalid month index: ${monthIdx}`);
        throw new Error(`Invalid month index: ${monthIdx}`);
      }

      const salesPerson = item.salesPersonName || 'Unknown';
      const amount = Math.round(
        parseFloat((item._sum.total_amount || 0).toString()),
      );

      if (isNaN(amount)) {
        this.logger.warn(
          `Invalid amount for ${salesPerson} in ${monthKey} ${year}: ${item._sum.total_amount}`,
        );
        return;
      }

      if (amount < 300000000) {
        this.logger.debug(
          `Skipping ${salesPerson} for ${monthKey} ${year}: ${amount} < 300 million`,
        );
        return;
      }

      if (!monthlyData[year]) {
        monthlyData[year] = { period: year, totalInvoice: 0, months: {} };
      }
      if (!monthlyData[year].months[monthKey]) {
        monthlyData[year].months[monthKey] = [];
      }

      monthlyData[year].months[monthKey].push({
        salesPersonName: salesPerson,
        amount,
      });
      monthlyData[year].totalInvoice += amount;
    });

    this.logger.debug(
      'Processed monthlyData:',
      JSON.stringify(monthlyData, null, 2),
    );

    response.data = Object.values(monthlyData).map((entry) => {
      this.logger.debug(
        `Processing period ${entry.period} with totalInvoice ${entry.totalInvoice}`,
      );
      return {
        period: entry.period,
        totalInvoice: Math.round(entry.totalInvoice),
        months: monthMap.map((month) => {
          const sales = (entry.months[month] || [])
            .sort((a, b) => b.amount - a.amount)
            .slice(0, 5)
            .map((sales) => {
              this.logger.debug(
                `Final sales entry for ${month} ${entry.period}: ${sales.salesPersonName} - ${sales.amount}`,
              );
              return {
                salesPersonName: sales.salesPersonName.toLocaleUpperCase(),
                amount: Math.round(sales.amount),
              };
            });
          return { month, sales };
        }),
      };
    });

    this.logger.debug('Final response:', JSON.stringify(response, null, 2));
    return response;
  }

  // afriza - get sales person by period with salesPersonName filter
  // get sales person invoice with salesPersonName, year, month filter
  async getMonthlySalesPersonInvoiceFiltered(
    company_id: string[], // Ubah ke string[]
    module_id: string,
    subModule_id: string,
    dto: salesAnalyticsDto,
  ) {
    this.logger.debug('Starting getMonthlySalesPersonInvoiceFiltered...');

    const { startPeriod, endPeriod, salesPersonName } = dto;

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

    // Validasi salesPersonName jika ada
    if (salesPersonName && salesPersonName.length > 0) {
      const salesPersonNames = Array.isArray(salesPersonName)
        ? salesPersonName
        : [salesPersonName];
      for (const name of salesPersonNames) {
        const salesPersonExists = await this.prisma.sls_InvoiceHd.findFirst({
          where: {
            company_id: { in: company_id },
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

    // Prepare periode
    const formattedStartPeriod = format(startOfMonth(startDate), 'yyyy-MM-dd');
    const formattedEndPeriod = format(endOfMonth(endDate), 'yyyy-MM-dd');

    // Build where condition
    const where: any = {
      company_id: { in: company_id }, // Dukung multiple company_id
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

    const response: any = {
      company_id,
      module_id,
      subModule_id,
      data: [],
    };

    if (!salesPersonName || salesPersonName.length === 0) {
      // Hitung total penjualan per salesperson
      const totalSalesByPerson: Record<string, number> = {};

      result.forEach((item) => {
        const salesPerson = item.salesPersonName || 'Unknown';
        const amount = Math.round(Number(item._sum.total_amount || 0));
        totalSalesByPerson[salesPerson] =
          (totalSalesByPerson[salesPerson] || 0) + amount;
      });

      // Ambil topN salesperson berdasarkan total penjualan
      const topSalesPersons = Object.entries(totalSalesByPerson)
        .sort(([, amountA], [, amountB]) => amountB - amountA) // Urutkan descending berdasarkan amount
        .slice(0, 5) // Ambil 5 besar
        .map(([salesPerson]) => salesPerson);

      // Filter hanya data dari topN salesperson
      const filteredResult = result.filter((item) =>
        topSalesPersons.includes(item.salesPersonName || 'Unknown'),
      );

      // Proses data bulanan
      const monthlyData: Record<
        string,
        {
          period: string;
          totalInvoice: number;
          months: Record<string, Record<string, number>>;
        }
      > = {};

      filteredResult.forEach((item) => {
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
    } else {
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
            salesPersonName: entry.salesPersonName.toLocaleUpperCase(),
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
    }

    this.logger.debug('Final response:', JSON.stringify(response, null, 2));
    return response;
  }

  //begin afriza - get sales person by period with salesPersonName filter

  // get growth percentage of sales person by month
  async getMonthlyComparisonSalesPersonInvoice(
    company_id: string[], // Ubah ke string[]
    module_id: string,
    subModule_id: string,
    dto: salesAnalyticsDto,
  ) {
    this.logger.debug('Starting getMonthlyComparisonSalesPersonInvoice...', {
      dto,
    });

    const { startPeriod, endPeriod, salesPersonName } = dto;

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

    // Validasi salesPersonName jika ada
    if (salesPersonName && salesPersonName.length > 0) {
      const salesPersonNames = Array.isArray(salesPersonName)
        ? salesPersonName
        : [salesPersonName];
      for (const name of salesPersonNames) {
        const salesPersonExists = await this.prisma.sls_InvoiceHd.findFirst({
          where: {
            company_id: { in: company_id },
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

    // Format tanggal sebagai string
    const formattedStartPeriod = format(startOfMonth(startDate), 'yyyy-MM-dd');
    const formattedEndPeriod = format(endOfMonth(endDate), 'yyyy-MM-dd');
    this.logger.debug('Formatted Periods:', {
      formattedStartPeriod,
      formattedEndPeriod,
    });

    // Query data untuk periode saat ini - SESUAIKAN DENGAN QUERY SQL USER
    this.logger.debug('Executing query for current period...');

    // Query untuk mendapatkan data per bulan - SESUAIKAN DENGAN SQL
    // Karena Prisma tidak mendukung EXTRACT(MONTH), kita perlu query semua data dan group manual
    const result = await this.prisma.sls_InvoiceHd.findMany({
      where: {
        company_id: { in: company_id },
        invoiceDate: {
          gte: new Date(formattedStartPeriod),
          lte: new Date(formattedEndPeriod),
        },
        ...(salesPersonName && salesPersonName.length > 0
          ? {
              salesPersonName: {
                in: Array.isArray(salesPersonName)
                  ? salesPersonName
                  : [salesPersonName],
                mode: 'insensitive',
              },
            }
          : {}),
      },
      select: {
        invoiceDate: true,
        total_amount: true,
        salesPersonName: true,
      },
      orderBy: { invoiceDate: 'asc' },
    });

    this.logger.debug(
      'Query Result:',
      result.length > 0
        ? JSON.stringify(result.slice(0, 5), null, 2)
        : 'No data found',
    );

    if (result.length === 0) {
      this.logger.debug('No data found for the specified period.');
      return {
        company_id,
        module_id,
        subModule_id,
        data: [],
      };
    }

    const response: any = {
      company_id,
      module_id,
      subModule_id,
      data: [],
    };

    const monthlyData: Record<
      string,
      {
        period: string;
        totalInvoice: number;
        months: Record<
          string,
          {
            salesPersonName: string;
            amount: number;
            growthPercentage: number | null;
          }[]
        >;
      }
    > = {};

    this.logger.debug('Starting result processing...');

    // Ambil tahun dari startDate
    const year = startDate.getFullYear().toString();

    if (!monthlyData[year]) {
      monthlyData[year] = { period: year, totalInvoice: 0, months: {} };
    }

    // Proses data per tanggal dan kelompokkan per bulan - SESUAIKAN DENGAN SQL
    const monthlyTotals: Record<string, Record<string, number>> = {};

    result.forEach((item, index) => {
      if (index < 5) {
        this.logger.debug(
          `Processing item ${index}:`,
          JSON.stringify(item, null, 2),
        );
      }

      const invoiceDate = item.invoiceDate;
      const monthIdx = invoiceDate.getMonth();
      const monthKey = monthMap[monthIdx];

      if (!monthKey) {
        this.logger.error(`Invalid month index: ${monthIdx}`);
        return;
      }

      const amount = Math.round(
        parseFloat((item.total_amount || 0).toString()),
      );

      if (isNaN(amount)) {
        this.logger.warn(
          `Invalid amount for date ${invoiceDate}: ${item.total_amount}`,
        );
        return;
      }

      // Akumulasi per bulan per salesperson - SESUAIKAN DENGAN SQL GROUP BY EXTRACT(MONTH)
      if (!monthlyTotals[monthKey]) {
        monthlyTotals[monthKey] = {};
      }

      const salesPerson = item.salesPersonName || 'Unknown';
      if (!monthlyTotals[monthKey][salesPerson]) {
        monthlyTotals[monthKey][salesPerson] = 0;
      }
      monthlyTotals[monthKey][salesPerson] += amount;
    });

    this.logger.debug('Monthly totals:', monthlyTotals);

    // Distribusikan data per bulan ke response
    Object.keys(monthlyTotals).forEach((monthKey) => {
      const monthData = monthlyTotals[monthKey];

      if (!monthlyData[year].months[monthKey]) {
        monthlyData[year].months[monthKey] = [];
      }

      // Tambahkan entry untuk setiap salesperson di bulan ini
      Object.keys(monthData).forEach((salesPerson) => {
        const amount = monthData[salesPerson];

        monthlyData[year].months[monthKey].push({
          salesPersonName: salesPerson.toUpperCase(),
          amount: amount,
          growthPercentage: null,
        });

        monthlyData[year].totalInvoice += amount;
      });
    });

    // SEDERHANAKAN GROWTH CALCULATION - HAPUS QUERY TAMBAHAN YANG LAMBAT
    this.logger.debug('Skipping growth calculation for performance...');

    // TAMBAHKAN GROWTH CALCULATION
    this.logger.debug('Calculating growth percentage...');

    // Hitung growth percentage untuk setiap salesperson per bulan
    for (const year in monthlyData) {
      const previousYear = (parseInt(year) - 1).toString();

      for (const monthKey of Object.keys(monthlyData[year].months)) {
        const monthIdx = monthMap.indexOf(monthKey);
        const previousYearStart = format(
          startOfMonth(new Date(parseInt(previousYear), monthIdx)),
          'yyyy-MM-dd',
        );
        const previousYearEnd = format(
          endOfMonth(new Date(parseInt(previousYear), monthIdx)),
          'yyyy-MM-dd',
        );

        // Hitung growth percentage untuk setiap salesperson di bulan ini
        for (const salesEntry of monthlyData[year].months[monthKey]) {
          const currentSalesPerson = salesEntry.salesPersonName;
          const currentAmount = salesEntry.amount;

          // Query data tahun sebelumnya untuk salesperson spesifik ini
          const previousResultForSalesPerson =
            await this.prisma.sls_InvoiceHd.findMany({
              where: {
                company_id: { in: company_id },
                invoiceDate: {
                  gte: new Date(previousYearStart),
                  lte: new Date(previousYearEnd),
                },
                salesPersonName: {
                  equals: currentSalesPerson,
                  mode: 'insensitive',
                },
              },
              select: {
                total_amount: true,
              },
            });

          // Hitung total amount tahun sebelumnya untuk salesperson ini di bulan ini
          const previousTotalAmountForSalesPerson =
            previousResultForSalesPerson.reduce((sum, item) => {
              return (
                sum +
                Math.round(parseFloat((item.total_amount || 0).toString()))
              );
            }, 0);

          let growthPercentage: number | null = null;
          if (previousTotalAmountForSalesPerson > 0) {
            growthPercentage =
              ((currentAmount - previousTotalAmountForSalesPerson) /
                previousTotalAmountForSalesPerson) *
              100;
            growthPercentage = Number(growthPercentage.toFixed(1));
          } else if (currentAmount > 0) {
            growthPercentage = 100;
          } else {
            growthPercentage = 0;
          }

          salesEntry.growthPercentage = growthPercentage;
        }
      }
    }

    response.data = Object.values(monthlyData).map((entry) => {
      this.logger.debug(
        `Processing period ${entry.period} with totalInvoice ${entry.totalInvoice}`,
      );
      return {
        period: entry.period,
        totalInvoice: Math.round(entry.totalInvoice),
        months: monthMap.map((month) => {
          const sales = (entry.months[month] || [])
            .sort((a, b) => b.amount - a.amount)
            .slice(0, 5) // Tetap batasi ke top 5 untuk performa
            .map((sales) => {
              this.logger.debug(
                `Final sales entry for ${month} ${entry.period}: ${sales.salesPersonName} - ${sales.amount} (Growth: ${sales.growthPercentage}%)`,
              );
              return {
                salesPersonName: sales.salesPersonName.toLocaleUpperCase(),
                amount: Math.round(sales.amount),
                growthPercentage: sales.growthPercentage,
              };
            });
          return { month, sales };
        }),
      };
    });

    this.logger.debug('Final response:', JSON.stringify(response, null, 2));
    return response;
  }

  //afriza end of getMonthlyComparisonSalesPersonInvoice

  async getMonthlyProductSoldFromSalesPersonFiltered(
    company_id: string[], // Ubah ke string[]
    module_id: string,
    subModule_id: string,
    dto: salesAnalyticsDto,
  ) {
    this.logger.debug(
      'Starting getMonthlyProductSoldFromSalesPersonFiltered...',
    );

    const {
      salesPersonName,
      yearPeriod,
      monthPeriod,
      sortBy = 'total_amount',
    } = dto;

    this.logger.debug(
      `Received params: company_id=${JSON.stringify(company_id)}, salesPersonName=${JSON.stringify(salesPersonName)}, yearPeriod=${yearPeriod}, monthPeriod=${monthPeriod}, sortBy=${sortBy}`,
    );

    // Validasi input
    if (!salesPersonName) {
      this.logger.error('salesPersonName is required');
      throw new BadRequestException('salesPersonName is required');
    }

    if (!yearPeriod || !monthPeriod) {
      this.logger.error('yearPeriod and monthPeriod are required');
      throw new BadRequestException('yearPeriod and monthPeriod are required');
    }

    // Validasi sortBy
    if (!['qty', 'total_amount'].includes(sortBy)) {
      this.logger.error(`Invalid sortBy value: ${sortBy}`);
      throw new BadRequestException('sortBy must be one of: qty, total_amount');
    }

    // Validasi monthPeriod
    if (!monthMap.includes(monthPeriod)) {
      this.logger.error(`Invalid monthPeriod: ${monthPeriod}`);
      throw new BadRequestException(
        `monthPeriod must be one of: ${monthMap.join(', ')}`,
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

    // Parsing periode
    const period = `${monthPeriod}${yearPeriod}`;
    let startDate: Date, endDate: Date;

    try {
      startDate = parse(period, 'MMMyyyy', new Date());
      endDate = parse(period, 'MMMyyyy', new Date());
    } catch (error) {
      this.logger.error(
        `Invalid period format: monthPeriod=${monthPeriod}, yearPeriod=${yearPeriod}`,
      );
      throw new BadRequestException(
        'yearPeriod and monthPeriod must form a valid period in MMMYYYY format (e.g., Jan2024)',
      );
    }

    const formattedStartPeriod = format(startOfMonth(startDate), 'yyyy-MM-dd');
    const formattedEndPeriod = format(endOfMonth(endDate), 'yyyy-MM-dd');

    // Validasi salesPersonName
    const salesPersonNames = Array.isArray(salesPersonName)
      ? salesPersonName
      : [salesPersonName];
    for (const name of salesPersonNames) {
      const salesPersonExists = await this.prisma.sls_InvoiceHd.findFirst({
        where: {
          company_id: { in: company_id },
          salesPersonName: { equals: name, mode: 'insensitive' },
          invoiceDate: {
            gte: new Date(formattedStartPeriod),
            lte: new Date(formattedEndPeriod),
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

    // Buat where clause untuk query Prisma
    const where: any = {
      company_id: { in: company_id }, // Dukung multiple company_id
      sls_InvoiceHd: {
        company_id: { in: company_id },
        salesPersonName: {
          in: salesPersonNames,
          mode: 'insensitive',
        },
        invoiceDate: {
          gte: new Date(formattedStartPeriod),
          lte: new Date(formattedEndPeriod),
        },
      },
    };

    // Query dengan groupBy untuk mengambil data produk terjual
    this.logger.debug('Executing query...');
    const results = await this.prisma.sls_InvoiceDt.groupBy({
      by: ['productName'],
      _sum: {
        qty: true,
        total_amount: true,
      },
      where,
      orderBy: {
        _sum: {
          [sortBy]: 'desc',
        },
      },
      take: 3,
    });

    this.logger.debug(
      'Query Result:',
      results.length > 0 ? JSON.stringify(results, null, 2) : 'No data found',
    );

    // Format data
    const data = results.map((result) => ({
      productName: result.productName.trim(),
      qty: result._sum.qty ? Math.round(Number(result._sum.qty)) : 0,
      total_amount: result._sum.total_amount
        ? Math.round(Number(result._sum.total_amount))
        : 0,
    }));

    // Bentuk response
    const response = {
      company_id,
      module_id,
      subModule_id,
      salesPersonName: salesPersonNames.map((name) => name.toUpperCase()),
      yearPeriod,
      monthPeriod,
      data,
    };

    this.logger.debug('Final response:', JSON.stringify(response, null, 2));
    return response;
  }

  async getSalesByPoTypeByPeriod(
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

    // Tambahkan filter poType jika ada
    if (poType) {
      const poTypes = Array.isArray(poType) ? poType : [poType];
      where.sls_InvoicePoType = {
        name: { in: poTypes },
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
          months: Record<string, number>;
        }
      >
    > = {};

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
              acc[month] = 0;
              return acc;
            },
            {} as Record<string, number>,
          ),
        };
      }

      yearlyData[year][poTypeName].months[monthKey] += amount;
      yearlyData[year][poTypeName].totalInvoice += amount;
    }

    // Bentuk response
    const response: any = {
      company_id,
      module_id,
      subModule_id,
      data: Object.values(yearlyData)
        .flatMap((yearData) => Object.values(yearData))
        .sort((a, b) => a.period.localeCompare(b.period)),
    };

    return response;
  }

  async getSalespersonFilteredSummary(
    company_id: string[], // Dukung multiple company_id
    module_id: string,
    subModule_id: string,
    dto: salesAnalyticsDto,
  ) {
    this.logger.debug('Starting getSalespersonFilteredSummary...', { dto });

    const { startPeriod, endPeriod, salesPersonName } = dto;

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

    // Validasi salesPersonName
    if (
      !salesPersonName ||
      (Array.isArray(salesPersonName) && salesPersonName.length === 0)
    ) {
      this.logger.error('salesPersonName is required');
      throw new BadRequestException('salesPersonName is required');
    }

    const salesPersonNames = Array.isArray(salesPersonName)
      ? salesPersonName
      : [salesPersonName];
    for (const name of salesPersonNames) {
      const salesPersonExists = await this.prisma.sls_InvoiceHd.findFirst({
        where: {
          company_id: { in: company_id },
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

    // Prepare periode
    const formattedStartPeriod = format(startOfMonth(startDate), 'yyyy-MM-dd');
    const formattedEndPeriod = format(endOfMonth(endDate), 'yyyy-MM-dd');
    this.logger.debug('Formatted Periods:', {
      formattedStartPeriod,
      formattedEndPeriod,
    });

    // Build where condition
    const where: any = {
      company_id: { in: company_id },
      invoiceDate: {
        gte: new Date(formattedStartPeriod),
        lte: new Date(formattedEndPeriod),
      },
      salesPersonName: { in: salesPersonNames, mode: 'insensitive' },
    };

    // Query groupBy
    this.logger.debug('Executing query for current period...');
    const result = await this.prisma.sls_InvoiceHd.groupBy({
      by: ['salesPersonName', 'invoiceDate'],
      where,
      _sum: { total_amount: true },
    });

    this.logger.debug(
      'Query Result:',
      result.length > 0 ? JSON.stringify(result, null, 2) : 'No data found',
    );

    if (result.length === 0) {
      this.logger.debug('No data found for the given criteria.');
      return {
        company_id,
        module_id,
        subModule_id,
        data: [],
      };
    }

    const response: any = {
      company_id,
      module_id,
      subModule_id,
      data: [],
    };

    // Logika untuk salesperson spesifik dengan agregat
    const monthlyData: Record<
      string,
      {
        period: string;
        salesPersonName: string;
        totalInvoice: number;
        months: {
          month: string;
          amount: number;
          growthPercentage: number | null;
        }[];
        previousYearInvoice: number;
        highestMonth: { month: string; amount: number };
        lowestMonth: { month: string; amount: number };
        averageMonthlySales: number;
        targetSalesSuggestion: number;
      }
    > = {};

    const year = startDate.getFullYear().toString();
    const previousYear = (startDate.getFullYear() - 1).toString();

    for (const salesPerson of salesPersonNames) {
      const key = `${year}_${salesPerson.toUpperCase()}`; // Kunci unik per salesperson per tahun
      monthlyData[key] = {
        period: year,
        salesPersonName: salesPerson.toUpperCase(),
        totalInvoice: 0,
        months: monthMap.map((month) => ({
          month,
          amount: 0,
          growthPercentage: null,
        })),
        previousYearInvoice: 0,
        highestMonth: { month: '', amount: 0 },
        lowestMonth: { month: monthMap[0], amount: Number.MAX_VALUE },
        averageMonthlySales: 0,
        targetSalesSuggestion: 0,
      };

      // Query data untuk tahun sebelumnya
      const previousYearStart = format(
        startOfYear(new Date(parseInt(previousYear), 0, 1)),
        'yyyy-MM-dd',
      );
      const previousYearEnd = format(
        endOfYear(new Date(parseInt(previousYear), 11, 31)),
        'yyyy-MM-dd',
      );
      const previousResult = await this.prisma.sls_InvoiceHd.groupBy({
        by: ['salesPersonName'],
        where: {
          company_id: { in: company_id },
          salesPersonName: { equals: salesPerson, mode: 'insensitive' },
          invoiceDate: {
            gte: new Date(previousYearStart),
            lte: new Date(previousYearEnd),
          },
        },
        _sum: { total_amount: true },
      });

      const previousTotal = previousResult.reduce(
        (sum, item) => sum + Math.round(Number(item._sum.total_amount || 0)),
        0,
      );
      monthlyData[key].previousYearInvoice = previousTotal;

      // Proses data untuk periode saat ini
      result
        .filter(
          (item) =>
            item.salesPersonName.toUpperCase() === salesPerson.toUpperCase(),
        )
        .forEach((item) => {
          const monthIdx = item.invoiceDate.getMonth();
          const amount = Math.round(Number(item._sum.total_amount || 0));

          const monthEntry = monthlyData[key].months[monthIdx];
          monthEntry.amount += amount;
          monthlyData[key].totalInvoice += amount;
        });

      // Hitung growthPercentage untuk setiap bulan
      for (let monthIdx = 0; monthIdx < monthMap.length; monthIdx++) {
        const monthKey = monthMap[monthIdx];
        const previousMonthStart = format(
          startOfMonth(new Date(parseInt(previousYear), monthIdx, 1)),
          'yyyy-MM-dd',
        );
        const previousMonthEnd = format(
          endOfMonth(new Date(parseInt(previousYear), monthIdx, 1)),
          'yyyy-MM-dd',
        );

        const previousMonthResult = await this.prisma.sls_InvoiceHd.groupBy({
          by: ['salesPersonName'],
          where: {
            company_id: { in: company_id },
            salesPersonName: { equals: salesPerson, mode: 'insensitive' },
            invoiceDate: {
              gte: new Date(previousMonthStart),
              lte: new Date(previousMonthEnd),
            },
          },
          _sum: { total_amount: true },
        });

        const previousAmount = previousMonthResult.reduce(
          (sum, item) => sum + Math.round(Number(item._sum.total_amount || 0)),
          0,
        );
        const currentAmount = monthlyData[key].months[monthIdx].amount;

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
        monthlyData[key].months[monthIdx].growthPercentage = growthPercentage;
      }

      // Hitung agregat
      const monthlyAmounts = monthlyData[key].months.map((m) => m.amount);
      monthlyData[key].highestMonth = monthlyData[key].months.reduce(
        (max, current) => (current.amount > max.amount ? current : max),
        { month: '', amount: 0 },
      );
      monthlyData[key].lowestMonth = monthlyData[key].months.reduce(
        (min, current) =>
          current.amount < min.amount && current.amount > 0 ? current : min,
        { month: monthMap[0], amount: Number.MAX_VALUE },
      );
      monthlyData[key].averageMonthlySales = monthlyAmounts.length
        ? Math.round(
            monthlyAmounts.reduce((sum, a) => sum + a, 0) /
              monthlyAmounts.length,
          )
        : 0;
      monthlyData[key].targetSalesSuggestion = Math.round(
        monthlyData[key].averageMonthlySales * 12 * 1.1, // Target 10% lebih tinggi dari rata-rata tahunan
      );
    }

    // Transform data ke format akhir
    response.data = Object.values(monthlyData).map((entry) => {
      this.logger.debug(
        `Processing data for ${entry.salesPersonName} in ${entry.period}`,
      );

      // Transform months ke format akhir tanpa growthPercentage
      const transformedMonths = entry.months.map(
        ({
          month,
          amount,
        }: {
          month: string;
          amount: number;
          growthPercentage: number | null;
        }) => ({
          month,
          amount,
        }),
      );

      // Hitung growthPercentage tahunan
      let growthPercentage: number = 0;
      if (entry.previousYearInvoice > 0) {
        growthPercentage = Number(
          (
            ((entry.totalInvoice - entry.previousYearInvoice) /
              entry.previousYearInvoice) *
            100
          ).toFixed(1),
        );
      } else if (entry.totalInvoice > 0) {
        growthPercentage = 100;
      }

      return {
        period: entry.period,
        salesPersonName: entry.salesPersonName,
        totalInvoice: entry.totalInvoice,
        previousYearInvoice: entry.previousYearInvoice,
        growthPercentage,
        highestMonth: entry.highestMonth,
        lowestMonth: entry.lowestMonth,
        averageMonthlySales: entry.averageMonthlySales,
        targetSalesSuggestion: entry.targetSalesSuggestion,
        months: transformedMonths,
      };
    });

    this.logger.debug('Final response:', JSON.stringify(response, null, 2));
    return response;
  }
}
