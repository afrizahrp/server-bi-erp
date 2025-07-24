import { getMonthYearPeriodRange } from 'src/utils/date/getMonthYearPeriodRange';
import { applyPeriodToWhereCondition } from 'src/utils/date/applyMonthYearPeriodRange';
import { SalesInvoiceFilter } from 'src/sales/helper/salesInvoiceFilter';
import { BadRequestException } from '@nestjs/common';

export function salesInvoiceWhereCondition(
  filter: SalesInvoiceFilter,
  options: {
    requiredFilters?: Partial<Record<keyof SalesInvoiceFilter, boolean>>;
    additionalConditions?: Record<string, any>;
  } = {},
): Record<string, any> {
  const {
    company_id,
    paidStatus,
    poType,
    salesPersonName,
    startPeriod,
    endPeriod,
  } = filter;
  const { requiredFilters = {}, additionalConditions = {} } = options;

  const whereCondition: Record<string, any> = {
    ...additionalConditions,
  };

  // Filter by company_id
  // if (requiredFilters.company_id && company_id) {
  //   whereCondition.company_id = Array.isArray(company_id)
  //     ? { in: company_id, mode: 'insensitive' }
  //     : { equals: company_id, mode: 'insensitive' };
  // }

  if (requiredFilters.company_id && company_id) {
    const normalizedCompanyIds = Array.isArray(company_id)
      ? company_id
          .filter((id): id is string => typeof id === 'string' && id !== null)
          .map((id) => id.trim())
      : typeof company_id === 'string' && company_id
        ? [company_id.trim()]
        : [];
    if (normalizedCompanyIds.length === 0) {
      throw new BadRequestException(
        'At least one valid company_id is required',
      );
    }
    whereCondition.company_id = {
      in: normalizedCompanyIds,
      mode: 'insensitive',
    };
  }

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
