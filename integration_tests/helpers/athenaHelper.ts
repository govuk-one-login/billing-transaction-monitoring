import {
  StartQueryExecutionCommand,
  ListDatabasesCommand,
  GetQueryExecutionCommand,
  GetQueryResultsCommand,
  ListWorkGroupsCommand,
} from "@aws-sdk/client-athena";
import { waitForTrue } from "../helpers/commonHelpers";
import { athenaClient } from "../clients/athenaClient";

async function listDatabases() {
  const params = {
    CatalogName: "AWSDataCatalog",
  };
  const response = await athenaClient.send(new ListDatabasesCommand(params));
  return response.DatabaseList;
}

async function getDatabaseName() {
  const response = await listDatabases();
  const getDBName = response?.find((data) => data.Name?.match("btm"));
  return getDBName?.Name?.valueOf() as string;
}

async function getWorkGroupName() {
  const params = {};
  const response = await athenaClient.send(new ListWorkGroupsCommand(params));
  const name = response.WorkGroups?.find((data) => data.Name?.match("BTM"));
  return name?.Name?.valueOf() as string;
}

let queryId: any;
async function startQueryExecutionCommand(eventId: any) {
  const params = {
    QueryExecutionContext: {
      Database: await getDatabaseName(),
    },
    QueryString: `SELECT * FROM \"btm_transactions\" where event_id='${eventId.toString()}'`,
    WorkGroup: await getWorkGroupName(),
  };
  const response = await athenaClient.send(
    new StartQueryExecutionCommand(params)
  );
  queryId = response.QueryExecutionId;
  console.log("QueryExecutionId:", queryId);
  return response.QueryExecutionId;
}

async function getQueryExecutionStatus() {
  const params = {
    QueryExecutionId: queryId,
  };
  const response = await athenaClient.send(
    new GetQueryExecutionCommand(params)
  );
  console.log("QueryExecutionStatus:", response.QueryExecution?.Status);
  return response.QueryExecution?.Status;
}

async function getQueryResults() {
  const checkState = async () => {
    const result = await getQueryExecutionStatus();
    return result?.State?.match("SUCCEEDED");
  };
  const queryStatusSuccess = await waitForTrue(checkState, 5000, 10000);
  if (queryStatusSuccess == true) {
    const params = {
      QueryExecutionId: queryId,
    };
    const response = await athenaClient.send(
      new GetQueryResultsCommand(params)
    );
    return JSON.stringify(response.ResultSet?.Rows);
  }
}

export { getQueryResults, startQueryExecutionCommand };
