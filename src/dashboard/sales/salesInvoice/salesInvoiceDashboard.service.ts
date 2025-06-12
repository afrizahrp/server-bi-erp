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
import { Prisma } from '@prisma/client';
import { monthMap } from 'src/utils/date/getMonthName';

@Injectable()
export class salesInvoiceDashboardService {
  private readonly logger = new Logger(salesInvoiceDashboardService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getYearlySalesInvoice(
    company_id: string,
    module_id: string,
    subModule_id: string,
    dto: yearlySalesDashboardDto,
  ) {
    const { years, months, includeHoSales } = dto;

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

    // Validasi months (opsional)
    let monthNumbers: number[] = [];
    if (months && months.length > 0) {
      monthNumbers = months.map((month) => {
        const monthName =
          month.charAt(0).toUpperCase() + month.slice(1).toLowerCase();
        const monthIndex = monthMap.indexOf(monthName);
        if (monthIndex === -1) {
          throw new BadRequestException(
            `Invalid month: ${month}. Must be a valid month name (e.g., Jan, Feb, etc.)`,
          );
        }
        return monthIndex + 1; // Konversi ke nomor bulan (1-12)
      });
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
    const salesInvoiceResult = await this.prisma.$queryRaw<
      {
        year: number;
        total_amount: bigint;
        invoice_count: bigint;
      }[]
    >(Prisma.sql`
      SELECT 
        EXTRACT(YEAR FROM "invoiceDate") AS "year",
        CAST(SUM("total_amount") AS DECIMAL) AS "total_amount",
        COUNT(*) AS "invoice_count"
      FROM 
        "sls_InvoiceHd"
      WHERE 
        "company_id" = ${company_id}
        AND EXTRACT(YEAR FROM "invoiceDate") = ANY(${allYears})
        ${monthNumbers.length > 0 ? Prisma.sql`AND EXTRACT(MONTH FROM "invoiceDate") IN (${Prisma.join(monthNumbers)})` : Prisma.empty}
        ${includeHoSales === 1 ? Prisma.empty : Prisma.sql`AND "customer_id" != 'CO-000308'`}
      GROUP BY 
        EXTRACT(YEAR FROM "invoiceDate")
      ORDER BY 
        EXTRACT(YEAR FROM "invoiceDate");
    `);

    // Logging untuk debug
    this.logger.log(
      `Query result: ${JSON.stringify(
        salesInvoiceResult.map((item) => ({
          year: item.year,
          total_amount: item.total_amount.toString(),
          invoice_count: Number(item.invoice_count),
        })),
        null,
        2,
      )}`,
    );

    // Proses data
    const yearlyData: Record<
      string,
      { period: string; totalInvoice: number; quantity: number }
    > = {};

    // Inisialisasi semua tahun yang diminta dengan default 0
    uniqueYears.forEach((year) => {
      yearlyData[year] = {
        period: year,
        totalInvoice: 0,
        quantity: 0,
      };
    });

    // Isi data dari hasil query
    salesInvoiceResult.forEach((item) => {
      const year = item.year.toString();
      const totalAmount = parseFloat(item.total_amount.toString());
      const quantity = Number(item.invoice_count);

      yearlyData[year] = {
        period: year,
        totalInvoice: totalAmount,
        quantity,
      };
    });

    // Hitung growth percentage berdasarkan total_amount
    const filteredSalesData = uniqueYears
      .map((year) => {
        const entry = yearlyData[year];

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

    // Logging untuk debug
    this.logger.log(
      `Filtered sales data: ${JSON.stringify(filteredSalesData, null, 2)}`,
    );

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
