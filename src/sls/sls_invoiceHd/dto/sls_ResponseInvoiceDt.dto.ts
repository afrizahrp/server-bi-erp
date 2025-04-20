import { sls_ResponseInvoiceHdDto } from './sls_ResponseInvoiceHd.dto';

export class sls_ResponseInvoiceHdWithDetailDto extends sls_ResponseInvoiceHdDto {
  details: {
    invoice_id: string;
    line_no: number;
    product_id: string;
    productName?: string;
    uom_id: string;
    unitPrice: number;
    sellingPrice: number;
    qty: number;
    base_amount: number;
    discount_amount: number;
    delivery_amount: number;
    tax_amount: number;
    total_amount: number;
  }[];
}
