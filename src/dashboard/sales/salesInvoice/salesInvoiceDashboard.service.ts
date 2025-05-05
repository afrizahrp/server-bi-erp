import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { yearlySalesDashboardDto } from '../dto/yearlySalesDashboard.dto';
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
export class salesInvoiceDashboardService {
  private readonly logger = new Logger(salesInvoiceDashboardService.name);

  constructor(private readonly prisma: PrismaService) {}
  // YEARLY SALES ANALYTICS
  async getYearlySalesInvoice(
    company_id: string,
    module_id: string,
    subModule_id: string,
    dto: yearlySalesDashboardDto,
  ) {
    const { years } = dto;

    // Validasi years
    if (!years || !Array.isArray(years) || years.length === 0) {
      throw new BadRequestException(
        'years array is required and cannot be empty',
      );
    }

    // Validasi format tahun dan hapus duplikat
    const uniqueYears = [...new Set(years)];
    const invalidYears = uniqueYears.filter(
      (year) => !/^\d{4}$/.test(year) || isNaN(parseInt(year)),
    );
    if (invalidYears.length > 0) {
      throw new BadRequestException(
        `Invalid years: ${invalidYears.join(', ')}. Must be in YYYY format (e.g., 2023)`,
      );
    }

    // Validasi company_id
    const companyExists = await this.prisma.sls_InvoiceHd.findFirst({
      where: { company_id },
    });
    if (!companyExists) {
      throw new NotFoundException(`Company ID ${company_id} not found`);
    }

    // Tentukan tahun sebelumnya untuk growth percentage
    const previousYears = uniqueYears
      .map((year) => (parseInt(year) - 1).toString())
      .filter((year) => !uniqueYears.includes(year));
    const allYears = [...uniqueYears, ...previousYears].map(Number);

    // Query untuk Sales Invoice Per Tahun
    const salesInvoiceResult = await this.prisma.sls_InvoiceHd.groupBy({
      by: ['invoiceDate'],
      where: {
        company_id,
        invoiceDate: {
          gte: startOfYear(new Date(Math.min(...allYears), 0, 1)),
          lte: endOfYear(new Date(Math.max(...allYears), 11, 31)),
        },
        trxType: 'IV',
        total_amount: { gt: 0 },
      },
      _count: { _all: true }, // Quantity (jumlah invoice)
      _sum: { total_amount: true }, // Untuk total_amount dan filter
    });

    // Proses data
    const yearlyData: Record<
      string,
      { period: string; totalInvoice: number; quantity: number }
    > = {};

    salesInvoiceResult.forEach((item) => {
      const year = item.invoiceDate.getFullYear().toString();
      const totalAmount = Math.round(
        parseFloat((item._sum.total_amount || 0).toString()),
      );
      const quantity = item._count._all || 0;

      if (!yearlyData[year]) {
        yearlyData[year] = { period: year, totalInvoice: 0, quantity: 0 };
      }

      yearlyData[year].totalInvoice += totalAmount;
      yearlyData[year].quantity += quantity;
    });

    // Hitung growth percentage berdasarkan total_amount
    const filteredSalesData = uniqueYears
      .map((year) => {
        const entry = yearlyData[year];
        if (!entry || entry.totalInvoice < 3600000000) return null;

        const previousYear = (parseInt(year) - 1).toString();
        const previousData = yearlyData[previousYear];
        let growthPercentage: number | null = null;

        if (previousData && previousData.totalInvoice > 0) {
          growthPercentage =
            ((entry.totalInvoice - previousData.totalInvoice) /
              previousData.totalInvoice) *
            100;
          growthPercentage = Math.round(growthPercentage * 10) / 10; // 1 desimal
        } else if (
          entry.totalInvoice > 0 &&
          year === Math.min(...uniqueYears.map(Number)).toString()
        ) {
          growthPercentage = 0; // Tahun pertama yang dipilih
        }

        return {
          period: entry.period,
          totalInvoice: Math.round(entry.totalInvoice),
          quantity: entry.quantity,
          growthPercentage,
        };
      })
      .filter((entry) => entry !== null)
      .sort((a, b) => a.period.localeCompare(b.period));

    // Format respons
    return {
      company_id,
      module_id,
      subModule_id,
      data: filteredSalesData,
    };
  }

  async getYearlySalesInvoiceByPoType(
    company_id: string,
    module_id: string,
    subModule_id: string,
    dto: yearlySalesDashboardDto,
  ) {
    const { years } = dto;
    // Validasi years
    if (!years || years.length === 0) {
      throw new BadRequestException('Years are required');
    }

    // Validasi company_id
    const companyExists = await this.prisma.sls_InvoiceHd.findFirst({
      where: { company_id },
    });
    if (!companyExists) {
      throw new NotFoundException(`Company ID ${company_id} not found`);
    }

    // Buat where clause untuk query Prisma
    const where: any = {
      company_id,
      invoiceDate: {
        gte: new Date(`${Math.min(...years.map(Number))}-01-01`),
        lte: new Date(`${Math.max(...years.map(Number))}-12-31`),
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
      {
        period: string;
        poType: string;
        totalInvoice: number;
      }[]
    > = {};

    for (const item of invoices) {
      const year = item.invoiceDate.getFullYear().toString();
      const poTypeName = item.sls_InvoicePoType?.name || 'Unknown';
      const amount = item.total_amount
        ? Math.round(parseFloat(item.total_amount.toString()))
        : 0;

      if (!yearlyData[year]) {
        yearlyData[year] = [];
      }

      const poTypeData = yearlyData[year].find(
        (data) => data.poType === poTypeName,
      );

      if (poTypeData) {
        poTypeData.totalInvoice += amount;
      } else {
        yearlyData[year].push({
          period: year,
          poType: poTypeName,
          totalInvoice: amount,
        });
      }
    }

    // Bentuk response
    const response: any = {
      company_id,
      module_id,
      subModule_id,
      data: Object.entries(yearlyData).map(([year, poTypes]) => ({
        period: year,
        poTypes: poTypes.sort((a, b) => b.totalInvoice - a.totalInvoice), // Urutkan berdasarkan totalInvoice
      })),
    };

    return response;
  }
}
