import { sls_ResponseInvoiceHdDto } from './sls_ResponseInvoiceHd.dto';

export class sls_ResponseInvoiceHdWithDetailDto extends sls_ResponseInvoiceHdDto {
  details: {
    id: string;
    line_no: number;
    product_id: string;
    productName?: string;
    uom_id: string;
    qty?: number;
    unitPrice?: number;
    discount_amount?: number;
    total_amount?: number;
    // tambahkan field lain jika perlu
  }[];
}
