import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { sls_PaginationInvoiceHdDto } from './dto/sls_PaginationInvoiceHd.dto';
import { sls_ResponseInvoiceHdDto } from './dto/sls_ResponseInvoiceHd.dto';
import { sls_ResponseInvoiceHdWithDetailDto } from './dto/sls_ResponseInvoiceDt.dto';

@Injectable()
export class sls_InvoiceHdService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    company_id: string,
    module_id: string,
    paginationDto: sls_PaginationInvoiceHdDto,
  ): Promise<{ data: sls_ResponseInvoiceHdDto[]; totalRecords: number }> {
    const { page = 1, limit = 10, name, status } = paginationDto;

    const whereCondition: any = { company_id };

    if (name) {
      whereCondition.OR = [
        { debtor_name: { contains: name, mode: 'insensitive' } },
        { customer_name: { contains: name, mode: 'insensitive' } },
      ];
    }

    if (status) {
      whereCondition.invoice_status = status;
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
      product_name: dt.product_name?.trim(),
      uom_id: dt.uom_id.trim(),
      qty: dt.qty ? Number(dt.qty) : undefined,
      unit_price: dt.unit_price ? Number(dt.unit_price) : undefined,
      discount_amt: dt.discount_amt ? Number(dt.discount_amt) : undefined,
      total_amt: dt.total_amt ? Number(dt.total_amt) : undefined,
    }));

    return {
      ...header,
      details,
    };
  }

  private mapToResponseDto(invoice: any): sls_ResponseInvoiceHdDto {
    return {
      id: invoice.id.trim(),
      so_id: invoice.so_id.trim(),
      invoice_date: invoice.invoice_date,
      ref_id: invoice.ref_id,
      tax_id: invoice.tax_id.trim(),
      tax_rate: invoice.tax_rate,
      debtor_id: invoice.debtor_id.trim(),
      debtor_name: invoice.debtor_name.trim(),
      customer_id: invoice.customer_id.trim(),
      customer_name: invoice.customer_name.trim(),
      credit_terms: invoice.credit_terms,
      duedate: invoice.duedate,
      sales_person_id: invoice.sales_person_id.trim(),
      sales_person_name: invoice.sales_person_name.trim(),
      base_amt: invoice.base_amt,
      dp_amt: invoice.dp_amt,
      discount_amt: invoice.discount_amt,
      total_discount: invoice.total_discount,
      tax_amt: invoice.tax_amt,
      total_delivery_amt: invoice.total_delivery_amt,
      total_amt: invoice.total_amt,
      invoice_status: invoice.invoice_status,
    };
  }
}
