// src/utils/db/buildSearchCondition.ts
export function buildSearchCondition(
  searchBy?: string,
  searchTerm?: string,
): Array<Record<string, any>> | undefined {
  if (!searchBy || !searchTerm?.trim()) return;

  const words = searchTerm.trim().split(/\s+/);
  return words.map((word) => ({
    [searchBy]: {
      contains: word,
      mode: 'insensitive',
    },
  }));
}

// if (searchBy && typeof searchTerm === 'string' && searchTerm.trim() !== '') {
//   const searchWords = searchTerm.trim().split(/\s+/);
//   whereCondition.AND = searchWords.map((word) => ({
//     [searchBy]: {
//       contains: word,
//       mode: 'insensitive',
//     },
//   }));
// }
