import { Athena } from "aws-sdk/clients/all";

import { ResultSet } from "@aws-sdk/client-athena";
import { putTextS3 } from "../../shared/utils";
import { AthenaQueryExecutor } from "./athena-query-executor";
import { ExtractDataReformatter } from "./extract-data-reformatter";

const EXTRACT_KEY = "btm_extract_data/full-extract.json";

export const handler = async (): Promise<void> => {
  const storageBucket = process.env.STORAGE_BUCKET;

  if (storageBucket === undefined) {
    throw new Error("STORAGE_BUCKET is undefined");
  }

  const athena = new Athena({ region: "eu-west-2" });

  const fetchDataSql = `SELECT * FROM "${process.env.DATABASE_NAME}".btm_billing_and_transactions_curated`;
  const executor = new AthenaQueryExecutor(athena);
  const results: ResultSet = await executor.fetchResults(fetchDataSql);

  const reformatter = new ExtractDataReformatter();
  const body = await reformatter.getExtractData(results);

  await putTextS3(storageBucket, EXTRACT_KEY, body);
};
