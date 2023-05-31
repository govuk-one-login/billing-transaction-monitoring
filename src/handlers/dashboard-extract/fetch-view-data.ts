import { Athena } from "aws-sdk/clients/all";

import { ResultSet } from "@aws-sdk/client-athena";
import { AthenaQueryExecutor } from "./athena-query-executor";
import { Env } from "./types";

const athena = new Athena({ region: "eu-west-2" });

export async function fetchViewData(
  env: Record<Env, string>
): Promise<ResultSet> {
  const fetchDataSql = `SELECT * FROM "${env.DATABASE_NAME}".btm_billing_and_transactions_curated`;
  const executor = new AthenaQueryExecutor(athena, env.QUERY_RESULTS_BUCKET);
  return await executor.fetchResults(fetchDataSql);
}
