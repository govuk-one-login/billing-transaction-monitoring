import {
  Datum,
  GetQueryExecutionCommand,
  GetQueryResultsCommand,
  StartQueryExecutionCommand,
} from "@aws-sdk/client-athena";
import { poll } from "./commonHelpers";
import { resourcePrefix, runViaLambda } from "./envHelper";
import { athenaClient } from "../clients";
import { sendLambdaCommand } from "./lambdaHelper";
import { IntTestHelpers } from "../handler";

interface StringObject {
  [key: string]: string;
}

interface DatabaseQuery {
  databaseName: string;
  queryString: string;
}

interface QueryStatus {
  state?: string;
  stateChangeReason?: string;
}

export const startQueryExecutionCommand = async (
  query: DatabaseQuery
): Promise<string> => {
  if (runViaLambda())
    return await sendLambdaCommand(
      IntTestHelpers.startQueryExecutionCommand,
      query
    );
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

export const getQueryExecutionStatus = async (
  queryId: string
): Promise<QueryStatus | undefined> => {
  if (runViaLambda())
    return (await sendLambdaCommand(
      IntTestHelpers.getQueryExecutionStatus,
      queryId
    )) as QueryStatus;
  const params = {
    QueryExecutionId: queryId,
  };
  const response = await athenaClient.send(
    new GetQueryExecutionCommand(params)
  );
  return {
    state: response.QueryExecution?.Status?.State,
    stateChangeReason: response.QueryExecution?.Status?.StateChangeReason,
  };
};

export const getQueryResults = async (
  queryId: string
): Promise<StringObject[]> => {
  if (runViaLambda())
    return (await sendLambdaCommand(
      IntTestHelpers.getQueryResults,
      queryId
    )) as unknown as StringObject[];

  const params = {
    QueryExecutionId: queryId,
  };
  const queryResults = await athenaClient.send(
    new GetQueryResultsCommand(params)
  );
  if (queryResults?.ResultSet?.Rows?.[0]?.Data === undefined)
    throw new Error("Invalid query results");
  const columns = queryResults.ResultSet.Rows[0].Data;
  const rows = queryResults.ResultSet.Rows.slice(1).map((d) => d.Data);
  return rows
    .filter((val: Datum[] | undefined): val is Datum[] => val !== undefined)
    .map((row) =>
      row.reduce<StringObject>((acc, _, index) => {
        const fieldName = columns[index].VarCharValue;
        const fieldValue = row[index].VarCharValue;
        return fieldName === undefined || fieldValue === undefined
          ? acc
          : {
              ...acc,
              [fieldName]: fieldValue,
            };
      }, {})
    );
};

export const waitAndGetQueryResults = async (
  queryId: string
): Promise<StringObject[]> => {
  const checkState = async (): Promise<boolean> => {
    const result = await getQueryExecutionStatus(queryId);
    return result?.state?.match("SUCCEEDED") !== null;
  };
  await poll(checkState, (state) => state, {
    timeout: 65000,
    interval: 5000,
    notCompleteErrorMessage: "Query did not succeed within the given timeout",
  });
  return await getQueryResults(queryId);
};

export const queryObject = async (queryId: string): Promise<any> => {
  const queryResults: StringObject[] = await waitAndGetQueryResults(queryId);
  const strFromQuery = JSON.stringify(queryResults);
  return JSON.parse(strFromQuery);
};
