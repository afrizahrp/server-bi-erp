import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { Prisma } from '@prisma/client';
import { monthMap } from 'src/utils/date/getMonthName';
import { yearlySalesDashboardDto } from '../dto/yearlySalesDashboard.dto';

@Injectable()
export class salesPersonPerformaDashboardService {
  private readonly logger = new Logger(
    salesPersonPerformaDashboardService.name,
  );

  // Sales target constants
  private readonly SINGLE_COMPANY_SALES_TARGET = 5000000000; // 5 Miliar
  private readonly MULTIPLE_COMPANIES_SALES_TARGET = 10000000000; // 10 Miliar

  constructor(private readonly prisma: PrismaService) {}

  // YEARLY SALES PERSON INVOICE ANALYTICS
  // TOP N SALES PERSON BY YEAR WITH GROWTH PERCENTAGE AND YEARLY SALES >= 3.6 Miliar
  async getYearlySalespersonInvoice(
    module_id: string,
    subModule_id: string,
    dto: yearlySalesDashboardDto,
  ) {
    const { years, months } = dto;

    this.logger.log(`Received DTO: ${JSON.stringify(dto)}`);
    this.logger.log(`Received company_id: ${JSON.stringify(dto.company_id)}`);
    this.logger.log(`Type of company_id: ${typeof dto.company_id}`);

    // Validasi company_id
    let companyIds: string[] = [];

    if (dto.company_id) {
      if (Array.isArray(dto.company_id)) {
        companyIds = dto.company_id;
      } else if (typeof dto.company_id === 'string') {
        // Handle string yang dipisahkan koma (e.g., "BIS,BIP")
        const companyIdString = dto.company_id as string;
        companyIds = companyIdString
          .split(',')
          .map((id: string) => id.trim())
          .filter((id: string) => id.length > 0);
      }
    }

    this.logger.log(`Parsed companyIds: ${JSON.stringify(companyIds)}`);

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

    // Validasi years
    if (!years || !Array.isArray(years) || years.length === 0) {
      throw new BadRequestException(
        'years array is required and cannot be empty',
      );
    }

    const uniqueYears = [...new Set(years)];
    const invalidYears = uniqueYears.filter(
      (year) => !/^\d{4}$/.test(year) || isNaN(parseInt(year)),
    );
    if (invalidYears.length > 0) {
      throw new BadRequestException(
        `Invalid years: ${invalidYears.join(', ')}. Must be in YYYY format (e.g., 2023)`,
      );
    }

    // Validasi months
    let monthNumbers: number[] = [];
    if (months && months.length > 0) {
      if (months.length > 6) {
        throw new BadRequestException('Maximum 6 months can be selected');
      }
      monthNumbers = months.map((m) => {
        const monthName = m.charAt(0).toUpperCase() + m.slice(1).toLowerCase();
        const monthIndex = monthMap.indexOf(monthName);
        if (monthIndex === -1) {
          throw new BadRequestException(
            `Invalid month: ${m}. Must be a valid month name (e.g., Jan, Feb, etc.)`,
          );
        }
        return monthIndex + 1;
      });
    }

    this.logger.log(`Month numbers: ${JSON.stringify(monthNumbers)}`);

    // Validasi company_id exists

    // Tentukan tahun sebelumnya untuk growth percentage
    const previousYears = uniqueYears
      .map((year) => (parseInt(year) - 1).toString())
      .filter((year) => !uniqueYears.includes(year));
    const allYears = [...uniqueYears, ...previousYears].map(Number);

    this.logger.log(`All years: ${JSON.stringify(allYears)}`);

    const salesTarget =
      companyIds.length > 1
        ? this.MULTIPLE_COMPANIES_SALES_TARGET
        : this.SINGLE_COMPANY_SALES_TARGET;

    // Query untuk salesperson invoice
    const salespersonInvoiceResult = await this.prisma.$queryRaw<
      {
        salesPersonName: string | null;
        year: number;
        total_amount: number;
        invoice_count: number;
      }[]
    >(Prisma.sql`
      SELECT 
        COALESCE("salesPersonName", 'UNKNOWN') AS "salesPersonName",
        EXTRACT(YEAR FROM "invoiceDate") AS "year",
        CAST(SUM("total_amount") AS DECIMAL) AS "total_amount",
        COUNT(*) AS "invoice_count"
      FROM 
        "sls_InvoiceHd"
      WHERE 
        "company_id" IN (${Prisma.join(companyIds)})
        AND "total_amount" > 0
        AND EXTRACT(YEAR FROM "invoiceDate") = ANY(${allYears}::integer[])
        ${monthNumbers.length > 0 ? Prisma.sql`AND EXTRACT(MONTH FROM "invoiceDate") IN (${Prisma.join(monthNumbers)})` : Prisma.empty}
      GROUP BY 
        COALESCE("salesPersonName", 'UNKNOWN'), EXTRACT(YEAR FROM "invoiceDate")
      HAVING 
        CAST(SUM("total_amount") AS DECIMAL) >= ${salesTarget}
      ORDER BY 
        "year", "total_amount" DESC;
    `);

    this.logger.log(
      `Raw query result: ${JSON.stringify(
        salespersonInvoiceResult.map((item) => ({
          salesPersonName: item.salesPersonName,
          year: item.year,
          total_amount: item.total_amount.toString(),
          invoice_count: Number(item.invoice_count),
        })),
        null,
        2,
      )}`,
    );

    // Proses data
    // Gabungkan per tahun dan per salesPersonName
    const yearlyData: Record<
      string,
      Record<
        string,
        {
          salesPersonName: string;
          amount: number;
          quantity: number;
          company_ids: Set<string>;
        }
      >
    > = {};

    salespersonInvoiceResult.forEach((item) => {
      const year = item.year.toString();
      const salesPerson = (item.salesPersonName || 'UNKNOWN')
        .toUpperCase()
        .trim();
      const amount = Math.round(Number(item.total_amount));
      const quantity = Number(item.invoice_count);
      // Tidak ada company_id di hasil query, jadi tidak perlu

      if (!yearlyData[year]) {
        yearlyData[year] = {};
      }
      if (!yearlyData[year][salesPerson]) {
        yearlyData[year][salesPerson] = {
          salesPersonName: salesPerson,
          amount: 0,
          quantity: 0,
          company_ids: new Set<string>(),
        };
      }
      yearlyData[year][salesPerson].amount += amount;
      yearlyData[year][salesPerson].quantity += quantity;
      // company_id sudah tidak ada di hasil query, jadi tidak perlu add
    });

    // Format data untuk respons
    const salespersonData = uniqueYears
      .map((year) => {
        const sales = yearlyData[year];
        if (!sales) {
          return {
            period: year,
            totalInvoice: 0,
            sales: [],
          };
        }

        const salesArray = Object.values(sales).map((entry) => {
          const previousYear = (parseInt(year) - 1).toString();
          const previousData =
            yearlyData[previousYear]?.[entry.salesPersonName];
          let growthPercentage: number = 0;

          if (previousData && previousData.amount > 0) {
            growthPercentage =
              ((entry.amount - previousData.amount) / previousData.amount) *
              100;
            growthPercentage = Math.round(growthPercentage * 10) / 10;
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
          sales: salesArray.sort((a, b) => b.amount - a.amount),
        };
      })
      .filter((entry) => entry !== null)
      .sort((a, b) => a.period.localeCompare(b.period));

    this.logger.log(
      `Final salesperson data: ${JSON.stringify(salespersonData, null, 2)}`,
    );

    return {
      company_id: dto.company_id, // Kembalikan array company_id
      module_id,
      subModule_id,
      data: salespersonData,
    };
  }

  // getYearlySalesPersonInvoiceFiltered (tidak diubah karena tidak diminta)
  async getYearlySalesPersonInvoiceFiltered(
    company_id: string,
    module_id: string,
    subModule_id: string,
    dto: yearlySalesDashboardDto,
  ) {
    const { years, salesPersonName } = dto;

    // Validasi years
    if (!years || !Array.isArray(years) || years.length === 0) {
      throw new BadRequestException(
        'Years array is required and cannot be empty',
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

    // Validasi salesPersonName (opsional)
    let salesPersonNames: string[] = [];
    if (
      salesPersonName &&
      Array.isArray(salesPersonName) &&
      salesPersonName.length > 0
    ) {
      salesPersonNames = [
        ...new Set(salesPersonName.map((name) => name.toUpperCase().trim())),
      ];
      const invalidNames = salesPersonNames.filter(
        (name) => !name || typeof name !== 'string',
      );
      if (invalidNames.length > 0) {
        throw new BadRequestException(
          `Invalid salesPersonName: ${invalidNames.join(', ')}. Must be non-empty strings`,
        );
      }
    }

    // Logging untuk debug
    console.log('salesPersonNames:', salesPersonNames);

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

    // Set sales target untuk single company
    const salesTarget = this.SINGLE_COMPANY_SALES_TARGET;

    // Query menggunakan $queryRaw
    const query = Prisma.sql`
    SELECT 
      "salesPersonName",
      EXTRACT(YEAR FROM "invoiceDate") AS "year",
      CAST(SUM("total_amount") AS DECIMAL) AS "total_amount",
      COUNT(*) AS "invoice_count"
    FROM 
      "sls_InvoiceHd"
    WHERE 
      "company_id" = ${company_id}
      AND "total_amount" > 0
      AND EXTRACT(YEAR FROM "invoiceDate") = ANY(${allYears})
      ${salesPersonNames.length > 0 ? Prisma.sql`AND "salesPersonName" IN (${Prisma.join(salesPersonNames)})` : Prisma.empty}
    GROUP BY 
      "salesPersonName", EXTRACT(YEAR FROM "invoiceDate")
    HAVING 
      CAST(SUM("total_amount") AS DECIMAL) >= ${salesTarget}
    ORDER BY 
      EXTRACT(YEAR FROM "invoiceDate"), SUM("total_amount") DESC;
  `;

    const salespersonInvoiceResult = await this.prisma.$queryRaw<
      {
        salesPersonName: string;
        year: number;
        total_amount: bigint;
        invoice_count: bigint;
      }[]
    >(query);

    // Konversi BigInt ke number untuk logging
    const serializedResult = salespersonInvoiceResult.map((item) => ({
      salesPersonName: item.salesPersonName,
      year: item.year,
      total_amount: Number(item.total_amount),
      invoice_count: Number(item.invoice_count),
    }));

    // Logging untuk debug
    console.log('Query result:', JSON.stringify(serializedResult, null, 2));

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
      const amount = Number(item.total_amount); // Konversi BigInt ke number
      const quantity = Number(item.invoice_count); // Konversi BigInt ke number

      if (!yearlyData[year]) {
        yearlyData[year] = {};
      }
      yearlyData[year][salesPerson] = {
        salesPersonName: salesPerson.toUpperCase().trim(),
        amount,
        quantity,
      };
    });

    // Hitung growth percentage
    const salespersonData = uniqueYears
      .map((year) => {
        const sales = yearlyData[year];
        if (!sales) {
          return {
            period: year,
            totalInvoice: 0,
            sales: [],
          };
        }

        const salesArray = Object.values(sales).map((entry) => {
          const previousYear = (parseInt(year) - 1).toString();
          const previousData =
            yearlyData[previousYear]?.[entry.salesPersonName];
          let growthPercentage: number = 0; // Default ke 0

          if (previousData && previousData.amount > 0) {
            growthPercentage =
              ((entry.amount - previousData.amount) / previousData.amount) *
              100;
            growthPercentage = Math.round(growthPercentage * 10) / 10; // 1 desimal
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
      .sort((a, b) => a.period.localeCompare(b.period));

    // Logging untuk debug
    console.log('salespersonData:', JSON.stringify(salespersonData, null, 2));

    // Format respons
    return {
      company_id,
      module_id,
      subModule_id,
      data: salespersonData,
    };
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
        ? salesPersonName.map((name) => name.toLocaleUpperCase().trim())
        : salesPersonName?.toLocaleUpperCase().trim() || null,
      years,
      data,
    };
  }
}
