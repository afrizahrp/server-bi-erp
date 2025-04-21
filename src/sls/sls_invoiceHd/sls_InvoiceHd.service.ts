import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { sls_PaginationInvoiceHdDto } from './dto/sls_PaginationInvoiceHd.dto';
import { sls_ResponseInvoiceHdDto } from './dto/sls_ResponseInvoiceHd.dto';
import { sls_ResponseInvoiceHdWithDetailDto } from './dto/sls_ResponseInvoiceDt.dto';

import { InvoicePaidStatusEnum } from '@prisma/client';

import { format, isValid, startOfMonth, endOfMonth, parse } from 'date-fns';

import { zonedTimeToUtc } from 'date-fns-tz';

const zone = 'Asia/Jakarta';

@Injectable()
export class sls_InvoiceHdService {
  constructor(private readonly prisma: PrismaService) {}

  // async findAll(
  //   company_id: string,
  //   module_id: string,
  //   paginationDto: sls_PaginationInvoiceHdDto,
  // ): Promise<{ data: sls_ResponseInvoiceHdDto[]; totalRecords: number }> {
  //   const {
  //     page = 1,
  //     limit = 20,
  //     status,
  //     salesPersonName,
  //     startPeriod,
  //     endPeriod,
  //     searchBy,
  //     searchTerm,
  //     // startDate,
  //     // endDate,
  //   } = paginationDto;

  //   // Limit default max 100
  //   const safeLimit = Math.min(Number(limit) || 10, 1000);
  //   const offset = (Number(page) - 1) * safeLimit;
  //   // const allowedSearchFields = ['invoice_id', 'customerName']; // contoh

  //   const whereCondition: Record<string, any> = {
  //     company_id,
  //   };

  //   whereCondition.total_amount = {
  //     gt: 10000, // 'gt' berarti 'greater than'
  //   };

  //   if (
  //     searchBy &&
  //     typeof searchTerm === 'string' &&
  //     searchTerm.trim() !== ''
  //   ) {
  //     const searchWords = searchTerm.trim().split(/\s+/);

  //     whereCondition.AND = searchWords.map((word) => ({
  //       [searchBy]: {
  //         contains: word,
  //         mode: 'insensitive',
  //       },
  //     }));
  //   }

  //   if (status) {
  //     whereCondition.paidStatus = {
  //       in: status.split(','),
  //     };
  //   }

  //   if (typeof salesPersonName === 'string' && salesPersonName.trim() !== '') {
  //     const parsedSalesPerson = salesPersonName
  //       .split(',')
  //       .map((name) => name.trim())
  //       .filter((name) => name !== '');

  //     if (parsedSalesPerson.length > 0) {
  //       whereCondition.AND = whereCondition.AND || [];

  //       whereCondition.AND.push({
  //         OR: parsedSalesPerson.map((name) => ({
  //           salesPersonName: {
  //             contains: name,
  //             mode: 'insensitive',
  //           },
  //         })),
  //       });
  //     }
  //   }

  //   const normalizeMonthYear = (input: string): string => {
  //     const match = input.match(/^([a-zA-Z]{3})[-]?(\d{4})$/);
  //     if (!match) return input;
  //     const month =
  //       match[1].charAt(0).toUpperCase() + match[1].slice(1).toLowerCase();
  //     const year = match[2];
  //     return `${month}-${year}`;
  //   };

  //   if (startPeriod) {
  //     console.log('startPeriod:', startPeriod);

  //     const formattedStartPeriod = normalizeMonthYear(startPeriod);

  //     const parsedStartLocal = parse(
  //       `${formattedStartPeriod}-01`,
  //       'MMM-yyyy-dd',
  //       new Date(),
  //     );
  //     console.log('parsedStartLocal:', parsedStartLocal.toString());

  //     if (!isValid(parsedStartLocal)) {
  //       throw new Error(
  //         'Invalid startPeriod format. Use MMM-yyyy (e.g., Jan-2025)',
  //       );
  //     }

  //     // Set zona waktu UTC langsung
  //     const parsedStart = new Date(
  //       Date.UTC(
  //         parsedStartLocal.getFullYear(),
  //         parsedStartLocal.getMonth(),
  //         parsedStartLocal.getDate(),
  //       ),
  //     );

  //     console.log('Start UTC:', parsedStart.toISOString());

  //     // Update whereCondition menggunakan waktu UTC yang sudah disesuaikan
  //     whereCondition.invoiceDate = {
  //       ...(whereCondition.invoiceDate ?? {}),
  //       gte: parsedStart,
  //     };
  //   }

  //   if (endPeriod) {
  //     console.log('endPeriod:', endPeriod);

  //     const formattedEndPeriod = normalizeMonthYear(endPeriod);

  //     const parsedEndLocal = parse(
  //       `${formattedEndPeriod}-01`,
  //       'MMM-yyyy-dd',
  //       new Date(),
  //     );
  //     console.log('parsedEndLocal:', parsedEndLocal.toString());

  //     if (!isValid(parsedEndLocal)) {
  //       throw new Error(
  //         'Invalid endPeriod format. Use MMM-yyyy (e.g., Feb-2025)',
  //       );
  //     }

  //     // Set zona waktu UTC langsung dan hitung tanggal terakhir bulan
  //     const parsedEnd = new Date(
  //       Date.UTC(
  //         parsedEndLocal.getFullYear(),
  //         parsedEndLocal.getMonth() + 1, // Pindahkan ke bulan berikutnya
  //         0, // 0 hari di bulan berikutnya berarti tanggal terakhir bulan sebelumnya
  //       ),
  //     );

  //     console.log('End UTC:', parsedEnd.toISOString());

  //     // Update whereCondition dengan tanggal terakhir bulan UTC
  //     whereCondition.invoiceDate = {
  //       ...(whereCondition.invoiceDate ?? {}),
  //       lte: parsedEnd,
  //     };
  //   }

  //   // Handle startDate and endDate (existing logic)
  //   // if (startDate || endDate) {
  //   //   whereCondition.invoiceDate = whereCondition.invoiceDate || {};

  //   //   if (startDate) {
  //   //     whereCondition.invoiceDate.gte = new Date(startDate);
  //   //   }

  //   //   if (endDate) {
  //   //     whereCondition.invoiceDate.lte = new Date(endDate);
  //   //   }
  //   // }

  //   // if (startDate || endDate) {
  //   //   whereCondition.invoiceDate = {};

  //   //   if (startDate) {
  //   //     whereCondition.invoiceDate.gte = new Date(startDate);
  //   //   }

  //   //   if (endDate) {
  //   //     whereCondition.invoiceDate.lte = new Date(endDate);
  //   //   }
  //   // }
  //   const orderField = paginationDto.orderBy ?? 'invoiceDate';
  //   const orderDirection = paginationDto.orderDir === 'asc' ? 'asc' : 'desc';
  //   const [totalRecords, invoices] = await Promise.all([
  //     this.prisma.sls_InvoiceHd.count({ where: whereCondition }),
  //     this.prisma.sls_InvoiceHd.findMany({
  //       where: whereCondition,
  //       skip: offset,
  //       take: safeLimit,
  //       include: {
  //         sls_InvoiceType: true,
  //         sls_InvoicePoType: true,
  //       },
  //       orderBy: {
  //         [orderField]: orderDirection,
  //       },
  //     }),
  //   ]);

  //   const formattedInvoices = invoices.map((invoice) =>
  //     this.mapToResponseDto(invoice),
  //   );

  //   return { data: formattedInvoices, totalRecords };
  // }

  async findAll(
    company_id: string,
    module_id: string,
    paginationDto: sls_PaginationInvoiceHdDto,
  ): Promise<{ data: sls_ResponseInvoiceHdDto[]; totalRecords: number }> {
    const {
      page = 1,
      limit = 20,
      status,
      salesPersonName,
      startPeriod,
      endPeriod,
      searchBy,
      searchTerm,
    } = paginationDto;

    // Limit default max 1000
    const safeLimit = Math.min(Number(limit) || 10, 1000);
    const offset = (Number(page) - 1) * safeLimit;

    const whereCondition: Record<string, any> = {
      company_id,
      total_amount: {
        gt: 10000,
      },
    };

    // Pencarian berdasarkan searchBy dan searchTerm
    if (
      searchBy &&
      typeof searchTerm === 'string' &&
      searchTerm.trim() !== ''
    ) {
      const searchWords = searchTerm.trim().split(/\s+/);
      whereCondition.AND = searchWords.map((word) => ({
        [searchBy]: {
          contains: word,
          mode: 'insensitive',
        },
      }));
    }

    // Filter berdasarkan status
    if (status) {
      whereCondition.paidStatus = {
        in: status.split(','),
      };
    }

    // Filter berdasarkan salesPersonName
    if (typeof salesPersonName === 'string' && salesPersonName.trim() !== '') {
      const parsedSalesPerson = salesPersonName
        .split(',')
        .map((name) => name.trim())
        .filter((name) => name !== '');
      if (parsedSalesPerson.length > 0) {
        whereCondition.AND = whereCondition.AND || [];
        whereCondition.AND.push({
          OR: parsedSalesPerson.map((name) => ({
            salesPersonName: {
              contains: name,
              mode: 'insensitive',
            },
          })),
        });
      }
    }

    // Normalisasi format bulan-tahun
    const normalizeMonthYear = (input: string): string => {
      const match = input.match(/^([a-zA-Z]{3})[- ]?(\d{4})$/);
      if (!match) return input;
      const month =
        match[1].charAt(0).toUpperCase() + match[1].slice(1).toLowerCase();
      const year = match[2];
      return `${month}-${year}`;
    };

    // Validasi rentang startPeriod dan endPeriod
    if (startPeriod && endPeriod) {
      const formattedStartPeriod = normalizeMonthYear(startPeriod);
      const formattedEndPeriod = normalizeMonthYear(endPeriod);
      const parsedStart = parse(
        `${formattedStartPeriod}-01`,
        'MMM-yyyy-dd',
        new Date(),
      );
      const parsedEnd = parse(
        `${formattedEndPeriod}-01`,
        'MMM-yyyy-dd',
        new Date(),
      );
      if (!isValid(parsedStart) || !isValid(parsedEnd)) {
        throw new Error('Invalid period format. Use MMM-yyyy (e.g., Jan-2023)');
      }
      if (parsedEnd < parsedStart) {
        throw new Error('endPeriod cannot be earlier than startPeriod');
      }
    }

    // Filter startPeriod
    if (startPeriod) {
      console.log('startPeriod:', startPeriod);
      const formattedStartPeriod = normalizeMonthYear(startPeriod);
      const parsedStartLocal = parse(
        `${formattedStartPeriod}-01`,
        'MMM-yyyy-dd',
        new Date(),
      );
      console.log('parsedStartLocal:', parsedStartLocal.toString());
      if (!isValid(parsedStartLocal)) {
        throw new Error(
          'Invalid startPeriod format. Use MMM-yyyy (e.g., Jan-2023)',
        );
      }
      const parsedStart = new Date(
        Date.UTC(
          parsedStartLocal.getFullYear(),
          parsedStartLocal.getMonth(),
          1,
        ),
      );
      console.log('Start UTC:', parsedStart.toISOString());
      whereCondition.invoiceDate = {
        ...(whereCondition.invoiceDate ?? {}),
        gte: parsedStart,
      };
    }

    // Filter endPeriod
    if (endPeriod) {
      console.log('endPeriod:', endPeriod);
      const formattedEndPeriod = normalizeMonthYear(endPeriod);
      const parsedEndLocal = parse(
        `${formattedEndPeriod}-01`,
        'MMM-yyyy-dd',
        new Date(),
      );
      console.log('parsedEndLocal:', parsedEndLocal.toString());
      if (!isValid(parsedEndLocal)) {
        throw new Error(
          'Invalid endPeriod format. Use MMM-yyyy (e.g., Jan-2023)',
        );
      }
      const parsedEnd = new Date(
        Date.UTC(
          parsedEndLocal.getFullYear(),
          parsedEndLocal.getMonth() + 1,
          0,
        ),
      );
      console.log('End UTC:', parsedEnd.toISOString());
      whereCondition.invoiceDate = {
        ...(whereCondition.invoiceDate ?? {}),
        lte: parsedEnd,
      };
    }

    // Eksekusi kueri
    const orderField = paginationDto.orderBy ?? 'invoiceDate';
    const orderDirection = paginationDto.orderDir === 'asc' ? 'asc' : 'desc';
    const [totalRecords, invoices] = await Promise.all([
      this.prisma.sls_InvoiceHd.count({ where: whereCondition }),
      this.prisma.sls_InvoiceHd.findMany({
        where: whereCondition,
        skip: offset,
        take: safeLimit,
        include: {
          sls_InvoiceType: true,
          sls_InvoicePoType: true,
        },
        orderBy: {
          [orderField]: orderDirection,
        },
      }),
    ]);

    // Format respons
    const formattedInvoices = invoices.map((invoice) =>
      this.mapToResponseDto(invoice),
    );

    return { data: formattedInvoices, totalRecords };
  }

  async findOne(
    company_id: string,
    invoice_id: string,
  ): Promise<sls_ResponseInvoiceHdWithDetailDto> {
    const invoice = await this.prisma.sls_InvoiceHd.findUnique({
      where: { company_id_invoice_id: { company_id, invoice_id } },
      include: {
        sls_InvoiceDt: true,
      },
    });

    if (!invoice) {
      throw new NotFoundException(`Invoice with ID ${invoice_id} not found`);
    }

    const header = this.mapToResponseDto(invoice);

    const details = invoice.sls_InvoiceDt.map((dt) => ({
      invoice_id: dt.invoice_id.trim(),
      line_no: dt.line_no,
      product_id: dt.product_id.trim(),
      productName: dt.productName?.trim(),
      uom_id: dt.uom_id.trim(),
      unitPrice: dt.unitPrice ? Number(dt.unitPrice) : 0,
      qty: dt.qty ? Number(dt.qty) : 0,
      sellingPrice: dt.sellingPrice ? Number(dt.sellingPrice) : 0,
      base_amount: dt.base_amount ? Number(dt.base_amount) : 0,
      discount_amount: dt.discount_amount ? Number(dt.discount_amount) : 0,
      delivery_amount: dt.delivery_amount ? Number(dt.delivery_amount) : 0,
      tax_amount: dt.tax_amount ? Number(dt.tax_amount) : 0,
      total_amount: dt.total_amount ? Number(dt.total_amount) : 0,
    }));

    return {
      ...header,
      details,
    };
  }

  async filterInvoicesBySalesPerson(
    company_id: string,
    module_id: string,
    salesPersonName: string,
  ): Promise<sls_ResponseInvoiceHdDto[]> {
    const whereCondition: any = { company_id };

    if (salesPersonName) {
      whereCondition.salesPersonName = {
        contains: salesPersonName,
        mode: 'insensitive',
      };
    }

    const invoices = await this.prisma.sls_InvoiceHd.findMany({
      where: whereCondition,
      orderBy: { createdAt: 'desc' },
    });

    return invoices.map((invoice) => this.mapToResponseDto(invoice));
  }

  async filterAllInvoicesBySalesPersonName(
    company_id: string,
    module_id: string,
    // customerName?: string,
    paidStatus?: string,
  ): Promise<{ id: string; name: string; count: number }[]> {
    const whereCondition: any = { company_id };

    whereCondition.total_amount = {
      gt: 10000,
    };

    // if (customerName) {
    //   whereCondition.customerName = {
    //     contains: customerName,
    //     mode: 'insensitive',
    //   };
    // }

    if (paidStatus) {
      whereCondition.paidStatus = {
        in: paidStatus.split(','),
      };
    }

    const salesPersons = await this.prisma.sls_InvoiceHd.groupBy({
      by: ['salesPerson_id'],
      where: whereCondition,
      _count: { _all: true },
    });

    if (!salesPersons || salesPersons.length === 0) {
      throw new NotFoundException(
        `No sales persons found for the given criteria`,
      );
    }

    const salesPersonDetails = await this.prisma.sls_SalesPerson.findMany({
      where: {
        id: {
          in: salesPersons
            .map((s) => s.salesPerson_id)
            .filter((id): id is string => id !== null),
        },
      },
      select: {
        id: true,
        name: true,
      },
    });

    const salesPersonList = salesPersons
      .map((s) => {
        const detail = salesPersonDetails.find(
          (sp) => sp.id === s.salesPerson_id,
        );
        return {
          // id: s.salesPerson_id?.trim(),
          id: detail?.name?.trim() || 'Unknown',
          name: detail?.name?.trim() || 'Unknown',
          count: s._count._all,
        };
      })
      .filter((s) => s.name !== 'Unknown');

    return salesPersonList.sort((a, b) => b.count - a.count);
  }

  async filterAllPaidInvoiceStatus(
    company_id: string,
    module_id: string,
    salesPersonName?: string[],
  ): Promise<{ id: string; name: string; count: number }[]> {
    const whereCondition: any = { company_id };

    whereCondition.total_amount = {
      gt: 10000,
    };

    if (salesPersonName) {
      whereCondition.salesPerson = {
        name: {
          contains: salesPersonName,
          mode: 'insensitive',
        },
      };
    }

    whereCondition.paidStatus = {
      in: [
        InvoicePaidStatusEnum.UNPAID,
        InvoicePaidStatusEnum.PAID,
        InvoicePaidStatusEnum.RETURNED,
      ],
    };

    const statuses = await this.prisma.sls_InvoiceHd.groupBy({
      by: ['paidStatus'],
      where: whereCondition,
      _count: { _all: true },
    });

    if (!statuses || statuses.length === 0) {
      throw new NotFoundException(`No statuses found for the given criteria`);
    }

    const statusPriority = {
      UNPAID: 0,
      PAID: 1,
      RETURNED: 4,
      OTHER: 3, // fallback
    };

    const sortedStatuses = statuses.sort((a, b) => {
      const aPriority = statusPriority[a.paidStatus] ?? statusPriority.OTHER;
      const bPriority = statusPriority[b.paidStatus] ?? statusPriority.OTHER;

      return aPriority - bPriority;
    });

    return sortedStatuses.map((s) => ({
      id: s.paidStatus,
      name: this.getInvoiceStatusName(s.paidStatus), // Gunakan fungsi untuk mendapatkan nama
      count: s._count._all,
    }));
  }

  private getInvoiceStatusName(paidStatus: string): string {
    const paidStatusMap: Record<string, string> = {
      UNPAID: 'UNPAID',
      PAID: 'PAID',
      RETURNED: 'RETURNED',
    };

    return paidStatusMap[paidStatus] || 'Unknown';
  }

  async filterAllInvoicesByInvoiceTypeName(
    company_id: string,
    module_id: string,
    paidStatus?: string, // Tambahkan parameter untuk filter paidStatus
  ): Promise<{ id: string; name: string; count: number }[]> {
    const whereCondition: any = { company_id };

    whereCondition.total_amount = {
      gt: 10000, // 'gt' berarti 'greater than'
    };

    if (paidStatus) {
      whereCondition.paidStatus = {
        in: paidStatus.split(','), // Ubah string "PAID,UNPAID" menjadi array ["PAID", "UNPAID"]
      };
    }

    const invoiceTypes = await this.prisma.sls_InvoiceHd.groupBy({
      by: ['invoiceType_id'],
      where: whereCondition,
      _count: { _all: true },
    });

    if (!invoiceTypes || invoiceTypes.length === 0) {
      throw new NotFoundException(
        `No sales persons found for the given criteria`,
      );
    }

    const invoiceTypeDetails = await this.prisma.sls_InvoiceType.findMany({
      where: {
        id: {
          in: invoiceTypes
            .map((s) => s.invoiceType_id)
            .filter((id) => id !== null),
        },
      },
      select: {
        id: true,
        name: true,
      },
    });

    const invoiceTypeNameList = invoiceTypes
      .map((s) => {
        const detail = invoiceTypeDetails.find(
          (sp) => sp.id === s.invoiceType_id,
        );
        return {
          id: detail?.name?.trim() || 'Unknown',
          name: detail?.name?.trim() || 'Unknown',
          count: s._count._all, // Langsung return number
        };
      })
      .filter((s) => s.name !== 'Unknown'); // Hapus data dengan name "Unknown"

    // Urutkan berdasarkan count secara descending
    return invoiceTypeNameList.sort((a, b) => b.count - a.count);
  }

  async filterAllInvoicesByPoInvoiceTypeName(
    company_id: string,
    module_id: string,
    paidStatus?: string, // Tambahkan parameter untuk filter paidStatus
  ): Promise<{ id: string; name: string; count: number }[]> {
    const whereCondition: any = { company_id };

    whereCondition.total_amount = {
      gt: 10000, // 'gt' berarti 'greater than'
    };

    if (paidStatus) {
      whereCondition.paidStatus = {
        in: paidStatus.split(','), // Ubah string "PAID,UNPAID" menjadi array ["PAID", "UNPAID"]
      };
    }

    const invoiceTypes = await this.prisma.sls_InvoiceHd.groupBy({
      by: ['poType_id'],
      where: whereCondition,
      _count: { _all: true },
    });

    if (!invoiceTypes || invoiceTypes.length === 0) {
      throw new NotFoundException(
        `No sales persons found for the given criteria`,
      );
    }

    const invoicePoTypes = await this.prisma.sls_InvoicePoType.findMany({
      where: {
        id: {
          in: invoiceTypes.map((s) => s.poType_id).filter((id) => id !== null),
        },
      },
      select: {
        id: true,
        name: true,
      },
    });

    const invoicePoTypeNameList = invoiceTypes
      .map((s) => {
        const detail = invoicePoTypes.find((sp) => sp.id === s.poType_id);
        return {
          id: detail?.name?.trim() || 'Unknown',
          name: detail?.name?.trim() || 'Unknown',
          count: s._count._all, // Langsung return number
        };
      })
      .filter((s) => s.name !== 'Unknown'); // Hapus data dengan name "Unknown"

    // Urutkan berdasarkan count secara descending
    return invoicePoTypeNameList.sort((a, b) => b.count - a.count);
  }

  private mapToResponseDto(invoice: any): sls_ResponseInvoiceHdDto {
    return {
      invoiceType_id: invoice.invoiceType,
      invoiceTypeName: invoice.sls_InvoiceType?.name ?? undefined,
      invoicePoTypeName: invoice.sls_InvoicePoType?.name ?? undefined,
      poType_id: invoice.poType,
      eCatalog_id: invoice.eCatalog_id?.trim() ?? undefined,
      po_id: invoice.po_id?.trim() ?? '',
      invoice_id: invoice.invoice_id.trim(),
      invoiceDate: invoice.invoiceDate,
      ref_id: invoice.ref_id?.trim() ?? '',
      tax_id: invoice.tax_id?.trim() ?? '',
      taxRate: invoice.taxRate,
      debtor_id: invoice.debtor_id.trim() ?? undefined,
      debtorName: invoice.debtorName.trim() ?? undefined,
      customer_id: invoice.customer_id.trim() ?? undefined,
      customerName: invoice.customerName?.trim() ?? '',
      creditTerms: invoice.creditTerms,
      dueDate: invoice.dueDate,
      salesPerson_id: invoice.salesPerson_id.trim() ?? '',
      salesPersonName: invoice.salesPersonName.trim() ?? '',
      base_amount: invoice.base_amount,
      dp_amount: invoice.dp_amount,
      discount_amount: invoice.discount_amount,
      totalDiscount_amount: invoice.totalDiscount_amount,
      tax_amount: invoice.tax_amt,
      totalDelivery_amount: invoice.totalDelivery_amount,
      total_amount: invoice.total_amount,
      paidStatus: invoice.paidStatus,
      monthYear:
        invoice.invoiceDate && isValid(invoice.invoiceDate)
          ? format(invoice.invoiceDate, 'MMM yyyy', {
              useAdditionalWeekYearTokens: false,
            })
          : 'N/A', // Penanganan untuk invoiceDate null atau tidak valid //
    };
  }
}
