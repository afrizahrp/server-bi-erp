import { getMonthYearPeriodRange } from 'src/utils/date/getMonthYearPeriodRange';
import { applyPeriodToWhereCondition } from 'src/utils/date/applyMonthYearPeriodRange';
import { SalesInvoiceFilter } from 'src/sales/helper/salesInvoiceFilter';

export function salesInvoiceWhereCondition(
  company_id: string,
  filter: SalesInvoiceFilter,
  options: {
    requiredFilters?: Partial<Record<keyof SalesInvoiceFilter, boolean>>;
    additionalConditions?: Record<string, any>;
  } = {},
): Record<string, any> {
  const { paidStatus, poType, salesPersonName, startPeriod, endPeriod } =
    filter;
  const { requiredFilters = {}, additionalConditions = {} } = options;

  const whereCondition: Record<string, any> = {
    company_id,
    total_amount: { gt: 10000 },
    ...additionalConditions,
  };

  // Filter by paidStatus
  if (requiredFilters.paidStatus && paidStatus) {
    const paidStatusColumn = 'name';
    whereCondition.sys_PaidStatus = {
      [paidStatusColumn]: Array.isArray(paidStatus)
        ? { in: paidStatus, mode: 'insensitive' }
        : { equals: paidStatus, mode: 'insensitive' },
    };
  }

  // Filter by poType
  if (requiredFilters.poType && poType) {
    const poTypeColumn = 'name';
    whereCondition.sls_InvoicePoType = {
      [poTypeColumn]: Array.isArray(poType)
        ? { in: poType, mode: 'insensitive' }
        : { equals: poType, mode: 'insensitive' },
    };
  }

  // Filter by salesPersonName
  if (requiredFilters.salesPersonName && salesPersonName) {
    const salesPersonColumn = 'name';
    whereCondition.salesPerson = {
      [salesPersonColumn]: Array.isArray(salesPersonName)
        ? { in: salesPersonName, mode: 'insensitive' }
        : { equals: salesPersonName, mode: 'insensitive' },
    };
  }

  const periodRange = getMonthYearPeriodRange(startPeriod, endPeriod, {
    inclusiveEnd: true,
  });

  applyPeriodToWhereCondition(whereCondition, ['invoiceDate'], periodRange);

  return whereCondition;
}
