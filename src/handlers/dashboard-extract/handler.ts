import { Athena } from "aws-sdk/clients/all";

import { ResultSet } from "@aws-sdk/client-athena";
import { putTextS3 } from "../../shared/utils";
import { AthenaQueryExecutor } from "./athena-query-executor";

export const handler = async (): Promise<void> => {
  const athena = new Athena({ region: "eu-west-2" });

  const fetchDataSql = `SELECT * FROM "${process.env.DATABASE_NAME}".btm_billing_and_transactions_curated`;
  const executor = new AthenaQueryExecutor(athena);
  const results: ResultSet = await executor.fetchResults(fetchDataSql);
  await writeExtractToS3(results);
};

async function writeExtractToS3(results: ResultSet): Promise<void> {
  const storageBucket = process.env.STORAGE_BUCKET;

  if (storageBucket === undefined) {
    throw new Error("STORAGE_BUCKET is undefined");
  }

  const body = getExtractData(results);

  await putTextS3(storageBucket, "btm_extract_data/full-extract.json", body);
}

function getExtractData(results: ResultSet): string {
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
      if (value === undefined) {
        throw new Error("Cell value missing");
      }
      outputRow[key] = value;
    }
    lines.push(JSON.stringify(outputRow));
  }

  return lines.join("\n");
}
