import { parseConfigCsv } from "./parse-config-csv";
import { CsvParserOptions } from "./types";

describe("parseConfigCsv", () => {
  let givenCsv: string;
  let givenOptions: CsvParserOptions<any, any>;

  beforeEach(() => {
    givenCsv = `dateColumn,numberColumn,stringColumn
2000-01-01,,foo
,123,`;

    givenOptions = {
      dateColumn: { type: "date" },
      numberColumn: { type: "number" },
      stringColumn: { type: "string" },
    };
  });

  describe("given valid rows and options", () => {
    it("returns rows matching given options", async () => {
      const result = await parseConfigCsv(givenCsv, givenOptions);

      expect(result).toEqual([
        {
          dateColumn: new Date("2000-01-01"),
          numberColumn: undefined,
          stringColumn: "foo",
        },
        {
          dateColumn: undefined,
          numberColumn: 123,
          stringColumn: undefined,
        },
      ]);
    });
  });

  describe("column in options not in file", () => {
    beforeEach(() => {
      givenOptions.missingColumn = { type: "string" };
    });

    it("throws error", async () => {
      const resultPromise = parseConfigCsv(givenCsv, givenOptions);

      await expect(resultPromise).rejects.toThrow(
        "Column `missingColumn` not in CSV"
      );
    });
  });

  describe("required column empty", () => {
    beforeEach(() => {
      givenOptions.numberColumn.required = true;
    });

    it("throws error", async () => {
      const resultPromise = parseConfigCsv(givenCsv, givenOptions);
      await expect(resultPromise).rejects.toThrow("CSV missing required data");
    });
  });

  describe("invalid date", () => {
    beforeEach(() => {
      givenCsv += "\ninvalid date,,";
    });

    it("throws error", async () => {
      const resultPromise = parseConfigCsv(givenCsv, givenOptions);
      await expect(resultPromise).rejects.toThrow("Invalid date in CSV");
    });
  });

  describe("invalid number", () => {
    beforeEach(() => {
      givenCsv += "\n,invalid number,";
    });

    it("throws error", async () => {
      const resultPromise = parseConfigCsv(givenCsv, givenOptions);
      await expect(resultPromise).rejects.toThrow("Invalid number in CSV");
    });
  });
});
