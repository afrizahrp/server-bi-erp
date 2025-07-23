export interface SalesInvoiceFilter {
  company_id?: string | string[];
  paidStatus?: string | string[];
  poType?: string | string[];
  salesPersonName?: string | string[];
  startPeriod?: string;
  endPeriod?: string;
}
