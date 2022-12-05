import { formatDate } from "./date-utils";

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
