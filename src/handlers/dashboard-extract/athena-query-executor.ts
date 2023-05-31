import { Athena } from "aws-sdk/clients/all";
import { QueryExecutionState } from "aws-sdk/clients/athena";

export class AthenaQueryExecutor {
  athena: Athena;
  queryResultsBucket: string;

  constructor(athena: Athena, queryResultsBucket: string) {
    this.athena = athena;
    this.queryResultsBucket = queryResultsBucket;
  }

  async fetchResults(sql: string): Promise<Athena.ResultSet> {
    const params = {
      QueryString: sql,
      ResultConfiguration: {
        OutputLocation: this.queryResultsBucket,
      },
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
