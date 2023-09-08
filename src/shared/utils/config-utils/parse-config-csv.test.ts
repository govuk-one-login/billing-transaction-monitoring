import { parseConfigCsv } from "./parse-config-csv";
import { CsvParserOptions } from "./types";

describe("parseConfigCsv", () => {
  let givenCsv: string;
  let givenOptions: CsvParserOptions<any, any>;

  beforeEach(() => {
    givenCsv = `booleanColumn,dateColumn,numberColumn,stringColumn,optionalColumn
true,2000-01-01,123,foo,bar
false,2000-01-02,456,baz,`;

    givenOptions = {
      booleanColumn: { type: "boolean", required: true },
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
          booleanColumn: true,
          dateColumn: new Date("2000-01-01"),
          numberColumn: 123,
          stringColumn: "foo",
          optionalColumn: "bar",
        },
        {
          booleanColumn: false,
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
      await expect(resultPromise).rejects.toThrow("Missing required data");
    });
  });

  describe("invalid date", () => {
    beforeEach(() => {
      givenCsv += "\nfalse,invalid date,123,foo,";
    });

    it("throws error", async () => {
      const resultPromise = parseConfigCsv(givenCsv, givenOptions);
      await expect(resultPromise).rejects.toThrow("Invalid date");
    });
  });

  describe("invalid number", () => {
    beforeEach(() => {
      givenCsv += "\nfalse,2000-01-01,invalid number,foo,";
    });

    it("throws error", async () => {
      const resultPromise = parseConfigCsv(givenCsv, givenOptions);
      await expect(resultPromise).rejects.toThrow("Invalid number");
    });
  });
});
