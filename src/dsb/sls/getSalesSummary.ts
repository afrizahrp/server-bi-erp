import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

type Filters = {
  startDate: Date;
  endDate: Date;
  paidStatus?: string;
  poType?: string;
  salesPersonName?: string;
};

export async function getSalesInvoiceSummary(filters: Filters) {
  const { startDate, endDate, paidStatus, poType, salesPersonName } = filters;

  const startYear = startDate.getFullYear();
  const endYear = endDate.getFullYear();
  const startMonth = startDate.getMonth();
  const endMonth = endDate.getMonth();

  const isSameYear = startYear === endYear;
  const isSameMonth = startMonth === endMonth;

  const params: any[] = [startDate, endDate];
  const conditions = [`"invoiceDate" BETWEEN $1 AND $2`];

  if (paidStatus) {
    conditions.push(`"paidStatus" = $${params.length + 1}`);
    params.push(paidStatus);
  }
  if (poType) {
    conditions.push(`"poType" = $${params.length + 1}`);
    params.push(poType);
  }
  if (salesPersonName) {
    conditions.push(`"salesPersonName" = $${params.length + 1}`);
    params.push(salesPersonName);
  }

  const whereClause = `WHERE ${conditions.join(' AND ')}`;

  // Pilih format period berdasar range
  const groupBy =
    isSameYear || isSameMonth
      ? `TO_CHAR("invoiceDate", 'Mon YYYY')`
      : `TO_CHAR("invoiceDate", 'YYYY')`;

  const query = `
    SELECT ${groupBy} AS period,
           SUM("total_amount") AS "totalInvoice"
    FROM "sls_InvoiceHd"
    ${whereClause}
    GROUP BY period
    ORDER BY MIN("invoiceDate")
  `;

  const rawData = await prisma.$queryRawUnsafe(query, ...params);

  return {
    company_id: 'BIS',
    module_id: 'SLS',
    subModule_id: 'sls',
    data: rawData,
  };
}
