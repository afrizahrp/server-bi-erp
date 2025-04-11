import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { sls_PaginationInvoiceHdDto } from './dto/sls_PaginationInvoiceHd.dto';
import { sls_ResponseInvoiceHdDto } from './dto/sls_ResponseInvoiceHd.dto';
import { sls_ResponseInvoiceHdWithDetailDto } from './dto/sls_ResponseInvoiceDt.dto';
import { InvoiceStatusEnum } from '@prisma/client';

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
    id: string,
  ): Promise<sls_ResponseInvoiceHdWithDetailDto> {
    const invoice = await this.prisma.sls_InvoiceHd.findUnique({
      where: { company_id_id: { company_id, id } },
      include: {
        sls_InvoiceDt: true,
      },
    });

    if (!invoice) {
      throw new NotFoundException(`Invoice with ID ${id} not found`);
    }

    const header = this.mapToResponseDto(invoice);

    const details = invoice.sls_InvoiceDt.map((dt) => ({
      id: dt.id.trim(),
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
      id: invoice.id.trim(),
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
