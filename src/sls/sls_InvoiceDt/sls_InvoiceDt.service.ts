// src/sls_InvoiceDt/sls_InvoiceDt.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { sls_ResponseInvoiceDtDto } from './dto/sls_ResponseInvoiceDt.dto';

@Injectable()
export class sls_InvoiceDtService {
  constructor(private readonly prisma: PrismaService) {}

  async findByInvoiceId(
    company_id: string,
    invoice_id: string,
  ): Promise<sls_ResponseInvoiceDtDto[]> {
    const details = await this.prisma.sls_InvoiceDt.findMany({
      where: {
        company_id,
        invoice_id,
      },
      orderBy: {
        line_no: 'asc',
      },
    });

    return details.map((item) => ({
      invoice_id: item.invoice_id.trim(),
      line_no: item.line_no,
      acct_id: item.acct_id?.trim() ?? undefined,
      description: item.description?.trim() ?? undefined,
      product_id: item.product_id?.trim(),
      productName: item.productName?.trim() ?? undefined,
      uom_id: item.uom_id?.trim(),
      unitPrice: Number(item.unitPrice),
      qty: Number(item.qty),
      sellingPrice: Number(item.sellingPrice),
      base_amount: Number(item.base_amount),
      discount_amount: Number(item.discount_amount),
      tax_amount: Number(item.tax_amount),
      delivery_amount: Number(item.delivery_amount),
      total_amount: Number(item.total_amount),
    }));
  }
}
