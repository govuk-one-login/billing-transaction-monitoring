export type CsvColumnTypeName = "date" | "number" | "string" | "boolean";
export type CsvColumnValue = Date | number | string | boolean | undefined;

export type ConfigParser<TConfig extends {} | Array<{}>> = (
  rawFile: string
) => TConfig | Promise<TConfig>;

export interface ParserOptions {
  type: CsvColumnTypeName;
  required: boolean;
}

export type CsvParserOptions<
  TColumn extends string,
  TRow extends Record<TColumn, CsvColumnValue>
> = Record<keyof TRow, ParserOptions>;
