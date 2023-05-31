import { fetchViewData } from "./fetch-view-data";
import { HandlerCtx } from "../../handler-context";
import { Env } from "./types";
import { ResultSet } from "@aws-sdk/client-athena";

export const businessLogic = async (
  _: never,
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

  const lines = [];

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i].Data;
    if (row === undefined) {
      throw new Error("Row missing");
    }
    const outputRow: Record<string, string> = {};
    for (let j = 0; j < columnHeaders.length; j++) {
      const key = columnHeaders[j].VarCharValue;
      if (key === undefined) {
        throw new Error("Column header missing");
      }
      const value = row[j].VarCharValue;
      outputRow[key] = value ?? "";
    }
    lines.push(JSON.stringify(outputRow));
  }

  return lines.join("\n");
};
