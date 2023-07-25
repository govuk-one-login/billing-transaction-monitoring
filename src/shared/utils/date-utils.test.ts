import {
  formatDate,
  formatDateAsYearMonth,
  formatYearMonthDay,
  getDate,
  padZero,
} from "./date-utils";

test("Date is got from yyyy/mm/dd", () => {
  const string = "2022/01/30";

  const date = getDate(string);

  expect(date.getFullYear()).toBe(2022);
  expect(date.getMonth()).toBe(0);
  expect(date.getDate()).toBe(30);
});

test("Date is got from dd/mm/yyyy", () => {
  const string = "30/01/2022";

  const date = getDate(string);

  expect(date.getFullYear()).toBe(2022);
  expect(date.getMonth()).toBe(0);
  expect(date.getDate()).toBe(30);
});

test("Throws error if not given a valid date", () => {
  const string = "abc";
  expect(() => getDate(string)).toThrowError("Unsupported date format");
});

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

test("Date is formatted to BST by default in summer", async () => {
  const date: Date = new Date("2000-07-31 23:00+0");
  const formattedDate = formatDate(date);
  expect(formattedDate).toEqual("2000-08-01");
});

test("Date is formatted to GMT by default in winter", async () => {
  const date: Date = new Date("2000-12-31 23:00+0");
  const formattedDate = formatDate(date);
  expect(formattedDate).toEqual("2000-12-31");
});

test("Date is formatted with given delimiter to given time zone", async () => {
  const date: Date = new Date("2000-07-31 23:00+0");
  const formattedDate = formatDate(date, "_", "UTC");
  expect(formattedDate).toEqual("2000_07_31");
});

test("Year and month are formatted to yyyy-mm with a month that is single digit", async () => {
  const date: Date = new Date("2022-02-25");
  const formattedDate = formatDateAsYearMonth(date);
  expect(formattedDate).toEqual("2022-02");
});

test("Year and month are formatted to yyyy-mm with a month that is not single digits", async () => {
  const date: Date = new Date("2022-12-25");
  const formattedDate = formatDateAsYearMonth(date);
  expect(formattedDate).toEqual("2022-12");
});

test("Year and month folder is returned as yyyy/mm with a month that is single digit", async () => {
  const date: Date = new Date("2022-02-25");
  const formattedDate = formatDateAsYearMonth(date, "/");
  expect(formattedDate).toEqual("2022/02");
});

test("Year and month folder is returned as yyyy/mm with a month that is not single digit", async () => {
  const date: Date = new Date("2022-12-25");
  const formattedDate = formatDateAsYearMonth(date, "/");
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
