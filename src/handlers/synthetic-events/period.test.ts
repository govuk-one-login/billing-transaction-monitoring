import {
  getPeriodStart,
  nextPeriod,
  Period,
  periodContains,
  periodIsBefore,
  periodsAreEqual,
} from "./period";

describe("Period tests", () => {
  describe("getPeriodStart", () => {
    test.each`
      date            | quarterly | periodStart
      ${"2019/12/31"} | ${false}  | ${"2019/12/01"}
      ${"2020/01/01"} | ${false}  | ${"2020/01/01"}
      ${"2020/02/15"} | ${false}  | ${"2020/02/01"}
      ${"2020/03/31"} | ${false}  | ${"2020/03/01"}
      ${"2020/04/01"} | ${false}  | ${"2020/04/01"}
      ${"2019/12/31"} | ${true}   | ${"2019/10/01"}
      ${"2020/01/01"} | ${true}   | ${"2020/01/01"}
      ${"2020/02/15"} | ${true}   | ${"2020/01/01"}
      ${"2020/03/31"} | ${true}   | ${"2020/01/01"}
      ${"2020/04/01"} | ${true}   | ${"2020/04/01"}
    `(
      "Period start for $date, when quarterly is $quarterly, should be $periodStart",
      async ({ ...data }) => {
        const expectedDate = new Date(data.periodStart);
        expect(
          getPeriodStart(new Date(data.date), data.quarterly as boolean)
        ).toEqual({
          month: expectedDate.getMonth() + 1,
          year: expectedDate.getFullYear(),
          isQuarterly: data.quarterly as boolean,
        });
      }
    );
  });

  describe("periodIsBefore", () => {
    test.each`
      year1     | month1  | year2     | month2  | expectedResult
      ${"2019"} | ${"01"} | ${"2019"} | ${"02"} | ${true}
      ${"2019"} | ${"02"} | ${"2020"} | ${"01"} | ${true}
      ${"2019"} | ${"01"} | ${"2020"} | ${"02"} | ${true}
      ${"2015"} | ${"01"} | ${"2025"} | ${"02"} | ${true}
      ${"2020"} | ${"01"} | ${"2020"} | ${"01"} | ${false}
      ${"2020"} | ${"02"} | ${"2020"} | ${"01"} | ${false}
      ${"2020"} | ${"01"} | ${"2019"} | ${"02"} | ${false}
    `(
      "Expect $year1-$month1 before $year2-$month2 to be $expectedResult",
      async ({ ...data }) => {
        const period1 = {
          year: data.year1,
          month: data.month1,
          isQuarterly: false,
        };
        const period2 = {
          year: data.year2,
          month: data.month2,
          isQuarterly: false,
        };
        expect(periodIsBefore(period1, period2)).toEqual(
          data.expectedResult as boolean
        );
      }
    );
  });

  describe("periodsAreEqual", () => {
    test.each`
      year1     | month1  | year2     | month2  | expectedResult
      ${"2019"} | ${"01"} | ${"2020"} | ${"01"} | ${false}
      ${"2020"} | ${"01"} | ${"2020"} | ${"01"} | ${true}
      ${"2015"} | ${"03"} | ${"2015"} | ${"03"} | ${true}
      ${"2015"} | ${"01"} | ${"2025"} | ${"02"} | ${false}
    `(
      "Expect $year1-$month1 before $year2-$month2 to be $expectedResult",
      async ({ ...data }) => {
        const period1 = {
          year: data.year1,
          month: data.month1,
          isQuarterly: false,
        };
        const period2 = {
          year: data.year2,
          month: data.month2,
          isQuarterly: false,
        };
        expect(periodsAreEqual(period1, period2)).toEqual(
          data.expectedResult as boolean
        );
      }
    );
  });

  describe("nextPeriod", () => {
    test.each`
      year    | month | quarterly | expectedYear | expectedMonth
      ${2019} | ${1}  | ${false}  | ${2019}      | ${2}
      ${2019} | ${2}  | ${false}  | ${2019}      | ${3}
      ${2020} | ${2}  | ${false}  | ${2020}      | ${3}
      ${2015} | ${4}  | ${false}  | ${2015}      | ${5}
      ${2015} | ${12} | ${false}  | ${2016}      | ${1}
      ${2019} | ${1}  | ${true}   | ${2019}      | ${4}
      ${2019} | ${4}  | ${true}   | ${2019}      | ${7}
      ${2020} | ${7}  | ${true}   | ${2020}      | ${10}
      ${2015} | ${10} | ${true}   | ${2016}      | ${1}
    `(
      "Expect $year1-$month1 before $year2-$month2 to be $expectedResult",
      async ({ ...data }) => {
        const period: Period = {
          year: data.year,
          month: data.month,
          isQuarterly: data.quarterly,
        };
        const expectedNextPeriod: Period = {
          year: data.expectedYear,
          month: data.expectedMonth,
          isQuarterly: data.quarterly,
        };
        expect(nextPeriod(period)).toEqual(expectedNextPeriod);
      }
    );
  });

  describe("periodContains", () => {
    test.each`
      year1   | month1 | quarterly1 | year2   | month2 | quarterly2 | expectedResult
      ${2019} | ${1}   | ${false}   | ${2019} | ${1}   | ${false}   | ${true}
      ${2019} | ${12}  | ${false}   | ${2019} | ${12}  | ${false}   | ${true}
      ${2019} | ${1}   | ${false}   | ${2019} | ${2}   | ${false}   | ${false}
      ${2019} | ${2}   | ${false}   | ${2019} | ${1}   | ${false}   | ${false}
      ${2019} | ${2}   | ${false}   | ${2020} | ${2}   | ${false}   | ${false}
      ${2019} | ${1}   | ${true}    | ${2019} | ${1}   | ${true}    | ${true}
      ${2019} | ${10}  | ${true}    | ${2019} | ${10}  | ${true}    | ${true}
      ${2019} | ${1}   | ${true}    | ${2019} | ${4}   | ${true}    | ${false}
      ${2019} | ${4}   | ${true}    | ${2019} | ${1}   | ${true}    | ${false}
      ${2019} | ${1}   | ${true}    | ${2020} | ${1}   | ${true}    | ${false}
      ${2019} | ${1}   | ${true}    | ${2019} | ${1}   | ${false}   | ${true}
      ${2019} | ${1}   | ${true}    | ${2019} | ${2}   | ${false}   | ${true}
      ${2019} | ${1}   | ${true}    | ${2019} | ${3}   | ${false}   | ${true}
      ${2019} | ${1}   | ${true}    | ${2019} | ${4}   | ${false}   | ${false}
      ${2019} | ${4}   | ${true}    | ${2019} | ${4}   | ${false}   | ${true}
      ${2019} | ${4}   | ${true}    | ${2019} | ${5}   | ${false}   | ${true}
      ${2019} | ${4}   | ${true}    | ${2019} | ${6}   | ${false}   | ${true}
      ${2019} | ${4}   | ${true}    | ${2019} | ${7}   | ${false}   | ${false}
      ${2019} | ${7}   | ${true}    | ${2019} | ${7}   | ${false}   | ${true}
      ${2019} | ${7}   | ${true}    | ${2019} | ${8}   | ${false}   | ${true}
      ${2019} | ${7}   | ${true}    | ${2019} | ${9}   | ${false}   | ${true}
      ${2019} | ${7}   | ${true}    | ${2019} | ${10}  | ${false}   | ${false}
      ${2019} | ${10}  | ${true}    | ${2019} | ${10}  | ${false}   | ${true}
      ${2019} | ${10}  | ${true}    | ${2019} | ${11}  | ${false}   | ${true}
      ${2019} | ${10}  | ${true}    | ${2019} | ${12}  | ${false}   | ${true}
      ${2019} | ${10}  | ${true}    | ${2019} | ${9}   | ${false}   | ${false}
      ${2019} | ${1}   | ${false}   | ${2019} | ${1}   | ${true}    | ${false}
    `(
      "Expect $year1-$month1-$quarterly contains $year2-$month2-$quarterly2 to be $expectedResult",
      async ({ ...data }) => {
        const period1: Period = {
          year: data.year1,
          month: data.month1,
          isQuarterly: data.quarterly1,
        };
        const period2: Period = {
          year: data.year2,
          month: data.month2,
          isQuarterly: data.quarterly2,
        };
        expect(periodContains(period1, period2)).toEqual(data.expectedResult);
      }
    );
  });
});
