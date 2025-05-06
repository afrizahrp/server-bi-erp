import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { format, parse, startOfMonth, endOfMonth } from 'date-fns';
import { monthMap } from 'src/utils/date/getMonthName';
import { yearlySalesDashboardDto } from '../dto/yearlySalesDashboard.dto';

@Injectable()
export class salesPersonPerformaDashboardService {
  private readonly logger = new Logger(
    salesPersonPerformaDashboardService.name,
  );

  constructor(private readonly prisma: PrismaService) {}

  //YEARLY SALES PERSON INVOICE ANALYTICS
  // TOP N SALES PERSON BY YEAR WITH GROWTH PERCENTAGE AND YEARLY SALES 300Juta * 12
  async getYearlySalespersonInvoice(
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

    // Query untuk Salesperson Invoice Per Tahun
    const salespersonInvoiceResult = await this.prisma.$queryRaw<
      {
        salesPersonName: string;
        year: number;
        total_amount: number;
        invoice_count: number;
      }[]
    >`
      SELECT 
        "salesPersonName",
        EXTRACT(YEAR FROM "invoiceDate") AS "year",
        CAST(SUM("total_amount") AS DECIMAL) AS "total_amount",
        COUNT(*) AS "invoice_count"
      FROM 
        "sls_InvoiceHd"
      WHERE 
        "company_id" = ${company_id}
        AND "trxType" = 'IV'
        AND "total_amount" > 0
        AND EXTRACT(YEAR FROM "invoiceDate") = ANY(${allYears}::integer[])
      GROUP BY 
        "salesPersonName", EXTRACT(YEAR FROM "invoiceDate")
      HAVING 
        CAST(SUM("total_amount") AS DECIMAL) >= 3600000000
      ORDER BY 
        "year", "total_amount" DESC;
    `;

    // Proses data
    const yearlyData: Record<
      string,
      Record<
        string,
        { salesPersonName: string; amount: number; quantity: number }
      >
    > = {};

    salespersonInvoiceResult.forEach((item) => {
      const year = item.year.toString();
      const salesPerson = item.salesPersonName || 'Unknown';
      const amount = Math.round(Number(item.total_amount));
      const quantity = Number(item.invoice_count);

      if (!yearlyData[year]) {
        yearlyData[year] = {};
      }
      yearlyData[year][salesPerson] = {
        salesPersonName: salesPerson.toLocaleUpperCase(),
        amount,
        quantity,
      };
    });

    // Hitung growth percentage berdasarkan total_amount
    const salespersonData = uniqueYears
      .map((year) => {
        const sales = yearlyData[year];
        if (!sales) return null;

        const salesArray = Object.values(sales).map((entry) => {
          const previousYear = (parseInt(year) - 1).toString();
          const previousData =
            yearlyData[previousYear]?.[entry.salesPersonName];
          let growthPercentage: number | null = null;

          if (previousData && previousData.amount > 0) {
            growthPercentage =
              ((entry.amount - previousData.amount) / previousData.amount) *
              100;
            growthPercentage = Math.round(growthPercentage * 10) / 10; // 1 desimal
          } else if (
            entry.amount > 0 &&
            year === Math.min(...uniqueYears.map(Number)).toString()
          ) {
            growthPercentage = 0; // Tahun pertama yang dipilih
          }

          return {
            salesPersonName: entry.salesPersonName,
            amount: entry.amount,
            quantity: entry.quantity,
            growthPercentage,
          };
        });

        return {
          period: year,
          totalInvoice: Math.round(
            salesArray.reduce((sum, s) => sum + s.amount, 0),
          ),
          sales: salesArray.sort((a, b) => b.amount - a.amount).slice(0, 5), // Top 5
        };
      })
      .filter((entry) => entry !== null)
      .sort((a, b) => a.period.localeCompare(b.period));

    // Format respons
    return {
      company_id,
      module_id,
      subModule_id,
      data: salespersonData,
    };
  }

  //afriza top N sales person MONTHLY

  // afriza - get sales person by period with salesPersonName filter
  // get sales person invoice with salesPersonName, year, month filter
  async getYearlySalesPersonInvoiceFiltered(
    company_id: string,
    module_id: string,
    subModule_id: string,
    dto: yearlySalesDashboardDto,
  ) {
    const { years, salesPersonName } = dto;

    // Validasi years
    if (!years || years.length === 0) {
      throw new BadRequestException(
        'Years array is required and cannot be empty',
      );
    }

    // Validasi company_id
    const companyExists = await this.prisma.sls_InvoiceHd.findFirst({
      where: { company_id },
    });
    if (!companyExists) {
      throw new NotFoundException(`Company ID ${company_id} not found`);
    }

    // Build where condition
    const where: any = {
      company_id,
      invoiceDate: {
        gte: new Date(`${Math.min(...years.map(Number))}-01-01`),
        lte: new Date(`${Math.max(...years.map(Number))}-12-31`),
      },
      total_amount: {
        gte: 360000000, // 300 juta * 12 bulan,
      },
    };

    // Query groupBy
    const result = await this.prisma.sls_InvoiceHd.groupBy({
      by: ['salesPersonName', 'invoiceDate'],
      where,
      _sum: { total_amount: true },
    });

    const yearlyData: Record<
      string,
      {
        period: string;
        totalInvoice: number;
        sales: { salesPersonName: string; totalAmount: number }[];
      }
    > = {};

    result.forEach((item) => {
      const year = item.invoiceDate.getFullYear().toString();
      const salesPerson = item.salesPersonName || 'Unknown';
      const totalAmount = Math.round(Number(item._sum.total_amount || 0));

      if (!yearlyData[year]) {
        yearlyData[year] = {
          period: year,
          totalInvoice: 0,
          sales: [],
        };
      }

      yearlyData[year].sales.push({
        salesPersonName: salesPerson,
        totalAmount,
      });

      yearlyData[year].totalInvoice += totalAmount;
    });

    const response = {
      company_id,
      module_id,
      subModule_id,
      data: Object.values(yearlyData).map((entry) => ({
        period: entry.period,
        totalInvoice: entry.totalInvoice,
        sales: entry.sales
          .sort((a, b) => b.totalAmount - a.totalAmount)
          .slice(0, 5), // Ambil 5 sales person dengan penjualan tertinggi
      })),
    };

    return response;
  }

  async getYearlyProductSoldFromSalesPersonFiltered(
    company_id: string,
    module_id: string,
    subModule_id: string,
    dto: yearlySalesDashboardDto,
  ) {
    let { years, salesPersonName, sortBy = 'total_amount' } = dto;

    this.logger.debug(
      `Received params: company_id=${company_id}, salesPersonName=${salesPersonName}, years=${years}, sortBy=${sortBy}`,
    );

    // Konversi years menjadi array jika string tunggal
    years = Array.isArray(years) ? years : years ? [years] : [];

    // Validasi years
    if (!years || years.length === 0) {
      throw new BadRequestException('At least one year is required');
    }

    // Validasi format tahun (contoh: '2023')
    const invalidYears = years.filter(
      (year) => !/^\d{4}$/.test(year) || isNaN(parseInt(year)),
    );
    if (invalidYears.length > 0) {
      throw new BadRequestException(
        'Years must be in YYYY format (e.g., 2023)',
      );
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
      sls_InvoiceHd: {
        company_id,
        trxType: 'IV',
        invoiceDate: {
          gte: new Date(`${Math.min(...years.map(Number))}-01-01`),
          lte: new Date(`${Math.max(...years.map(Number))}-12-31`),
        },
      },
    };

    // Tambahkan filter salesPersonName jika ada
    if (salesPersonName) {
      where.sls_InvoiceHd.salesPersonName = Array.isArray(salesPersonName)
        ? { in: salesPersonName, mode: 'insensitive' }
        : { equals: salesPersonName, mode: 'insensitive' };
    }

    // Query dengan groupBy untuk mengambil data produk terjual
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

    // Format data
    const data = results.map((result) => ({
      productName: result.productName.trim(),
      qty: result._sum.qty ? Math.round(Number(result._sum.qty)) : 0,
      total_amount: result._sum.total_amount
        ? Math.round(Number(result._sum.total_amount))
        : 0,
    }));

    // Bentuk response
    return {
      company_id,
      module_id,
      subModule_id,
      salesPersonName: Array.isArray(salesPersonName)
        ? salesPersonName.map((name) => name.toUpperCase())
        : salesPersonName?.toUpperCase() || null,
      years,
      data,
    };
  }
}
