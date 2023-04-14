const DELIMITER_DEFAULT = "-";

export function formatDate(date: Date, delimiter = DELIMITER_DEFAULT): string {
  if (date.toString() === "Invalid Date") {
    throw new Error(`Unsupported date format`);
  }
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
