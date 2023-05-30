import { Athena } from "aws-sdk/clients/all";

import { ResultSet } from "@aws-sdk/client-athena";
import { AthenaQueryExecutor } from "./athena-query-executor";
import { ExtractDataReformatter } from "./extract-data-reformatter";
import { BusinessLogic } from "../../handler-context";
import { Env } from "./types";

export const businessLogic: BusinessLogic<never, Env, never, string> = async (
  _,
  { logger }
) => {
  const athena = new Athena({ region: "eu-west-2" });

  const fetchDataSql = `SELECT * FROM "${process.env.DATABASE_NAME}".btm_billing_and_transactions_curated`;
  const executor = new AthenaQueryExecutor(athena);
  const results: ResultSet = await executor.fetchResults(fetchDataSql);

  const reformatter = new ExtractDataReformatter();
  const body = await reformatter.getExtractData(results);

  logger.info(`Extracted ${results.Rows?.length} rows.`);

  return [body];
};
