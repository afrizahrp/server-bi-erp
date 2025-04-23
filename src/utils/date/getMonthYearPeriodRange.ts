import { parse, isValid } from 'date-fns';
import { BadRequestException } from '@nestjs/common';

export function getMonthYearPeriodRange(
  startPeriod?: string,
  endPeriod?: string,
  options?: { inclusiveEnd?: boolean },
): { gte?: Date; lte?: Date } {
  const normalizeMonthYear = (input: string): string => {
    const match = input.match(/^([a-zA-Z]{3})[- ]?(\d{4})$/);
    if (!match) return input;
    const month =
      match[1].charAt(0).toUpperCase() + match[1].slice(1).toLowerCase();
    const year = match[2];
    return `${month}-${year}`;
  };

  let gte: Date | undefined;
  let lte: Date | undefined;

  if (startPeriod) {
    const formattedStart = normalizeMonthYear(startPeriod);
    const parsedStart = parse(
      `${formattedStart}-01`,
      'MMM-yyyy-dd',
      new Date(),
    );
    if (!isValid(parsedStart)) {
      throw new BadRequestException(
        'Invalid startPeriod format. Use MMM-yyyy (e.g., Jan-2023)',
      );
    }
    gte = new Date(
      Date.UTC(parsedStart.getFullYear(), parsedStart.getMonth(), 1),
    );
  }

  if (endPeriod) {
    const formattedEnd = normalizeMonthYear(endPeriod);
    const parsedEnd = parse(`${formattedEnd}-01`, 'MMM-yyyy-dd', new Date());
    if (!isValid(parsedEnd)) {
      throw new BadRequestException(
        'Invalid endPeriod format. Use MMM-yyyy (e.g., Jan-2023)',
      );
    }

    lte = options?.inclusiveEnd
      ? new Date(Date.UTC(parsedEnd.getFullYear(), parsedEnd.getMonth() + 1, 0))
      : new Date(Date.UTC(parsedEnd.getFullYear(), parsedEnd.getMonth(), 1));
  }

  if (gte && lte && lte < gte) {
    throw new BadRequestException(
      'endPeriod cannot be earlier than startPeriod',
    );
  }

  return { gte, lte };
}
