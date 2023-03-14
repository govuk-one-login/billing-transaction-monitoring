export const formatDate = (date: Date): string =>
  formatYearMonthDay(date.getFullYear(), date.getMonth() + 1, date.getDate());

export const formatYearMonthDay = (
  year: number,
  month: number,
  day: number
): string => `${year}-${padZero(month)}-${padZero(day)}`;

export const padZero = (number: number): string => `0${number}`.slice(-2);
