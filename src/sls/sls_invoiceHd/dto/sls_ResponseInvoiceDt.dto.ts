import { sls_ResponseInvoiceHdDto } from './sls_ResponseInvoiceHd.dto';

export class sls_ResponseInvoiceHdWithDetailDto extends sls_ResponseInvoiceHdDto {
  details: {
    id: string;
    line_no: number;
    product_id: string;
    product_name?: string;
    uom_id: string;
    qty?: number;
    unit_price?: number;
    discount_amt?: number;
    total_amt?: number;
    // tambahkan field lain jika perlu
  }[];
}
