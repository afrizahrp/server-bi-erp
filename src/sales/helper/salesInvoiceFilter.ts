export interface SalesInvoiceFilter {
  paidStatus?: string | string[];
  poType?: string | string[];
  salesPersonName?: string | string[];
  startPeriod?: string;
  endPeriod?: string;
}
