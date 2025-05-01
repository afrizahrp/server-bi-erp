import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { sls_analyticsDto } from '../dto/sls_person-performa-analytics.dto';
import { format, parse, startOfMonth, endOfMonth } from 'date-fns';
import { monthMap } from 'src/utils/date/getMonthName';

type MonthlySalesResult = {
  salesPersonName: string | null;
  month_name: string;
  year: number;
  total_amount: number;
};

@Injectable()
export class sls_AnalythicsService {
  private readonly logger = new Logger(sls_AnalythicsService.name);

  constructor(private readonly prisma: PrismaService) {}

  //afriza top N sales person

  async getByTopNSalesPersonByPeriod(
    company_id: string,
    module_id: string,
    subModule_id: string,
    dto: sls_analyticsDto,
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

    // Prepare periode
    // const formattedStartPeriod = format(startOfMonth(startDate), 'yyyy-MM-dd');
    // const formattedEndPeriod = format(endOfMonth(endDate), 'yyyy-MM-dd');

    const formattedStartPeriod = new Date(
      format(startOfMonth(startDate), 'yyyy-MM-dd'),
    );
    const formattedEndPeriod = new Date(
      format(endOfMonth(endDate), 'yyyy-MM-dd'),
    );

    // Query SQL untuk mendapatkan data
    const result = await this.prisma.$queryRaw<MonthlySalesResult[]>`
    WITH "MonthlySales" AS (
      SELECT 
        "salesPersonName",
        TO_CHAR("invoiceDate", 'YYYY-MM') AS "period",
        TO_CHAR("invoiceDate", 'Mon') AS "month_name",
        EXTRACT(YEAR FROM "invoiceDate") AS "year",
        EXTRACT(MONTH FROM "invoiceDate") AS "month_number",
        SUM("total_amount") AS "total_amount"
      FROM 
        "sls_InvoiceHd"
      WHERE 
        "company_id" = ${company_id}
        AND "trxType" = 'IV'
        AND "invoiceDate" BETWEEN ${formattedStartPeriod} AND ${formattedEndPeriod}
      GROUP BY 
        "salesPersonName", "period", "month_name", "year", "month_number"
      HAVING 
        SUM("total_amount") >= 50000000
    )
    SELECT 
      "salesPersonName",
      "period",
      "month_name",
      "month_number",
      "year",
      "total_amount"
    FROM 
      "MonthlySales"
    ORDER BY 
      "year", "month_number", "total_amount" DESC;
  `;

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

    // Proses data bulanan
    const monthlyData: Record<
      string,
      {
        period: string;
        totalInvoice: number;
        months: Record<string, { salesPersonName: string; amount: number }[]>;
      }
    > = {};

    result.forEach((item) => {
      const year = item.year.toString();
      const monthKey = monthMap.find(
        (m) => m.toLowerCase() === item.month_name.toLowerCase().slice(0, 3),
      );

      if (!monthKey) {
        throw new Error(`Invalid month_name: ${item.month_name}`);
      }

      const salesPerson = item.salesPersonName || 'Unknown';
      const amount = parseFloat(item.total_amount.toString()) || 0;

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

    response.data = Object.values(monthlyData).map((entry) => ({
      period: entry.period,
      totalInvoice: Math.round(entry.totalInvoice),
      months: monthMap.map((month) => ({
        month,
        sales: (entry.months[month] || [])
          .sort((a, b) => b.amount - a.amount) // Urutkan berdasarkan amount
          .map((sales) => ({
            salesPersonName: sales.salesPersonName.toLocaleUpperCase(),
            amount: Math.round(sales.amount), // Bulatkan nilai
          })),
      })),
    }));

    return response;
  }

  // afriza - get sales person by period with salesPersonName filter
  async getBySalesPersonByPeriod(
    company_id: string,
    module_id: string,
    subModule_id: string,
    dto: sls_analyticsDto,
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

    // const monthMap = [
    //   'Jan',
    //   'Feb',
    //   'Mar',
    //   'Apr',
    //   'May',
    //   'Jun',
    //   'Jul',
    //   'Aug',
    //   'Sep',
    //   'Oct',
    //   'Nov',
    //   'Dec',
    // ];

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

    return response;
  }

  async getProductSoldCountBySalesPerson(
    company_id: string,
    salesPersonName: string,
    yearPeriod: string,
    monthPeriod: string,
    sortBy: string,
  ) {
    this.logger.debug(
      `Received params: company_id=${company_id}, salesPersonName=${salesPersonName}, yearPeriod=${yearPeriod}, monthPeriod=${monthPeriod}`,
    );

    if (!salesPersonName) {
      throw new BadRequestException('salesPersonName is required');
    }

    if (!yearPeriod || !monthPeriod) {
      throw new BadRequestException('yearPeriod and monthPeriod are required');
    }

    const period = `${monthPeriod}${yearPeriod}`;

    // Parsing periode
    let startDate: Date, endDate: Date;

    try {
      startDate = parse(period, 'MMMyyyy', new Date());
      endDate = parse(period, 'MMMyyyy', new Date());
    } catch (error) {
      throw new BadRequestException(
        'yearPeriod and monthPeriod must form a valid period in MMMYYYY format (e.g., Jan2024)',
      );
    }

    const formattedStartPeriod = format(startOfMonth(startDate), 'yyyy-MM-dd');
    const formattedEndPeriod = format(endOfMonth(endDate), 'yyyy-MM-dd');

    const companyExists = await this.prisma.sls_InvoiceHd.findFirst({
      where: { company_id },
    });
    if (!companyExists) {
      throw new NotFoundException(`Company ID ${company_id} not found`);
    }

    const results = await this.prisma.sls_InvoiceDt.groupBy({
      by: ['productName'],
      _sum: {
        qty: true,
        total_amount: true,
      },
      where: {
        company_id,
        sls_InvoiceHd: {
          company_id,
          trxType: 'IV',
          salesPersonName: {
            equals: salesPersonName,
            mode: 'insensitive',
          },
          invoiceDate: {
            gte: new Date(formattedStartPeriod),
            lte: new Date(formattedEndPeriod),
          },
        },
      },
      orderBy: {
        _sum: {
          [sortBy]: 'desc', // Gunakan parameter sort untuk menentukan kolom yang diurutkan
        },
      },
      take: 3, // Ambil 3 besar
    });

    const data = results.map((result) => ({
      productName: result.productName.trim(),
      qty: result._sum.qty ? Math.round(Number(result._sum.qty)) : 0,
      total_amount: result._sum.total_amount
        ? Math.round(Number(result._sum.total_amount))
        : 0,
    }));

    return {
      company_id,
      module_id: 'ANT',
      subModule_id: 'sls',
      salesPersonName: salesPersonName.toUpperCase(),
      data,
    };
  }
}
