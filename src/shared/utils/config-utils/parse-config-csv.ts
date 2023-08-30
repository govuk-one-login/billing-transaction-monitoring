import csvToJson from "csvtojson";
import { CsvColumnValue, CsvParserOptions } from "./types";
import { parseConfigCell } from "./parse-config-cell";

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
    if (options[columnName].required && !(columnName in row))
      throw new Error(`Column \`${columnName}\` not in CSV`);

    const cell = row[columnName as keyof typeof row];
    const columnOptions = options[columnName];
    parsedRow[columnName] = parseConfigCell(cell, columnOptions) as any;
  }

  return parsedRow as TRow;
};
