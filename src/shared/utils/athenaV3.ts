import {
  AthenaClient,
  GetQueryExecutionCommand,
  GetQueryResultsCommand,
  ResultSet,
  StartQueryExecutionCommand,
} from "@aws-sdk/client-athena";

const INTERVAL_MS = 1000;
const MAX_ATTEMPTS = 10;

export class AthenaQueryExecutor {
  athena: AthenaClient;
  intervalMillis: number;
  maxAttempts: number;

  constructor(
    athena: AthenaClient,
    intervalMillis = INTERVAL_MS,
    maxAttempts = MAX_ATTEMPTS
  ) {
    this.athena = athena;
    this.intervalMillis = intervalMillis;
    this.maxAttempts = maxAttempts;
  }

  async fetchResults(
    sql: string,
    queryResultsBucket: string
  ): Promise<ResultSet> {
    const params = {
      QueryString: sql,
      ResultConfiguration: {
        OutputLocation: queryResultsBucket,
      },
    };

    const startQueryExecutionCommand = new StartQueryExecutionCommand(params);
    const queryExecution = await this.athena.send(startQueryExecutionCommand);
    const queryExecutionId = queryExecution.QueryExecutionId;

    if (queryExecutionId === undefined) {
      throw new Error("Failed to start execution");
    }

    await this.validate(queryExecutionId);

    const getQueryResultsCommand = new GetQueryResultsCommand({
      QueryExecutionId: queryExecutionId,
    });
    const results = await this.athena.send(getQueryResultsCommand);

    if (results.ResultSet === undefined) {
      throw new Error("Failed to fetch results");
    }
    return results.ResultSet;
  }

  /** Try to confirm that query with given ID was successful, and throw error if that fails */
  async validate(id: string): Promise<void> {
    let attempts = 0;

    while (attempts < this.maxAttempts) {
      const getQueryExecutionCommand = new GetQueryExecutionCommand({
        QueryExecutionId: id,
      });
      const { QueryExecution: queryExecution } = await this.athena.send(
        getQueryExecutionCommand
      );

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

      console.log(`Continuing to wait after ${queryExecutionState} received.`);

      await new Promise((resolve) => setTimeout(resolve, this.intervalMillis));
    }

    throw new Error(
      `Failed to get successful query execution after ${this.maxAttempts} attempts.`
    );
  }
}
