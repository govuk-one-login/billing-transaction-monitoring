export type Quarter = "Q1" | "Q2" | "Q3" | "Q4";

const DELIMITER_DEFAULT = "-";
const TIME_ZONE_DEFAULT = "Europe/London";

// First month of each quarter, sorted by quarter number
const QUARTER_FIRST_MONTHS: Record<Quarter, number> = {
  Q1: 4,
  Q2: 7,
  Q3: 10,
  Q4: 1,
};

// Quarter of each first month, sorted by month
const QUARTERS_BY_FIRST_MONTH: Partial<Record<number, Quarter>> =
  Object.fromEntries(
    Object.entries(QUARTER_FIRST_MONTHS)
      .map<[number, Quarter]>(([quarter, month]) => [month, quarter as Quarter])
      .sort((entry1, entry2) => entry1[0] - entry2[0])
  );

const checkDate = (date: Date): void => {
  if (date.toString() === "Invalid Date") {
    throw new Error(`Unsupported date format`);
  }
};

export const dateRangeIsQuarter = (start: Date, end: Date): boolean => {
  const startMonth = start.getMonth() + 1;
  const startDay = start.getDate();
  const endMonth = end.getMonth() + 1;
  const endDay = end.getDate();

  return (
    startDay === 1 &&
    ((startMonth === 1 && endMonth === 3 && endDay === 31) ||
      (startMonth === 4 && endMonth === 6 && endDay === 30) ||
      (startMonth === 7 && endMonth === 9 && endDay === 30) ||
      (startMonth === 10 && endMonth === 12 && endDay === 31))
  );
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

export function formatDate(
  date: Date,
  delimiter = DELIMITER_DEFAULT,
  timeZone = TIME_ZONE_DEFAULT
): string {
  checkDate(date);
  const dateFormatter = new Intl.DateTimeFormat("en-CA", { timeZone }); // `en-CA` format is `YYYY-MM-DD`
  const hyphenatedDateText = dateFormatter.format(date);
  return hyphenatedDateText.replace(/-/g, delimiter);
}

export const formatYearMonthDay = (
  year: number,
  month: number,
  day: number,
  delimiter = DELIMITER_DEFAULT
): string => `${year}${delimiter}${padZero(month)}${delimiter}${padZero(day)}`;

export const formatDateAsYearMonth = (
  date: Date,
  delimiter = DELIMITER_DEFAULT,
  timeZone = TIME_ZONE_DEFAULT
): string =>
  formatDate(date, delimiter, timeZone).slice(0, -2 - delimiter.length);

/** Get the quarter that a given month is in */
export const getMonthQuarter = (month: number | string): Quarter => {
  const monthNumber = typeof month === "number" ? month : parseInt(month, 10);

  for (const [quarterMonth, quarter] of Object.entries(
    QUARTERS_BY_FIRST_MONTH
  ).reverse())
    if (quarter !== undefined && monthNumber >= +quarterMonth) return quarter;

  throw Error(`Failed to determine quarter for month: ${month}`);
};

/** Get the first month of a given quarter */
export const getQuarterMonth = (quarter: string): number => {
  if (isQuarter(quarter)) return QUARTER_FIRST_MONTHS[quarter];
  throw Error(`Invalid quarter: ${quarter}`);
};

export const getQuarterStartString = (
  dateOrDateString: Date | string,
  delimiter = DELIMITER_DEFAULT
): string => {
  const date = new Date(dateOrDateString);

  checkDate(date);

  const month = date.getMonth() + 1;
  const quarter = getMonthQuarter(month);

  return formatYearMonthDay(
    date.getFullYear(),
    getQuarterMonth(quarter),
    1,
    delimiter
  );
};

export const isQuarter = (string: string): string is Quarter =>
  Object.keys(QUARTER_FIRST_MONTHS).includes(string);

export const padZero = (number: number): string => `0${number}`.slice(-2);
