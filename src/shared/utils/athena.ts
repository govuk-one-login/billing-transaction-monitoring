import { Athena } from "aws-sdk/clients/all";

export class AthenaQueryExecutor {
  athena: Athena;

  INTERVAL_MS = 1000;
  MAX_ATTEMPTS = 10;

  constructor(athena: Athena) {
    this.athena = athena;
  }

  async fetchResults(
    sql: string,
    queryResultsBucket: string
  ): Promise<Athena.ResultSet> {
    const params = {
      QueryString: sql,
      ResultConfiguration: {
        OutputLocation: queryResultsBucket,
      },
    };

    const queryExecution = await this.athena
      .startQueryExecution(params)
      .promise();
    const queryExecutionId = queryExecution.QueryExecutionId;

    if (queryExecutionId === undefined) {
      throw new Error("Failed to start execution");
    }

    await this.validate(queryExecutionId);

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
