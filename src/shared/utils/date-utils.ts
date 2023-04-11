export function formatDate(date: Date, delimiter = "-"): string {
  if (date.toString() === "Invalid Date") {
    throw new Error(`Unsupported date format`);
  }
  const year = date.getFullYear();
  const month = padZero(date.getMonth() + 1);
  const day = padZero(date.getDate());
  return `${year}${delimiter}${month}${delimiter}${day}`;
}

export const formatYearMonthDay = (
  year: number,
  month: number,
  day: number
): string => `${year}-${padZero(month)}-${padZero(day)}`;

export const formatDateAsYearMonth = (date: Date, delimiter = "/"): string => {
  const year = date.getFullYear();
  const month = padZero(date.getMonth() + 1);
  return `${year}${delimiter}${month}`;
};

export const padZero = (number: number): string => `0${number}`.slice(-2);
