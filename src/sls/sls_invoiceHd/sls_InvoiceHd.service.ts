import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { sls_PaginationInvoiceHdDto } from './dto/sls_PaginationInvoiceHd.dto';
import { sls_ResponseInvoiceHdDto } from './dto/sls_ResponseInvoiceHd.dto';
import { sls_ResponseInvoiceHdWithDetailDto } from './dto/sls_ResponseInvoiceDt.dto';
import { InvoicePaidStatusEnum, InvoiceTypeEnum } from '@prisma/client';

@Injectable()
export class sls_InvoiceHdService {
  constructor(private readonly prisma: PrismaService) {}

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
      startDate,
      endDate,
      searchBy,
      searchTerm,
    } = paginationDto;

    // Limit default max 100
    const safeLimit = Math.min(Number(limit) || 10, 100);
    const offset = (Number(page) - 1) * safeLimit;
    // const allowedSearchFields = ['invoice_id', 'customerName']; // contoh

    const whereCondition: Record<string, any> = {
      company_id,
    };

    whereCondition.total_amount = {
      gt: 10000, // 'gt' berarti 'greater than'
    };

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

    if (status) {
      whereCondition.paidStatus = {
        in: status.split(','),
      };
    }

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

    // if (salesPersonName) {
    //   whereCondition.salesPersonName = {
    //     in: salesPersonName.split(','),
    //   };
    // }

    // console.log('salesPersonName:', salesPersonName!.split(','));

    if (startDate || endDate) {
      whereCondition.invoiceDate = {};

      if (startDate) {
        whereCondition.invoiceDate.gte = new Date(startDate);
      }

      if (endDate) {
        whereCondition.invoiceDate.lte = new Date(endDate);
      }
    }
    const orderField = paginationDto.orderBy ?? 'invoiceDate';
    const orderDirection = paginationDto.orderDir === 'asc' ? 'asc' : 'desc';
    const [totalRecords, invoices] = await Promise.all([
      this.prisma.sls_InvoiceHd.count({ where: whereCondition }),
      this.prisma.sls_InvoiceHd.findMany({
        where: whereCondition,
        skip: offset,
        take: safeLimit,
        orderBy: {
          [orderField]: orderDirection,
        },
      }),
    ]);

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
      qty: dt.qty ? Number(dt.qty) : undefined,
      discount_amt: dt.discount_amount ? Number(dt.discount_amount) : undefined,
      total_amount: dt.total_amount ? Number(dt.total_amount) : undefined,
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

  async findAllInvoicesBySalesPersonName(
    company_id: string,
    module_id: string,
    customerName?: string,
    paidStatus?: string, // Tambahkan parameter untuk filter paidStatus
  ): Promise<{ id: string; name: string; count: number }[]> {
    const whereCondition: any = { company_id };

    whereCondition.total_amount = {
      gt: 10000, // 'gt' berarti 'greater than'
    };

    if (customerName) {
      whereCondition.customerName = {
        contains: customerName,
        mode: 'insensitive',
      };
    }

    if (paidStatus) {
      whereCondition.paidStatus = {
        in: paidStatus.split(','), // Ubah string "PAID,UNPAID" menjadi array ["PAID", "UNPAID"]
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

    // Gabungkan data salesPersonName dengan hasil groupBy
    const result = salesPersons
      .map((s) => {
        const detail = salesPersonDetails.find(
          (sp) => sp.id === s.salesPerson_id,
        );
        return {
          id: detail?.name?.trim() || 'Unknown',
          name: detail?.name?.trim() || 'Unknown',
          count: s._count._all, // Langsung return number
        };
      })
      .filter((s) => s.name !== 'Unknown'); // Hapus data dengan name "Unknown"

    // Urutkan berdasarkan count secara descending
    return result.sort((a, b) => b.count - a.count);
  }

  async findAllInvoicesByCustomerName(
    company_id: string,
    module_id: string,
  ): Promise<{ salesPersonName: string; count: string }[]> {
    const whereCondition: any = { company_id };

    const customers = await this.prisma.sls_InvoiceHd.groupBy({
      by: ['customerName'], // Kelompokkan berdasarkan salesPersonName
      where: whereCondition,
      _count: { _all: true }, // Hitung jumlah invoice untuk setiap salesPersonName
    });

    if (!customers || customers.length === 0) {
      throw new NotFoundException(`No customers found for the given criteria`);
    }

    return customers.map((s) => ({
      id: s.customerName?.trim() || 'Unknown', // Display 'Unknown' if salesPersonName is null
      salesPersonName: s.customerName?.trim() || 'Unknown', // Display 'Unknown' if salesPersonName is null
      count: s._count._all.toString(), // Convert count to string
    }));
  }

  async findAllPaidInvoiceStatus(
    company_id: string,
    module_id: string,
    invoiceType?: string,
  ) {
    const whereCondition: any = { company_id };

    whereCondition.total_amount = {
      gt: 10000, // 'gt' berarti 'greater than'
    };

    whereCondition.paidStatus = {
      in: [
        InvoicePaidStatusEnum.UNPAID,
        InvoicePaidStatusEnum.PAID,
        InvoicePaidStatusEnum.RETURNED,
      ],
    };

    whereCondition.invoiceType = {
      in: [InvoiceTypeEnum.REGULER, InvoiceTypeEnum.NON_REGULER],
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
      RETURNED: 2,
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
      count: s._count._all.toString(), // Konversi count ke string
    }));
  }

  async findAllInvoiceType(
    company_id: string,
    module_id: string,
    filters?: { invoiceType?: string; status?: string },
  ) {
    // Buat kondisi where secara dinamis
    const whereCondition: any = { company_id };

    if (filters?.invoiceType) {
      whereCondition.type = filters.invoiceType;
    }
    if (filters?.status) {
      whereCondition.paidStatus = filters.status;
    }

    const types = await this.prisma.sls_InvoiceHd.groupBy({
      by: ['invoiceType'],
      where: whereCondition,
      _count: {
        _all: true,
      },
    });

    return types.map((s) => ({
      id: s.invoiceType,
      name: this.getInvoiceTypeName(s.invoiceType),
      count: s._count._all.toString(), // Ubah angka ke string agar sesuai respons frontend
    }));
  }

  private getInvoiceTypeName(invoiceType: string): string {
    const invoiceTypeMap: Record<string, string> = {
      REGULER: 'REGULER',
      DP: 'NON_REGULER',
    };

    return invoiceTypeMap[invoiceType] || 'Unknown';
  }

  private getInvoiceStatusName(paidStatus: string): string {
    const paidStatusMap: Record<string, string> = {
      UNPAID: 'UNPAID',
      PAID: 'PAID',
      RETURNED: 'RETURNED',
    };

    return paidStatusMap[paidStatus] || 'Unknown';
  }

  async filterInvoices(
    company_id: string,
    module_id: string,
    status?: string,
    customerName?: string,
    salesPersonName?: string,
    startDate?: string,
    endDate?: string,
  ): Promise<sls_ResponseInvoiceHdDto[]> {
    const whereCondition: any = { company_id };

    // if (status) {
    //   whereCondition.invoiceStatus = status;
    // }

    if (status) {
      whereCondition.paidStatus = {
        in: status.split(','), // Ubah string "PAID,UNPAID" menjadi array ["PAID", "UNPAID"]
      };
    }

    if (customerName) {
      whereCondition.customerName = {
        contains: customerName,
        mode: 'insensitive',
      };
    }

    if (salesPersonName) {
      whereCondition.salesPersonName = {
        contains: salesPersonName,
        mode: 'insensitive',
      };
    }

    if (startDate || endDate) {
      whereCondition.invoiceDate = {};

      if (startDate) {
        whereCondition.invoiceDate.gte = new Date(startDate);
      }

      if (endDate) {
        whereCondition.invoiceDate.lte = new Date(endDate);
      }
    }

    const invoices = await this.prisma.sls_InvoiceHd.findMany({
      where: whereCondition,
      orderBy: { createdAt: 'desc' },
    });

    return invoices.map((invoice) => this.mapToResponseDto(invoice));
  }

  private mapToResponseDto(invoice: any): sls_ResponseInvoiceHdDto {
    return {
      invoiceType: invoice.invoiceType,
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
    };
  }
}
