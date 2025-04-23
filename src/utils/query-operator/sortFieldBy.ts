export function sortFieldBy(
  allowedFields: string[],
  orderBy?: string,
  orderDir?: string,
): Record<string, 'asc' | 'desc'> {
  const safeOrderBy = allowedFields.includes(orderBy ?? '')
    ? orderBy!
    : allowedFields[0]; // fallback ke field pertama dari modul itu

  const safeOrderDir = orderDir === 'asc' ? 'asc' : 'desc';

  return {
    [safeOrderBy]: safeOrderDir,
  };
}
