import {
  StartQueryExecutionCommand,
  GetQueryExecutionCommand,
  GetQueryResultsCommand,
} from "@aws-sdk/client-athena";
import { waitForTrue } from "./commonHelpers";
import { athenaClient } from "../clients/athenaClient";
import {resourcePrefix} from "./envHelper";

const prefix = resourcePrefix();

async function startQueryExecutionCommand(eventId: string): Promise<string> {
  const params = {
    QueryExecutionContext: {
      Database: `${prefix}-transactions`,
    },
    QueryString: `SELECT * FROM \"btm_transactions\" where event_id='${eventId.toString()}'`,
    WorkGroup: `${prefix}-athena-workgroup`,
  };
  const response = await athenaClient.send(
    new StartQueryExecutionCommand(params)
  );
  const queryId = response.QueryExecutionId || "queryId not found";
  console.log("QueryExecutionId:", queryId);
  return queryId;
}

async function getQueryExecutionStatus(queryId: string) {
  const params = {
    QueryExecutionId: queryId,
  };
  const response = await athenaClient.send(
    new GetQueryExecutionCommand(params)
  );
  console.log("QueryExecutionStatus:", response.QueryExecution?.Status);
  return response.QueryExecution?.Status;
}

async function getQueryResults(queryId: string): Promise<string> {
  const checkState = async () => {
    const result = await getQueryExecutionStatus(queryId);
    return result?.State?.match("SUCCEEDED");
  };
  const queryStatusSuccess = await waitForTrue(checkState, 5000, 10000);
  if (queryStatusSuccess === true) {
    const params = {
      QueryExecutionId: queryId,
    };
    const response = await athenaClient.send(
      new GetQueryResultsCommand(params)
    );
    return JSON.stringify(response.ResultSet?.Rows);
  }
  return "Query not successful"
}

export { getQueryResults, startQueryExecutionCommand };
