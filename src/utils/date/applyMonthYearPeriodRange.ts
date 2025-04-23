export function applyPeriodToWhereCondition(
  where: Record<string, any>,
  fields: string[],
  range: { gte?: Date; lte?: Date },
): void {
  const { gte, lte } = range;

  if ((!gte && !lte) || fields.length === 0) return;

  if (fields.length === 1) {
    where[fields[0]] = {
      ...(gte && { gte }),
      ...(lte && { lte }),
    };
  } else {
    where.OR = fields.map((field) => ({
      [field]: {
        ...(gte && { gte }),
        ...(lte && { lte }),
      },
    }));
  }
}

// export function applyPeriodToWhereCondition(
//   where: Record<string, any>,
//   dateFields: string[],
//   periodRange: { gte?: Date; lte?: Date },
// ) {
//   for (const field of dateFields) {
//     where[field] = {
//       ...(periodRange.gte && { gte: periodRange.gte }),
//       ...(periodRange.lte && { lte: periodRange.lte }),
//     };
//   }
// }
