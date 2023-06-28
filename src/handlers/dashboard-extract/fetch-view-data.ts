import { AthenaClient, ResultSet } from "@aws-sdk/client-athena";
import { Env } from "./types";
import { AthenaQueryExecutor } from "../../shared/utils/athena";

const athena = new AthenaClient({ region: "eu-west-2" });

const QUERY_WAIT = 30 * 1000; // Thirty seconds

export async function fetchViewData(
  env: Record<Env, string>
): Promise<ResultSet> {
  const fetchDataSql = `SELECT * FROM "${env.DATABASE_NAME}".btm_billing_and_transactions_curated`;
  const executor = new AthenaQueryExecutor(athena, QUERY_WAIT);
  return await executor.fetchResults(fetchDataSql, env.QUERY_RESULTS_BUCKET);
}
