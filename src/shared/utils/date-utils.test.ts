import {
  dateRangeIsQuarter,
  formatDate,
  formatDateAsYearMonth,
  formatYearMonthDay,
  getDate,
  getMonthQuarter,
  getQuarterMonth,
  getQuarterStartString,
  isQuarter,
  padZero,
} from "./date-utils";

test("1/1-31/3 is identified as quarter", () => {
  const start = new Date("2022-01-01");
  const end = new Date("2022-03-31");

  const result = dateRangeIsQuarter(start, end);

  expect(result).toBe(true);
});

test("1/4-30/6 is identified as quarter", () => {
  const start = new Date("2022-04-01");
  const end = new Date("2022-06-30");

  const result = dateRangeIsQuarter(start, end);

  expect(result).toBe(true);
});

test("1/7-30/9 is identified as quarter", () => {
  const start = new Date("2022-07-01");
  const end = new Date("2022-09-30");

  const result = dateRangeIsQuarter(start, end);

  expect(result).toBe(true);
});

test("1/10-31/12 is identified as quarter", () => {
  const start = new Date("2022-10-01");
  const end = new Date("2022-12-31");

  const result = dateRangeIsQuarter(start, end);

  expect(result).toBe(true);
});

test("1/1-30/3 is identified as not a quarter", () => {
  const start = new Date("2022-01-01");
  const end = new Date("2022-03-30");

  const result = dateRangeIsQuarter(start, end);

  expect(result).toBe(false);
});

test("1/1-31/12 is identified as not a quarter", () => {
  const start = new Date("2022-01-01");
  const end = new Date("2022-12-31");

  const result = dateRangeIsQuarter(start, end);

  expect(result).toBe(false);
});

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

test.each`
  testCase                                                                                          | givenDateInput             | givenDelimiter | givenTimeZone | expectedResult
  ${"from UTC+0 to UTC+1 by default, one second after midnight on 1 Oct 2022 UTC+1"}                | ${"2022-09-30 23:00:01+0"} | ${undefined}   | ${undefined}  | ${"2022-10-01"}
  ${"from UTC+0 to UTC+1 by default, 59 minutes and 59 seconds after midnight on 1 Oct 2022 UTC+1"} | ${"2022-09-30 23:59:59+0"} | ${undefined}   | ${undefined}  | ${"2022-10-01"}
  ${"from UTC+0 to UTC+1 by default, one hour and one second after midnight on 1 Oct 2022 UTC+1"}   | ${"2022-10-01 00:00:01+0"} | ${undefined}   | ${undefined}  | ${"2022-10-01"}
  ${"from UTC+0 to UTC+0 by default, one second after midnight on 1 Feb 2023 UTC+0"}                | ${"2023-02-01 00:00:01+0"} | ${undefined}   | ${undefined}  | ${"2023-02-01"}
  ${"from UTC-6 to UTC+1 by default, one second after midnight on 1 Oct 2022 UTC+1"}                | ${"2022-09-30 17:00:01-6"} | ${undefined}   | ${undefined}  | ${"2022-10-01"}
  ${"from UTC-6 to UTC+1 by default, 59 minutes and 59 seconds after midnight on 1 Oct 2022 UTC+1"} | ${"2022-09-30 17:59:59-6"} | ${undefined}   | ${undefined}  | ${"2022-10-01"}
  ${"from UTC-6 to UTC+1 by default, one hour and one second after midnight on 1 Oct 2022 UTC+1"}   | ${"2022-09-30 18:00:01-6"} | ${undefined}   | ${undefined}  | ${"2022-10-01"}
  ${"from UTC-6 to UTC+0 by default, one second after midnight on 1 Feb 2023 UTC+0"}                | ${"2023-01-31 18:00:01-6"} | ${undefined}   | ${undefined}  | ${"2023-02-01"}
  ${"from UTC+6 to UTC+1 by default, one second after midnight on 1 Oct 2022 UTC+1"}                | ${"2022-10-01 05:00:01+6"} | ${undefined}   | ${undefined}  | ${"2022-10-01"}
  ${"from UTC+6 to UTC+1 by default, 59 minutes and 59 seconds after midnight on 1 Oct 2022 UTC+1"} | ${"2022-10-01 05:59:59+6"} | ${undefined}   | ${undefined}  | ${"2022-10-01"}
  ${"from UTC+6 to UTC+1 by default, one hour and one second after midnight on 1 Oct 2022 UTC+1"}   | ${"2022-10-01 06:00:01+6"} | ${undefined}   | ${undefined}  | ${"2022-10-01"}
  ${"from UTC+6 to UTC+0 by default, one second after midnight on 1 Feb 2023 UTC+0"}                | ${"2023-02-01 06:00:01+6"} | ${undefined}   | ${undefined}  | ${"2023-02-01"}
  ${"with given delimiter from UTC+0 to given timezone GMT"}                                        | ${"2022-09-30 23:00+0"}    | ${"_"}         | ${"GMT"}      | ${"2022_09_30"}
  ${"with given delimiter from UTC+0 to given timezone BST"}                                        | ${"2022-09-30 23:01+0"}    | ${"_"}         | ${"BST"}      | ${"2022_10_01"}
  ${"with given delimiter from UTC-6 to given timezone GMT"}                                        | ${"2022-09-30 17:00-6"}    | ${"_"}         | ${"GMT"}      | ${"2022_09_30"}
  ${"with given delimiter from UTC-6 to given timezone BST"}                                        | ${"2022-09-30 17:00-6"}    | ${"_"}         | ${"BST"}      | ${"2022_10_01"}
  ${"with given delimiter from UTC+6 to given timezone GMT"}                                        | ${"2022-10-01 05:00+6"}    | ${"_"}         | ${"GMT"}      | ${"2022_09_30"}
  ${"with given delimiter from UTC+6 to given timezone BST"}                                        | ${"2022-10-01 05:00+6"}    | ${"_"}         | ${"BST"}      | ${"2022_10_01"}
`("Date is formatted $testCase", (data) => {
  const date: Date = new Date(data.givenDateInput);

  const formattedDate = formatDate(
    date,
    data.givenDelimiter,
    data.givenTimeZone
  );

  expect(formattedDate).toEqual(data.expectedResult);
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

describe("Month Quarter Getter", () => {
  test("Month Quarter Getter with month number `NaN`", () => {
    const givenMonth = NaN;

    expect(() => getMonthQuarter(givenMonth)).toThrow(
      "Failed to determine quarter"
    );
  });

  test("Month Quarter Getter with month string 'foo'", () => {
    const givenMonth = "foo";

    expect(() => getMonthQuarter(givenMonth)).toThrow(
      "Failed to determine quarter"
    );
  });

  test("Month Quarter Getter with month number < 1", () => {
    const givenMonth = 0.9;

    expect(() => getMonthQuarter(givenMonth)).toThrow(
      "Failed to determine quarter"
    );
  });

  test("Month Quarter Getter with month number 1", () => {
    const givenMonth = 1;
    const result = getMonthQuarter(givenMonth);
    expect(result).toBe("Q4");
  });

  test("Month Quarter Getter with month string '01'", () => {
    const givenMonth = "01";
    const result = getMonthQuarter(givenMonth);
    expect(result).toBe("Q4");
  });

  test("Month Quarter Getter with month number 2", () => {
    const givenMonth = 2;
    const result = getMonthQuarter(givenMonth);
    expect(result).toBe("Q4");
  });

  test("Month Quarter Getter with month number 3", () => {
    const givenMonth = 3;
    const result = getMonthQuarter(givenMonth);
    expect(result).toBe("Q4");
  });

  test("Month Quarter Getter with month number 3.9", () => {
    const givenMonth = 3.9;
    const result = getMonthQuarter(givenMonth);
    expect(result).toBe("Q4");
  });

  test("Month Quarter Getter with month number 4", () => {
    const givenMonth = 4;
    const result = getMonthQuarter(givenMonth);
    expect(result).toBe("Q1");
  });

  test("Month Quarter Getter with month number 6.9", () => {
    const givenMonth = 6.9;
    const result = getMonthQuarter(givenMonth);
    expect(result).toBe("Q1");
  });

  test("Month Quarter Getter with month number 8", () => {
    const givenMonth = 8;
    const result = getMonthQuarter(givenMonth);
    expect(result).toBe("Q2");
  });

  test("Month Quarter Getter with month number 11", () => {
    const givenMonth = 11;
    const result = getMonthQuarter(givenMonth);
    expect(result).toBe("Q3");
  });

  test("Month Quarter Getter with month number 12.1", () => {
    const givenMonth = 12.1;
    const result = getMonthQuarter(givenMonth);
    expect(result).toBe("Q3");
  });

  test("Month Quarter Getter with month number 13", () => {
    const givenMonth = 13;
    const result = getMonthQuarter(givenMonth);
    expect(result).toBe("Q3");
  });

  test("Month Quarter Getter with month number 123.456", () => {
    const givenMonth = 123.456;
    const result = getMonthQuarter(givenMonth);
    expect(result).toBe("Q3");
  });
});

describe("Quarter Month Getter", () => {
  test("Quarter Month Getter with non-quarter string", () => {
    const givenQuarter = "foo";
    expect(() => getQuarterMonth(givenQuarter)).toThrow("Invalid");
  });

  test("Quarter Month Getter with Q1", () => {
    const givenQuarter = "Q1";
    const result = getQuarterMonth(givenQuarter);
    expect(result).toBe(4);
  });

  test("Quarter Month Getter with Q2", () => {
    const givenQuarter = "Q2";
    const result = getQuarterMonth(givenQuarter);
    expect(result).toBe(7);
  });

  test("Quarter Month Getter with Q3", () => {
    const givenQuarter = "Q3";
    const result = getQuarterMonth(givenQuarter);
    expect(result).toBe(10);
  });

  test("Quarter Month Getter with Q4", () => {
    const givenQuarter = "Q4";
    const result = getQuarterMonth(givenQuarter);
    expect(result).toBe(1);
  });
});

describe("Quarter Start String Getter", () => {
  test("Quarter Start String Getter with date at start of quarter", () => {
    const givenDate = new Date("2000-01-01");
    const result = getQuarterStartString(givenDate);
    expect(result).toBe("2000-01-01");
  });

  test("Quarter Start String Getter with date in middle of quarter", () => {
    const givenDate = new Date("2000-05-15");
    const result = getQuarterStartString(givenDate);
    expect(result).toBe("2000-04-01");
  });

  test("Quarter Start String Getter with date at end of quarter", () => {
    const givenDate = new Date("2000-09-30");
    const result = getQuarterStartString(givenDate);
    expect(result).toBe("2000-07-01");
  });

  test("Quarter Start String Getter with date string", () => {
    const givenString = "2000-12-31";
    const result = getQuarterStartString(givenString);
    expect(result).toBe("2000-10-01");
  });

  test("Quarter Start String Getter with invalid date", () => {
    const givenDate = new Date("foo");
    expect(() => getQuarterStartString(givenDate)).toThrow("Unsupported");
  });
});

describe("Quarter Type Guard", () => {
  test("Quarter Type Guard with non-quarter string", () => {
    const givenString = "foo";
    const result = isQuarter(givenString);
    expect(result).toBe(false);
  });

  test("Quarter Type Guard with Q1", () => {
    const givenString = "Q1";
    const result = isQuarter(givenString);
    expect(result).toBe(true);
  });

  test("Quarter Type Guard with Q2", () => {
    const givenString = "Q2";
    const result = isQuarter(givenString);
    expect(result).toBe(true);
  });

  test("Quarter Type Guard with Q3", () => {
    const givenString = "Q3";
    const result = isQuarter(givenString);
    expect(result).toBe(true);
  });

  test("Quarter Type Guard with Q4", () => {
    const givenString = "Q4";
    const result = isQuarter(givenString);
    expect(result).toBe(true);
  });
});
