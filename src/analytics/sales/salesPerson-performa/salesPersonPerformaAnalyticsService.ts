import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { salesAnalyticsDto } from '../dto/salesAnalytics.dto';
import { format, parse, startOfMonth, endOfMonth } from 'date-fns';
import { monthMap } from 'src/utils/date/getMonthName';

@Injectable()
export class salesPersonPerformaAnalyticsService {
  private readonly logger = new Logger(
    salesPersonPerformaAnalyticsService.name,
  );

  constructor(private readonly prisma: PrismaService) {}

  //afriza top N sales person

  async getByTopNSalesPersonByPeriod(
    company_id: string,
    module_id: string,
    subModule_id: string,
    dto: salesAnalyticsDto,
  ) {
    console.log('Starting getByTopNSalesPersonByPeriod...');

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

    const formattedStartPeriod = new Date(
      format(startOfMonth(startDate), 'yyyy-MM-dd'),
    );
    const formattedEndPeriod = new Date(
      format(endOfMonth(endDate), 'yyyy-MM-dd'),
    );

    console.log('Executing query...');
    // Query untuk mendapatkan data per bulan dengan filter total_amount >= 300 juta
    const result = await this.prisma.$queryRaw<
      {
        salesPersonName: string;
        period: string;
        month_name: string;
        year: number;
        month_number: number;
        total_amount: number;
      }[]
    >`
      SELECT 
        "salesPersonName",
        TO_CHAR("invoiceDate", 'YYYY-MM') AS "period",
        TO_CHAR("invoiceDate", 'Mon') AS "month_name",
        EXTRACT(YEAR FROM "invoiceDate") AS "year",
        EXTRACT(MONTH FROM "invoiceDate") AS "month_number",
        CAST(SUM("total_amount") AS DECIMAL) AS "total_amount"
      FROM 
        "sls_InvoiceHd"
      WHERE 
        "company_id" = ${company_id}
        AND "trxType" = 'IV'
        AND "invoiceDate" BETWEEN ${formattedStartPeriod} AND ${formattedEndPeriod}
      GROUP BY 
        "salesPersonName", "period", "month_name", "year", "month_number"
      HAVING 
        CAST(SUM("total_amount") AS DECIMAL) >= 100000000
      ORDER BY 
        "year", "month_number", "total_amount" DESC;
    `;

    // Log hasil query
    console.log(
      'Query Result:',
      result.length > 0 ? JSON.stringify(result, null, 2) : 'No data found',
    );

    // Jika hasil query kosong, kembalikan response kosong
    if (result.length === 0) {
      console.log('No salespeople with total_amount >= 100 million found.');
      return {
        company_id,
        module_id,
        subModule_id,
        data: [],
      };
    }

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

    console.log('Starting result.forEach loop...');
    result.forEach((item, index) => {
      console.log(`Processing item ${index}:`, JSON.stringify(item, null, 2));

      const year = item.year.toString();
      const monthKey = monthMap.find(
        (m) => m.toLowerCase() === item.month_name.toLowerCase().slice(0, 3),
      );

      if (!monthKey) {
        console.log(`Invalid month_name: ${item.month_name}`);
        throw new Error(`Invalid month_name: ${item.month_name}`);
      }

      const salesPerson = item.salesPersonName || 'Unknown';
      const amount = Number(item.total_amount);
      console.log(
        `Converted amount for ${salesPerson} in ${monthKey} ${year}: ${amount}`,
      );

      if (isNaN(amount)) {
        console.log(
          `Invalid amount for ${salesPerson} in ${monthKey} ${year}: ${item.total_amount}`,
        );
        return;
      }

      // Log untuk memastikan data memenuhi filter
      console.log(
        `Processing ${salesPerson} for ${monthKey} ${year}: ${amount} >= 100 million`,
      );

      // Filter sudah ditangani oleh HAVING clause, jadi tidak perlu filter ulang
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

    console.log('Processed monthlyData:', JSON.stringify(monthlyData, null, 2));

    response.data = Object.values(monthlyData).map((entry) => ({
      period: entry.period,
      totalInvoice: Math.round(entry.totalInvoice),
      months: monthMap.map((month) => ({
        month,
        sales: (entry.months[month] || [])
          .sort((a, b) => b.amount - a.amount) // Urutkan berdasarkan amount
          .slice(0, 5) // Ambil 5 teratas per bulan
          .map((sales) => ({
            salesPersonName: sales.salesPersonName.toLocaleUpperCase(),
            amount: Math.round(sales.amount),
          })),
      })),
    }));

    console.log('Final response:', JSON.stringify(response, null, 2));
    return response;
  }

  // afriza - get sales person by period with salesPersonName filter
  async getBySalesPersonByPeriod(
    company_id: string,
    module_id: string,
    subModule_id: string,
    dto: salesAnalyticsDto,
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
}
