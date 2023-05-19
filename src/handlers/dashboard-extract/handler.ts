import AWS from "aws-sdk";
import { Athena } from "aws-sdk/clients/all";
import { QueryExecutionState } from "aws-sdk/clients/athena";

// import {Context, SQSEvent} from "aws-lambda";
import { Response } from "../../shared/types";
// import {
//   fetchS3,
//   getS3EventRecordsFromSqs,
//   getVendorServiceConfigRows,
//   logger,
//   sendRecord,
// } from "../../shared/utils";

export const handler = async (): Promise<Response> => {
  const response: Response = {
    batchItemFailures: [],
  };

  const sql = `SELECT * FROM ${process.env.VIEW_TO_EXTRACT}`;

  console.log("Query", sql);

  const results = await query(sql);

  console.log("Got results", results);

  return response;
};

const athena: Athena = new AWS.Athena();

export async function query(sql: string): Promise<any> {
  const params = {
    QueryString: sql,
    ResultConfiguration: {
      OutputLocation: process.env.RESULTS_BUCKET,
    },
  };

  await athena.updateDataCatalog();

  const queryExecution = await athena.startQueryExecution(params).promise();
  const queryExecutionId = queryExecution.QueryExecutionId;

  if (queryExecutionId === null || queryExecutionId === undefined) {
    throw new Error("Failed to start execution");
  }

  console.log("id", queryExecutionId);

  let state: QueryExecutionState = "QUEUED";
  let reason: string | undefined;
  while (state === "RUNNING" || state === "QUEUED") {
    const data = await athena
      .getQueryExecution({ QueryExecutionId: queryExecutionId })
      .promise();
    state = data.QueryExecution?.Status?.State ?? "Unknown";
    reason = data.QueryExecution?.Status?.StateChangeReason;
  }

  if (state !== "SUCCEEDED") {
    throw new Error(`Query execution failed: ${reason}`);
  }

  return await athena
    .getQueryResults({ QueryExecutionId: queryExecutionId })
    .promise();
}
