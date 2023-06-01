import { Athena } from "aws-sdk/clients/all";
import { QueryExecutionState } from "aws-sdk/clients/athena";

export class AthenaQueryExecutor {
  athena: Athena;
  queryResultsBucket: string | undefined;

  INTERVAL_MS = 1000;
  MAX_ATTEMPTS = 10;

  constructor(athena: Athena, queryResultsBucket?: string) {
    this.athena = athena;
    if (queryResultsBucket) this.queryResultsBucket = queryResultsBucket;
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

  /** Try to confirm that query with given ID was successful, and throw error if that fails */
  async validate(id: string): Promise<void> {
    let attempts = 0;

    while (attempts < this.MAX_ATTEMPTS) {
      const { QueryExecution: queryExecution } = await this.athena
        .getQueryExecution({ QueryExecutionId: id })
        .promise();

      attempts += 1;

      const queryExecutionState = queryExecution?.Status?.State;

      if (queryExecutionState === "SUCCEEDED") return;

      if (queryExecutionState === undefined)
        throw new Error("Failed to get query execution state.");

      if (queryExecutionState === "FAILED") {
        const baseErrorMessage = "Query execution failed";

        const athenaErrorMessage = JSON.stringify(queryExecution?.Status);

        const errorMessage =
          athenaErrorMessage === undefined
            ? `${baseErrorMessage}.`
            : `${baseErrorMessage}: ${athenaErrorMessage}`;

        throw new Error(errorMessage);
      }

      if (queryExecutionState === "CANCELLED")
        throw new Error("Query execution cancelled.");

      if (!["QUEUED", "RUNNING"].includes(queryExecutionState))
        throw new Error(
          `Unrecognised query execution state: ${queryExecutionState}`
        );

      await new Promise((resolve) => setTimeout(resolve, this.INTERVAL_MS));
    }

    throw new Error(
      `Failed to get successful query execution after ${this.MAX_ATTEMPTS} attempts.`
    );
  }
}
