import { getActivePeriods } from "./get-active-periods";
import { Period } from "./period";

const now = new Date("2020-03-02");

beforeAll(() => {
  jest.useFakeTimers();
  jest.setSystemTime(now);
});

afterAll(() => {
  jest.useRealTimers();
});

describe("getActivePeriods", () => {
  describe("Fixed type", () => {
    describe("Monthly frequency", () => {
      const now = new Date("2020-01-02");

      const pastMidMonthStart = new Date("2019/12/15");
      const futureMidMonthStart = new Date("2020/02/05");
      const futureMidMonthEnd = new Date("2020/02/15");

      const pastPeriod: Period = {
        year: 2019,
        month: 11, // December
        isQuarterly: false,
      };

      const presentPeriod: Period = {
        year: 2020,
        month: 0, // January
        isQuarterly: false,
      };

      test("finds no active periods if date range is in future", async () => {
        expect(
          getActivePeriods(
            now,
            "monthly",
            "fixed",
            futureMidMonthStart,
            futureMidMonthEnd
          )
        ).toEqual([]);
      });

      test("finds active periods only up to and including the present if start is in past and end is in future", async () => {
        expect(
          getActivePeriods(
            now,
            "monthly",
            "fixed",
            pastMidMonthStart,
            futureMidMonthEnd
          )
        ).toEqual([pastPeriod, presentPeriod]);
      });

      test("finds active periods only up to and including the present if start is in past and there is no end date", async () => {
        expect(
          getActivePeriods(now, "monthly", "fixed", pastMidMonthStart)
        ).toEqual([pastPeriod, presentPeriod]);
      });
    });

    describe("Quarterly frequency", () => {
      const now = new Date("2020-02-02");

      const pastMidQuarterStart = new Date("2019/11/15");
      const futureMidQuarterStart = new Date("2020/05/05");
      const futureMidQuarterEnd = new Date("2020/05/15");

      const pastPeriod: Period = {
        year: 2019,
        month: 9, // Octboer
        isQuarterly: true,
      };

      const presentPeriod: Period = {
        year: 2020,
        month: 0, // January
        isQuarterly: true,
      };

      test("finds no active periods if date range is in future", async () => {
        expect(
          getActivePeriods(
            now,
            "quarterly",
            "fixed",
            futureMidQuarterStart,
            futureMidQuarterEnd
          )
        ).toEqual([]);
      });

      test("finds active periods only up to and including the present if start is in past and end is in future", async () => {
        expect(
          getActivePeriods(
            now,
            "quarterly",
            "fixed",
            pastMidQuarterStart,
            futureMidQuarterEnd
          )
        ).toEqual([pastPeriod, presentPeriod]);
      });

      test("finds active periods only up to and including the present if start is in past and there is no end date", async () => {
        expect(
          getActivePeriods(now, "quarterly", "fixed", pastMidQuarterStart)
        ).toEqual([pastPeriod, presentPeriod]);
      });
    });
  });

  describe("Shortfall type", () => {
    describe("Monthly frequency", () => {
      const now = new Date("2020-01-02");

      const pastMidMonthStart = new Date("2019/12/15");
      const futureMidMonthStart = new Date("2020/02/05");
      const futureMidMonthEnd = new Date("2020/02/15");

      const pastPeriod: Period = {
        year: 2019,
        month: 11, // December
        isQuarterly: false,
      };

      test("finds no active periods if date range is in future", async () => {
        expect(
          getActivePeriods(
            now,
            "monthly",
            "shortfall",
            futureMidMonthStart,
            futureMidMonthEnd
          )
        ).toEqual([]);
      });

      test("finds active periods only up to but not including the present if start is in past and end is in future", async () => {
        expect(
          getActivePeriods(
            now,
            "monthly",
            "shortfall",
            pastMidMonthStart,
            futureMidMonthEnd
          )
        ).toEqual([pastPeriod]);
      });

      test("finds active periods only up to and including the present if start is in past and there is no end date", async () => {
        expect(
          getActivePeriods(now, "monthly", "shortfall", pastMidMonthStart)
        ).toEqual([pastPeriod]);
      });
    });

    describe("Quarterly frequency", () => {
      const now = new Date("2020-02-02");

      const pastMidQuarterStart = new Date("2019/11/15");
      const futureMidQuarterStart = new Date("2020/05/05");
      const futureMidQuarterEnd = new Date("2020/05/15");

      const pastPeriod: Period = {
        year: 2019,
        month: 9, // Octboer
        isQuarterly: true,
      };

      test("finds no active periods if date range is in future", async () => {
        expect(
          getActivePeriods(
            now,
            "quarterly",
            "shortfall",
            futureMidQuarterStart,
            futureMidQuarterEnd
          )
        ).toEqual([]);
      });

      test("finds active periods only up to but not including the present if start is in past and end is in future", async () => {
        expect(
          getActivePeriods(
            now,
            "quarterly",
            "shortfall",
            pastMidQuarterStart,
            futureMidQuarterEnd
          )
        ).toEqual([pastPeriod]);
      });

      test("finds active periods only up to but not including the present if start is in past and there is no end date", async () => {
        expect(
          getActivePeriods(now, "quarterly", "shortfall", pastMidQuarterStart)
        ).toEqual([pastPeriod]);
      });
    });
  });
});
