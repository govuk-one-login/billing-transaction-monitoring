export const getDateString = (date: Date): string =>
  date.toISOString().substring(0, 10);

export const getQuarterMonthFromDate = (date: Date): number => {
  const month = date.getMonth() + 1;
  return getQuarterMonthFromMonth(month);
};

const getQuarterMonthFromMonth = (month: number): number =>
  month >= 10 ? 10 : month >= 7 ? 7 : month >= 4 ? 4 : 1;

export const getQuarterMonthString = (date: Date): string => {
  const quarterMonth = getQuarterMonthFromDate(date);
  return padZero(quarterMonth);
};

export const getQuarterStartDateString = (date: Date): string =>
  `${date.getFullYear()}-${getQuarterMonthString(date)}-01`;

export const getQuarterEndDateString = (date: Date): string => {
  const startMonth = getQuarterMonthFromDate(date);
  const endMonth = startMonth + 2;
  const endDay = [6, 9].includes(endMonth) ? 30 : 31;
  return `${date.getFullYear()}-${padZero(endMonth)}-${endDay}`;
};

export const padZero = (monthOrDay: number): string =>
  monthOrDay.toLocaleString("en-US", { minimumIntegerDigits: 2 });
