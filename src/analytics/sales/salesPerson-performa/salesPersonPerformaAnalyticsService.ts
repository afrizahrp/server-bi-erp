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
            AND "total_amount" > 0
            AND "invoiceDate" BETWEEN ${formattedStartPeriod} AND ${formattedEndPeriod}
        GROUP BY 
            "salesPersonName", "period", "month_name", "year", "month_number"
        HAVING 
            CAST(SUM("total_amount") AS DECIMAL) >= 300000000
        ORDER BY 
            "year", "month_number", "total_amount" DESC;
    `;

    console.log(
      'Query Result:',
      result.length > 0 ? JSON.stringify(result, null, 2) : 'No data found',
    );

    if (result.length === 0) {
      console.log('No salespeople with total_amount >= 300 million found.');
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

      // Filter untuk memastikan amount >= 100 juta
      if (amount < 300000000) {
        console.log(
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

    console.log('Processed monthlyData:', JSON.stringify(monthlyData, null, 2));

    response.data = Object.values(monthlyData).map((entry) => {
      console.log(
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
              console.log(
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

    console.log('Final response:', JSON.stringify(response, null, 2));
    return response;
  }

  // afriza - get sales person by period with salesPersonName filter
  // get sales person invoice with salesPersonName, year, month filter
  async getMonthlySalesPersonInvoiceFiltered(
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

  //begin afriza - get sales person by period with salesPersonName filter

  // get growth percentage of sales person by month
  async getMonthlyComparisonSalesPersonInvoice(
    company_id: string,
    module_id: string,
    subModule_id: string,
    dto: salesAnalyticsDto,
  ) {
    console.log('Starting getMonthlySalespersonInvoice...', { dto });

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

    // Format tanggal sebagai string
    const formattedStartPeriod = format(startOfMonth(startDate), 'yyyy-MM-dd');
    const formattedEndPeriod = format(endOfMonth(endDate), 'yyyy-MM-dd');
    console.log('Formatted Periods:', {
      formattedStartPeriod,
      formattedEndPeriod,
    });

    // Build WHERE clause dengan Prisma.sql
    const whereConditions: string[] = [
      `"company_id" = $1`,
      `"trxType" = 'IV'`,
      `"invoiceDate" BETWEEN $2::timestamp AND $3::timestamp`, // Cast ke timestamp
    ];
    const whereParams: any[] = [
      company_id,
      formattedStartPeriod,
      formattedEndPeriod,
    ];

    if (salesPersonName && salesPersonName.length > 0) {
      const salesPersonNames = Array.isArray(salesPersonName)
        ? salesPersonName
        : [salesPersonName];
      whereConditions.push(
        `"salesPersonName" IN (${salesPersonNames.map((_, i) => `$${i + 4}`).join(',')})`,
      );
      whereParams.push(...salesPersonNames);
    }

    const whereClause = whereConditions.join(' AND ');
    console.log('Where Clause:', whereClause);
    console.log('Where Params:', whereParams);

    console.log('Executing query...');
    const result = await this.prisma.$queryRawUnsafe<
      {
        salesPersonName: string;
        period: string;
        month_name: string;
        year: number;
        month_number: number;
        total_amount: number;
      }[]
    >(
      `
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
          ${whereClause}
      GROUP BY 
          "salesPersonName", "period", "month_name", "year", "month_number"
      HAVING 
          CAST(SUM("total_amount") AS DECIMAL) >= 300000000
      ORDER BY 
          "year", "month_number", "total_amount" DESC;
    `,
      ...whereParams,
    );

    console.log(
      'Query Result:',
      result.length > 0 ? JSON.stringify(result, null, 2) : 'No data found',
    );

    if (result.length === 0) {
      console.log('No salespeople with total_amount >= 300 million found.');
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
            // previousAmounts: number | null;
            growthPercentage: number | null;
          }[]
        >;
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

      if (!monthlyData[year]) {
        monthlyData[year] = { period: year, totalInvoice: 0, months: {} };
      }
      if (!monthlyData[year].months[monthKey]) {
        monthlyData[year].months[monthKey] = [];
      }

      monthlyData[year].months[monthKey].push({
        salesPersonName: salesPerson,
        amount,
        // previousAmounts: null,
        growthPercentage: null,
      });
      monthlyData[year].totalInvoice += amount;
    });

    console.log('Processed monthlyData:', JSON.stringify(monthlyData, null, 2));

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

        // Query data tahun sebelumnya, dengan filter salesPersonName jika ada
        const previousWhereConditions: string[] = [
          `"company_id" = $1`,
          `"trxType" = 'IV'`,
          `"trxStatus" = '1'`,
          `"invoiceDate" BETWEEN $2::timestamp AND $3::timestamp`, // Cast ke timestamp
        ];
        const previousWhereParams: any[] = [
          company_id,
          previousYearStart,
          previousYearEnd,
        ];

        if (salesPersonName && salesPersonName.length > 0) {
          const salesPersonNames = Array.isArray(salesPersonName)
            ? salesPersonName
            : [salesPersonName];
          previousWhereConditions.push(
            `"salesPersonName" IN (${salesPersonNames.map((_, i) => `$${i + 4}`).join(',')})`,
          );
          previousWhereParams.push(...salesPersonNames);
        }

        const previousWhereClause = previousWhereConditions.join(' AND ');
        console.log('Previous Where Clause:', previousWhereClause);
        console.log('Previous Where Params:', previousWhereParams);

        const previousResult = await this.prisma.$queryRawUnsafe<
          {
            salesPersonName: string;
            total_amount: number;
          }[]
        >(
          `
          SELECT 
              "salesPersonName",
              CAST(SUM("total_amount") AS DECIMAL) AS "total_amount"
          FROM 
              "sls_InvoiceHd"
          WHERE 
              ${previousWhereClause}
          GROUP BY 
              "salesPersonName";
        `,
          ...previousWhereParams,
        );

        // Buat peta untuk data tahun sebelumnya
        const previousAmounts: Record<string, number> = {};
        previousResult.forEach((item) => {
          const salesPerson = item.salesPersonName || 'Unknown';
          previousAmounts[salesPerson] = Number(item.total_amount) || 0;
        });

        // Hitung growth percentage untuk setiap salesperson di bulan ini
        monthlyData[year].months[monthKey].forEach((salesEntry) => {
          const salesPerson = salesEntry.salesPersonName;
          const currentAmount = salesEntry.amount;
          const previousAmount = previousAmounts[salesPerson] || 0;

          // salesEntry.previousAmounts = Math.round(previousAmount);

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

          salesEntry.growthPercentage = growthPercentage;
        });
      }
    }

    response.data = Object.values(monthlyData).map((entry) => {
      console.log(
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
              console.log(
                `Final sales entry for ${month} ${entry.period}: ${sales.salesPersonName} - ${sales.amount} 
                (Growth: ${sales.growthPercentage}%)`,
              );
              return {
                salesPersonName: sales.salesPersonName.toLocaleUpperCase(),
                amount: Math.round(sales.amount),
                // previousAmounts: sales.previousAmounts,
                growthPercentage: sales.growthPercentage,
              };
            });
          return { month, sales };
        }),
      };
    });

    console.log('Final response:', JSON.stringify(response, null, 2));
    return response;
  }

  //afriza end of getMonthlyComparisonSalesPersonInvoice

  async getMonthlyProductSoldFromSalesPersonFiltered(
    company_id: string,
    module_id: string,
    subModule_id: string,
    dto: salesAnalyticsDto,
  ) {
    const {
      salesPersonName,
      yearPeriod,
      monthPeriod,
      sortBy = 'total_amount',
    } = dto;

    this.logger.debug(
      `Received params: company_id=${company_id}, salesPersonName=${salesPersonName}, yearPeriod=${yearPeriod}, monthPeriod=${monthPeriod}, sortBy=${sortBy}`,
    );

    // Validasi input
    if (!salesPersonName) {
      throw new BadRequestException('salesPersonName is required');
    }

    if (!yearPeriod || !monthPeriod) {
      throw new BadRequestException('yearPeriod and monthPeriod are required');
    }

    // Parsing periode
    const period = `${monthPeriod}${yearPeriod}`;
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
        salesPersonName: {
          equals: salesPersonName,
          mode: 'insensitive',
        },
        invoiceDate: {
          gte: new Date(formattedStartPeriod),
          lte: new Date(formattedEndPeriod),
        },
      },
    };

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
        : salesPersonName.toUpperCase(),
      yearPeriod,
      monthPeriod,
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

  async getSalespersonFilteredSummary(
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

    // Validasi salesPersonName
    if (
      !salesPersonName ||
      (Array.isArray(salesPersonName) && salesPersonName.length === 0)
    ) {
      throw new BadRequestException('salesPersonName is required');
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

    const salesPersonNames = Array.isArray(salesPersonName)
      ? salesPersonName
      : [salesPersonName];
    where.salesPersonName = { in: salesPersonNames, mode: 'insensitive' };

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
      if (!monthlyData[year]) {
        monthlyData[year] = {
          period: year,
          salesPersonName: salesPerson.toLocaleUpperCase(),
          totalInvoice: 0,
          months: monthMap.map((month) => ({
            month,
            amount: 0,
            growthPercentage: null,
          })),
          previousYearInvoice: 0,
          highestMonth: { month: '', amount: 0 },
          lowestMonth: { month: '', amount: Number.MAX_VALUE },
          averageMonthlySales: 0,
          targetSalesSuggestion: 0,
        };
      }

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
        by: ['salesPersonName', 'invoiceDate'],
        where: {
          company_id,
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
      monthlyData[year].previousYearInvoice = previousTotal;

      // Proses data untuk periode saat ini
      result
        .filter((item) => item.salesPersonName === salesPerson)
        .forEach((item) => {
          const monthIdx = item.invoiceDate.getMonth();
          const amount = Math.round(Number(item._sum.total_amount || 0));

          const monthEntry = monthlyData[year].months[monthIdx];
          monthEntry.amount += amount;
          monthlyData[year].totalInvoice += amount;
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
          by: ['salesPersonName', 'invoiceDate'],
          where: {
            company_id,
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
        const currentAmount = monthlyData[year].months[monthIdx].amount;

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
        monthlyData[year].months[monthIdx].growthPercentage = growthPercentage;
      }

      // Hitung agregat
      const monthlyAmounts = monthlyData[year].months.map((m) => m.amount);
      monthlyData[year].highestMonth = monthlyData[year].months.reduce(
        (max, current) => (current.amount > max.amount ? current : max),
        { month: '', amount: 0 },
      );
      monthlyData[year].lowestMonth = monthlyData[year].months.reduce(
        (min, current) => (current.amount < min.amount ? current : min),
        { month: '', amount: Number.MAX_VALUE },
      );
      monthlyData[year].averageMonthlySales = monthlyAmounts.length // Hitung Total Penjualan Bulanan / Jumlah Bulan
        ? Math.round(
            monthlyAmounts.reduce((sum, a) => sum + a, 0) /
              monthlyAmounts.length,
          )
        : 0;
      monthlyData[year].targetSalesSuggestion = Math.round(
        monthlyData[year].averageMonthlySales * 12 * 1.1, // Target 10% lebih tinggi dari rata-rata tahunan
      );
    }

    // Transform data ke format akhir
    response.data = Object.values(monthlyData).map((entry: any) => {
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

    return response;
  }
}
