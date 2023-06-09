const DELIMITER_DEFAULT = "-";

const checkDate = (date: Date): void => {
  if (date.toString() === "Invalid Date") {
    throw new Error(`Unsupported date format`);
  }
};

export const getDate = (string: string): Date => {
  const dayMonthYearMatch = string.match(/(\d\d)\/(\d\d)\/(\d\d\d\d)/);

  const date = new Date(
    dayMonthYearMatch
      ? `${dayMonthYearMatch[3]}-${dayMonthYearMatch[2]}-${dayMonthYearMatch[1]}`
      : string
  );

  checkDate(date);
  return date;
};

export function formatDate(date: Date, delimiter = DELIMITER_DEFAULT): string {
  checkDate(date);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return formatYearMonthDay(year, month, day, delimiter);
}

export const formatYearMonthDay = (
  year: number,
  month: number,
  day: number,
  delimiter = DELIMITER_DEFAULT
): string => `${year}${delimiter}${padZero(month)}${delimiter}${padZero(day)}`;

export const formatDateAsYearMonth = (
  date: Date,
  delimiter = DELIMITER_DEFAULT
): string => formatDate(date, delimiter).slice(0, -2 - delimiter.length);

export const padZero = (number: number): string => `0${number}`.slice(-2);
