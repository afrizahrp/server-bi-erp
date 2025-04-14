import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { sls_PaginationInvoiceHdDto } from './dto/sls_PaginationInvoiceHd.dto';
import { sls_ResponseInvoiceHdDto } from './dto/sls_ResponseInvoiceHd.dto';
import { sls_ResponseInvoiceHdWithDetailDto } from './dto/sls_ResponseInvoiceDt.dto';
import { InvoiceStatusEnum, InvoiceTypeEnum } from '@prisma/client';

@Injectable()
export class sls_InvoiceHdService {
  constructor(private readonly prisma: PrismaService) {}

  // async findAll(
  //   company_id: string,
  //   module_id: string,
  //   paginationDto: sls_PaginationInvoiceHdDto,
  // ): Promise<{ data: sls_ResponseInvoiceHdDto[]; totalRecords: number }> {
  //   const { page = 1, limit = 10 } = paginationDto;

  //   const whereCondition: any = { company_id };

  //   const totalRecords = await this.prisma.sls_InvoiceHd.count({
  //     where: whereCondition,
  //   });

  //   const invoices = await this.prisma.sls_InvoiceHd.findMany({
  //     where: whereCondition,
  //     skip: (page - 1) * limit,
  //     take: limit,
  //     orderBy: { createdAt: 'desc' },
  //   });

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
      limit = 10,
      status,
      customerName,
      salesPersonName,
      startDate,
      endDate,
    } = paginationDto;

    const whereCondition: any = { company_id };

    if (status) {
      whereCondition.invoiceStatus = status;
    }

    if (customerName) {
      whereCondition.customerName = {
        contains: customerName,
        mode: 'insensitive',
      };
    }

    if (salesPersonName) {
      whereCondition.salesPersoName = {
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

    const totalRecords = await this.prisma.sls_InvoiceHd.count({
      where: whereCondition,
    });

    const invoices = await this.prisma.sls_InvoiceHd.findMany({
      where: whereCondition,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
    });

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

  async findAllInvoiceStatuses(
    company_id: string,
    module_id: string,
    invoiceType?: string,
  ) {
    const whereCondition: any = { company_id };

    whereCondition.invoiceStatus = {
      in: [
        InvoiceStatusEnum.UNPAID,
        InvoiceStatusEnum.PAID,
        InvoiceStatusEnum.DUE_SOON,
        InvoiceStatusEnum.OVERDUE,
        InvoiceStatusEnum.RETURNED,
      ],
    };

    whereCondition.invoiceType = {
      in: [
        InvoiceTypeEnum.REGULER,
        InvoiceTypeEnum.DP,
        InvoiceTypeEnum.SERVICE,
        InvoiceTypeEnum.PROFITSHARE,
      ],
    };

    const statuses = await this.prisma.sls_InvoiceHd.groupBy({
      by: ['invoiceStatus'],
      where: whereCondition,
      _count: { _all: true },
    });

    if (!statuses || statuses.length === 0) {
      throw new NotFoundException(`No statuses found for the given criteria`);
    }

    const sortedStatuses = statuses.sort((a, b) => {
      if (a.invoiceStatus === 'UNPAID') return -1; // Prioritaskan 'UNPAID'
      if (b.invoiceStatus === 'PAID') return 1;
      return a.invoiceStatus.localeCompare(b.invoiceStatus); // Urutkan alfabetis untuk status lainnya
    });

    return sortedStatuses.map((s) => ({
      id: s.invoiceStatus,
      name: this.getInvoiceStatusName(s.invoiceStatus), // Gunakan fungsi untuk mendapatkan nama
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
      whereCondition.invoiceStatus = filters.status;
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

  private getInvoiceStatusName(invoiceStatus: string): string {
    const invoiceStatusMap: Record<string, string> = {
      UNPAID: 'UNPAID',
      PAID: 'PAID',
      DUE_SOON: 'DUE_SOON',
      OVERDUE: 'OVERDUE',
      RETURNED: 'RETURNED',
    };

    return invoiceStatusMap[invoiceStatus] || 'Unknown';
  }

  private getInvoiceTypeName(invoiceType: string): string {
    const invoiceTypeMap: Record<string, string> = {
      '0': 'REGULER',
      '1': 'DP',
      '2': 'SERVICE',
      '3': 'PROFITSHARE',
    };

    return invoiceTypeMap[invoiceType] || 'Unknown';
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

    if (status) {
      whereCondition.invoiceStatus = status;
    }

    if (customerName) {
      whereCondition.customer_name = {
        contains: customerName,
        mode: 'insensitive',
      };
    }

    if (salesPersonName) {
      whereCondition.sales_person_name = {
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
      invoice_id: invoice.invoice_id.trim(),
      so_id: invoice.so_id?.trim() ?? '',
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
      invoiceStatus: invoice.invoiceStatus,
    };
  }
}
