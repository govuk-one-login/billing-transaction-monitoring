import { parseConfigCsv } from "./parse-config-csv";
import { CsvParserOptions } from "./types";

describe("parseConfigCsv", () => {
  let givenCsv: string;
  let givenOptions: CsvParserOptions<any, any>;

  beforeEach(() => {
    givenCsv = `dateColumn,numberColumn,stringColumn,optionalColumn
2000-01-01,123,foo,bar
2000-01-02,456,baz,`;

    givenOptions = {
      dateColumn: { type: "date", required: true },
      numberColumn: { type: "number", required: true },
      stringColumn: { type: "string", required: true },
      optionalColumn: { type: "string", required: false },
    };
  });

  describe("given valid rows and options", () => {
    it("returns rows matching given options", async () => {
      const result = await parseConfigCsv(givenCsv, givenOptions);

      expect(result).toEqual([
        {
          dateColumn: new Date("2000-01-01"),
          numberColumn: 123,
          stringColumn: "foo",
          optionalColumn: "bar",
        },
        {
          dateColumn: new Date("2000-01-02"),
          numberColumn: 456,
          stringColumn: "baz",
        },
      ]);
    });
  });

  describe("required column in options not in file", () => {
    beforeEach(() => {
      givenOptions.missingColumn = { type: "string", required: true };
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
      givenOptions.optionalColumn.required = true;
    });

    it("throws error", async () => {
      const resultPromise = parseConfigCsv(givenCsv, givenOptions);
      await expect(resultPromise).rejects.toThrow("CSV missing required data");
    });
  });

  describe("invalid date", () => {
    beforeEach(() => {
      givenCsv += "\ninvalid date,123,foo,";
    });

    it("throws error", async () => {
      const resultPromise = parseConfigCsv(givenCsv, givenOptions);
      await expect(resultPromise).rejects.toThrow("Invalid date in CSV");
    });
  });

  describe("invalid number", () => {
    beforeEach(() => {
      givenCsv += "\n2000-01-01,invalid number,foo,";
    });

    it("throws error", async () => {
      const resultPromise = parseConfigCsv(givenCsv, givenOptions);
      await expect(resultPromise).rejects.toThrow("Invalid number in CSV");
    });
  });
});
