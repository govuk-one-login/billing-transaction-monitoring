export type Period = {
  month: number; // 1-based, i.e. 1 is January
  year: number;
  isQuarterly: boolean;
};

export const getPeriodStart = (date: Date, isQuarterly: boolean): Period => ({
  year: date.getFullYear(),
  month: isQuarterly
    ? Math.floor(date.getMonth() / 3) * 3 + 1
    : date.getMonth() + 1,
  isQuarterly,
});

export const periodIsBefore = (period1: Period, period2: Period): boolean =>
  period1.year < period2.year ||
  (period1.year === period2.year && period1.month < period2.month);

export const periodsAreEqual = (period1: Period, period2: Period): boolean =>
  period1.year === period2.year &&
  period1.month === period2.month &&
  period1.isQuarterly === period2.isQuarterly;

export const nextPeriod = (period: Period): Period => {
  const newMonth = period.month + (period.isQuarterly ? 3 : 1);
  if (newMonth > 12) {
    return {
      month: newMonth - 12,
      year: period.year + 1,
      isQuarterly: period.isQuarterly,
    };
  }
  return {
    month: newMonth,
    year: period.year,
    isQuarterly: period.isQuarterly,
  };
};
