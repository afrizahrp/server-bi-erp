import { DateTime } from 'luxon';
export function ConvertToWib(
  date: Date | string,
  format: string = 'yyyy-MM-dd HH:mm:ss',
): string {
  return DateTime.fromISO(
    typeof date === 'string' ? date : date.toISOString(),
    { zone: 'utc' }, // Pastikan input dalam UTC
  )
    .setZone('Asia/Jakarta') // Konversi ke WIB
    .toFormat(format); // Format sesuai kebutuhan
}
