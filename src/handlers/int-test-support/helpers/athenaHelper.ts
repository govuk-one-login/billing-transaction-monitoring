import {
  StartQueryExecutionCommand,
  GetQueryExecutionCommand,
  GetQueryResultsCommand,
  QueryExecutionStatus,
  GetQueryResultsCommandOutput,
} from "@aws-sdk/client-athena";
import { waitForTrue } from "./commonHelpers";
import { resourcePrefix, runViaLambda } from "./envHelper";
import { athenaClient } from "../clients";
import { sendLambdaCommand } from "./lambdaHelper";

interface StringObject {
  [key: string]: string;
}

interface DatabaseQuery {
  databaseName: string;
  queryString: string;
}

const startQueryExecutionCommand = async (
  query: DatabaseQuery
): Promise<string> => {
  if (runViaLambda())
    return await sendLambdaCommand("startQueryExecutionCommand", query);
  const params = {
    QueryExecutionContext: {
      Database: query.databaseName,
    },
    QueryString: query.queryString,
    WorkGroup: `${resourcePrefix()}-athena-workgroup`,
  };
  const response = await athenaClient.send(
    new StartQueryExecutionCommand(params)
  );
  const queryId = response.QueryExecutionId ?? "queryId not found";
  return queryId;
};

const getQueryExecutionStatus = async (
  queryId: string
): Promise<QueryExecutionStatus | undefined> => {
  if (runViaLambda())
    return (await sendLambdaCommand(
      "getQueryExecutionStatus",
      queryId
    )) as QueryExecutionStatus;
  const params = {
    QueryExecutionId: queryId,
  };
  const response = await athenaClient.send(
    new GetQueryExecutionCommand(params)
  );
  return response.QueryExecution?.Status;
};

const getQueryResults = async (
  queryId: string
): Promise<GetQueryResultsCommandOutput | undefined> => {
  if (runViaLambda())
    return (await sendLambdaCommand(
      "getQueryResults",
      queryId
    )) as unknown as GetQueryResultsCommandOutput;
  const params = {
    QueryExecutionId: queryId,
  };
  const response = await athenaClient.send(new GetQueryResultsCommand(params));
  return response;
};

const waitAndGetQueryResults = async (
  queryId: string
): Promise<GetQueryResultsCommandOutput | undefined> => {
  const checkState = async (): Promise<boolean> => {
    const result = await getQueryExecutionStatus(queryId);
    return !((result?.State?.match("SUCCEEDED")) == null);
  };
  const queryStatusSuccess = await waitForTrue(checkState, 5000, 10000);
  if (queryStatusSuccess) {
    return await getQueryResults(queryId);
  }
};

const formattedQueryResults = async (
  queryId: string
): Promise<StringObject[]> => {
  const queryResults = await waitAndGetQueryResults(queryId);
  if (queryResults?.ResultSet?.Rows?.[0]?.Data === undefined)
    throw new Error("Invalid query results");
  const columns = queryResults.ResultSet.Rows[0].Data;
  const rows = queryResults.ResultSet.Rows.slice(1).map((d) => d.Data);
  const formattedData = rows.map((row) => {
    const object: StringObject = {};
    row?.forEach(function (_, index) {
      const fieldName = columns[index].VarCharValue;
      const fieldValue = row[index].VarCharValue;
      if (fieldName !== undefined && fieldValue !== undefined) {
        object[fieldName] = fieldValue;
        return object;
      }
    });
    return object;
  });
  return formattedData;
};

const queryObject = async (queryId: string): Promise<any> => {
  const queryResults: StringObject[] = await formattedQueryResults(queryId);
  const strFromQuery = JSON.stringify(queryResults);
  const queryObj = JSON.parse(strFromQuery);
  return queryObj;
};

export {
  startQueryExecutionCommand,
  getQueryExecutionStatus,
  getQueryResults,
  waitAndGetQueryResults,
  formattedQueryResults,
  queryObject,
};
