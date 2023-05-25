import { Athena } from "aws-sdk/clients/all";
import { QueryExecutionState } from "aws-sdk/clients/athena";
import { resourcePrefix } from "../int-test-support/helpers/envHelper";

export class AthenaQueryExecutor {
  athena: Athena;

  constructor(athena: Athena) {
    this.athena = athena;
  }

  async fetchResults(sql: string): Promise<Athena.ResultSet> {
    const params = {
      QueryString: sql,
      ResultConfiguration: {
        OutputLocation: process.env.RESULTS_BUCKET,
      },
      WorkGroup: `${resourcePrefix()}-athena-dashboard-extract-workgroup`,
    };

    const queryExecution = await this.athena
      .startQueryExecution(params)
      .promise();
    const queryExecutionId = queryExecution.QueryExecutionId;

    if (queryExecutionId === undefined) {
      throw new Error("Failed to start execution");
    }

    let state: QueryExecutionState = "QUEUED";
    let reason: string | undefined;
    while (state === "RUNNING" || state === "QUEUED") {
      const data = await this.athena
        .getQueryExecution({ QueryExecutionId: queryExecutionId })
        .promise();
      state = data.QueryExecution?.Status?.State ?? "Unknown";
      reason = data.QueryExecution?.Status?.StateChangeReason;
    }

    if (state !== "SUCCEEDED") {
      throw new Error(`Query execution failed: ${reason}`);
    }

    const results = await this.athena
      .getQueryResults({ QueryExecutionId: queryExecutionId })
      .promise();
    if (results.ResultSet === undefined) {
      throw new Error("Failed to fetch results");
    }
    return results.ResultSet;
  }
}
