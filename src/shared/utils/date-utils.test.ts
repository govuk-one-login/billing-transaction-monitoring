import {
  formatDate,
  formatYearMonth,
  formatYearMonthDay,
  getYearMonthFolder,
  padZero,
} from "./date-utils";

test("Date is formatted to yyyy-mm-dd with a month that is single digits", async () => {
  const date: Date = new Date("2022-01-16");
  const formattedDate = formatDate(date);
  expect(formattedDate).toEqual("2022-01-16");
});

test("Date is formatted to yyyy-mm-dd with a date that is single digits", async () => {
  const date: Date = new Date("2022-10-01");
  const formattedDate = formatDate(date);
  expect(formattedDate).toEqual("2022-10-01");
});

test("Date is formatted to yyyy-mm-dd with a date and month that is not single digits", async () => {
  const date: Date = new Date("2022-12-25");
  const formattedDate = formatDate(date);
  expect(formattedDate).toEqual("2022-12-25");
});

test("Year and month are formatted to yyyy-mm with a month that is single digit", async () => {
  const date: Date = new Date("2022-02-25");
  const formattedDate = formatYearMonth(date);
  expect(formattedDate).toEqual("2022-02");
});

test("Year and month are formatted to yyyy-mm with a month that is not single digits", async () => {
  const date: Date = new Date("2022-12-25");
  const formattedDate = formatYearMonth(date);
  expect(formattedDate).toEqual("2022-12");
});

test("Year and month folder is returned as yyyy/mm with a month that is single digit", async () => {
  const date: Date = new Date("2022-02-25");
  const formattedDate = getYearMonthFolder(date);
  expect(formattedDate).toEqual("2022/02");
});

test("Year and month folder is returned as yyyy/mm with a month that is not single digit", async () => {
  const date: Date = new Date("2022-12-25");
  const formattedDate = getYearMonthFolder(date);
  expect(formattedDate).toEqual("2022/12");
});

test("Year, month, and day are formatted to yyyy-mm-dd", async () => {
  const year: number = 2022;
  const month: number = 1;
  const day: number = 16;

  const formattedYearMonthday = formatYearMonthDay(year, month, day);

  expect(formattedYearMonthday).toEqual("2022-01-16");
});

test("Year, month, and day are formatted to yyyy-mm-dd even after Daylight savings", async () => {
  const year: number = 2023;
  const month: number = 3;
  const day: number = 27;

  const formattedYearMonthday = formatYearMonthDay(year, month, day);

  expect(formattedYearMonthday).toEqual("2023-03-27");
});

test("Number is zero-padded with a number that is single digits", async () => {
  const number: number = 1;
  const zeroPaddedNumber = padZero(number);
  expect(zeroPaddedNumber).toEqual("01");
});

test("Number is zero-padded with a number that is double digits", async () => {
  const number: number = 12;
  const zeroPaddedNumber = padZero(number);
  expect(zeroPaddedNumber).toEqual("12");
});

test("Throws error if not given a valid date", async () => {
  expect(() => formatDate(new Date("abc"))).toThrowError(
    "Unsupported date format"
  );
});
