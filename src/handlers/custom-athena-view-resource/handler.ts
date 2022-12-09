import { CloudFormationCustomResourceEvent, Context } from "aws-lambda";
import { Athena } from "aws-sdk";
import { sendResult } from "../../shared/utils";

interface AthenaViewResourceProperty {
  Database: string;
  Name: string;
  Query: string;
  Workgroup: string;
}

const QUERY_EXECUTION_RETRIEVAL_INTERVAL_MS = 1000;
const QUERY_EXECUTION_RETRIEVAL_MAX_ATTEMPTS = 10;

export const handler = async (
  event: CloudFormationCustomResourceEvent,
  context: Context
): Promise<void> => {
  try {
    const { RequestType: requestType, ResourceProperties: resourceProperties } =
      event;

    if (!("View" in resourceProperties))
      throw new Error("Property `View` not found");

    const view = resourceProperties.View;

    if (typeof view !== "object")
      throw new Error("Property `View` not an object");

    for (const key of ["Database", "Name", "Query", "Workgroup"]) {
      if (!(key in view)) throw new Error(`\`View.${key}\` not found`);

      if (typeof view[key] !== "string")
        throw new Error(`\`View.${key}\` not a string`);
    }

    const {
      Database: database,
      Name: name,
      Query: dataQuery,
      Workgroup: workgroup,
    } = view as AthenaViewResourceProperty;

    const athena = new Athena({ region: "eu-west-2" });

    const { QueryExecutionId: queryExecutionId } = await athena
      .startQueryExecution({
        QueryExecutionContext: {
          Database: database,
        },
        QueryString:
          requestType === "Delete"
            ? `DROP VIEW IF EXISTS "${name}"`
            : `CREATE OR REPLACE VIEW "${name}" AS (${dataQuery})`,
        WorkGroup: workgroup,
      })
      .promise();

    if (queryExecutionId === undefined)
      throw new Error("Failed to start query execution and get ID.");

    let queryExecutionRetrievalAttempts = 0;
    while (
      queryExecutionRetrievalAttempts < QUERY_EXECUTION_RETRIEVAL_MAX_ATTEMPTS
    ) {
      const { QueryExecution: queryExecution } = await athena
        .getQueryExecution({ QueryExecutionId: queryExecutionId })
        .promise();

      queryExecutionRetrievalAttempts += 1;

      const queryExecutionState = queryExecution?.Status?.State;

      if (queryExecutionState === undefined)
        throw new Error("Failed to get query execution state.");
      if (queryExecutionState === "SUCCEEDED") {
        await sendResult({
          context,
          event,
          reason: `${name} ${requestType.toLowerCase()}d in ${database}`,
          status: "SUCCESS",
        });
        return;
      } else if (queryExecutionState === "FAILED") {
        const baseErrorMessage = "Query execution failed";

        const athenaErrorMessage =
          queryExecution?.Status?.AthenaError?.ErrorMessage;

        const errorMessage =
          athenaErrorMessage === undefined
            ? `${baseErrorMessage}.`
            : `${baseErrorMessage}: ${athenaErrorMessage}`;

        throw new Error(errorMessage);
      } else if (queryExecutionState === "CANCELLED")
        throw new Error("Query execution cancelled.");
      else if (!["QUEUED", "RUNNING"].includes(queryExecutionState))
        throw new Error(
          `Unrecognised query execution state: ${queryExecutionState}`
        );

      await new Promise((resolve) =>
        setTimeout(resolve, QUERY_EXECUTION_RETRIEVAL_INTERVAL_MS)
      );
    }

    throw new Error(
      `Failed to get successful query execution after ${QUERY_EXECUTION_RETRIEVAL_MAX_ATTEMPTS} attempts.`
    );
  } catch (error) {
    console.error("Handler error:", error);

    await sendResult({
      context,
      event,
      reason: `See CloudWatch log stream: ${context.logStreamName}`,
      status: "FAILED",
    });
  }
};
