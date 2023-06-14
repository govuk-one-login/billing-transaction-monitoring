import { fetchViewData } from "./fetch-view-data";
import { HandlerCtx } from "../../handler-context";
import { Env } from "./types";
import { ResultSet } from "@aws-sdk/client-athena";

export const businessLogic = async (
  _: unknown,
  { env, logger }: HandlerCtx<Env, any, any>
): Promise<string[]> => {
  const results = await fetchViewData(env);

  const body = formatResults(results);

  logger.info(`Extracted ${results.Rows?.length} rows.`);

  return [body];
};

const formatResults = (results: ResultSet): string => {
  if (results.Rows === undefined) {
    throw new Error("No results in result set");
  }
  const rows = results.Rows;

  // The column headers are returned as the 0th element of result set.
  // For each of the remaining rows, we need to generate key/value pairs
  // where the keys are the column header names.
  const columnHeaders = rows[0].Data;
  if (columnHeaders === undefined) {
    throw new Error("No column headers found");
  }

  const outputRows = rows
    .slice(1)
    .reduce((accumulator: Array<Record<string, string>>, currentRow) => {
      const currentRowData = currentRow?.Data;
      if (currentRowData === undefined) {
        throw new Error("Row missing");
      }
      const outputRow = columnHeaders.reduce(
        (rowAccumulator: Record<string, string>, columnHeader, index) => {
          const key = columnHeader.VarCharValue;
          if (key === undefined) {
            throw new Error("Column header missing");
          }
          const value = currentRowData[index].VarCharValue;
          rowAccumulator[key] = value ?? "";
          return rowAccumulator;
        },
        {}
      );
      accumulator.push(outputRow);
      return accumulator;
    }, []);

  return outputRows.map((row) => JSON.stringify(row)).join("\n");
};
