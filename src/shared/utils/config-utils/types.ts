export type CsvColumnTypeName = "boolean" | "date" | "number" | "string";
export type CsvColumnValue = boolean | Date | number | string | undefined;

export type ConfigParser<TConfig extends {} | Array<{}>> = (
  rawFile: string
) => TConfig | Promise<TConfig>;

export interface CsvParserColumnOptions {
  type: CsvColumnTypeName;
  required: boolean;
}

export type CsvParserOptions<
  TColumn extends string,
  TRow extends Record<TColumn, CsvColumnValue>
> = Record<keyof TRow, CsvParserColumnOptions>;
