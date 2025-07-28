import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { yearlySalesDashboardDto } from '../dto/yearlySalesDashboard.dto';
import { Prisma } from '@prisma/client';

import { monthMap } from 'src/utils/date/getMonthName';

@Injectable()
export class salesInvoiceDashboardService {
  private readonly logger = new Logger(salesInvoiceDashboardService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getYearlySalesInvoice(
    module_id: string,
    subModule_id: string,
    dto: yearlySalesDashboardDto,
  ) {
    const { years, months } = dto;

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
    // Validasi company_id (array)
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
      where: { company_id: { in: companyIds } },
      select: { company_id: true },
    });
    const foundCompanyIds = companies.map((c) => c.company_id);
    const notFound = companyIds.filter((id) => !foundCompanyIds.includes(id));
    if (notFound.length > 0) {
      throw new NotFoundException(
        `Company ID(s) not found: ${notFound.join(', ')}`,
      );
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
        "company_id" IN ${companyIds}
        AND EXTRACT(YEAR FROM "invoiceDate") = ANY(${allYears})
        ${monthNumbers.length > 0 ? Prisma.sql`AND EXTRACT(MONTH FROM "invoiceDate") IN (${Prisma.join(monthNumbers)})` : Prisma.empty}
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
      module_id,
      subModule_id,
      data: filteredSalesData,
    };
  }
}
