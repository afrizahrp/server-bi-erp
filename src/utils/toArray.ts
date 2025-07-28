import { BadRequestException } from '@nestjs/common';

export function toArray(val: unknown): string[] {
  if (Array.isArray(val)) {
    return val.map((v) => {
      if (['string', 'number', 'boolean'].includes(typeof v)) {
        return String(v);
      }
      throw new BadRequestException(
        'Field array harus berupa string, angka, atau array string/angka.',
      );
    });
  }
  if (val === undefined || val === null) return [];
  if (typeof val === 'object') {
    throw new BadRequestException(
      'Field array tidak boleh berupa objek. Harap kirimkan string, angka, atau array string/angka.',
    );
  }
  if (['string', 'number', 'boolean'].includes(typeof val)) {
    return [String(val)];
  }
  throw new BadRequestException(
    'Field array harus berupa string, angka, atau array string/angka.',
  );
}
