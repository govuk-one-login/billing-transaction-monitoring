import csvToJson from "csvtojson";
import {
  CsvColumnValue,
  CsvParserColumnOptions,
  CsvParserOptions,
} from "./types";

export const parseConfigCsv = async <
  TColumn extends string,
  TRow extends Record<TColumn, CsvColumnValue>
>(
  csv: string,
  options: CsvParserOptions<TColumn, TRow>
): Promise<TRow[]> => {
  const rows = await csvToJson().fromString(csv);
  return rows.map((row) => parseConfigCsvRow(row, options));
};

const parseConfigCsvRow = <
  TColumn extends string,
  TRow extends Record<TColumn, CsvColumnValue>
>(
  row: {},
  options: CsvParserOptions<TColumn, TRow>
): TRow => {
  const parsedRow: Partial<TRow> = {};

  for (const columnName in options) {
    if (!(columnName in row))
      throw new Error(`Column \`${columnName}\` not in CSV`);

    const cell = row[columnName as keyof typeof row];
    const columnOptions = options[columnName];
    parsedRow[columnName] = parseConfigCsvCell(cell, columnOptions) as any;
  }

  return parsedRow as TRow;
};

const parseConfigCsvCell = (
  cell: string,
  options: CsvParserColumnOptions
): CsvColumnValue => {
  if (cell === "") {
    if (options.required) throw new Error("CSV missing required data");
    return undefined;
  }

  switch (options.type) {
    case "date": {
      const date = new Date(cell);

      if (date.toString() === "Invalid Date")
        throw new Error("Invalid date in CSV");

      return date;
    }

    case "number": {
      const number = parseInt(cell, 10);
      if (Number.isNaN(number)) throw new Error("Invalid number in CSV");
      return number;
    }

    case "string":
      return cell;
  }
};
