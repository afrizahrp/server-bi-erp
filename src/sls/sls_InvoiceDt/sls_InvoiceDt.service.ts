// src/sls_InvoiceDt/sls_InvoiceDt.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { sls_ResponseInvoiceDtDto } from './dto/sls_ResponseInvoiceDt.dto';

@Injectable()
export class sls_InvoiceDtService {
  constructor(private readonly prisma: PrismaService) {}

  async findByInvoiceId(
    company_id: string,
    id: string,
  ): Promise<sls_ResponseInvoiceDtDto[]> {
    const details = await this.prisma.sls_InvoiceDt.findMany({
      where: {
        company_id,
        id,
      },
      orderBy: {
        line_no: 'asc',
      },
    });

    return details.map((item) => ({
      id: item.id.trim(),
      line_no: item.line_no,
      acct_id: item.acct_id.trim() ?? undefined,
      description: item.description.trim() ?? undefined,
      product_id: item.product_id.trim(),
      product_name: item.product_name.trim() ?? undefined,
      uom_id: item.uom_id.trim(),
      unit_price: Number(item.unit_price),
      qty: Number(item.qty),
      selling_price: Number(item.selling_price),
      base_amt: Number(item.base_amt),
      discount_amt: Number(item.discount_amt),
      tax_amt: Number(item.tax_amt),
      delivery_amt: Number(item.delivery_amt),
      total_amt: Number(item.total_amt),
    }));
  }
}
