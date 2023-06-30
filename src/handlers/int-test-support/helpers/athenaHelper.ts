import {
  Datum,
  GetQueryExecutionCommand,
  GetQueryResultsCommand,
  StartQueryExecutionCommand,
} from "@aws-sdk/client-athena";
import { resourcePrefix, runViaLambda } from "./envHelper";
import { athenaClient } from "../clients";
import { sendLambdaCommand } from "./lambdaHelper";
import { IntTestHelpers } from "../handler";

type DatabaseQuery = {
  databaseName: string;
  queryString: string;
};

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

export const getQueryResults = async <TResponse>(
  queryId: string
): Promise<TResponse[]> => {
  if (runViaLambda())
    return (await sendLambdaCommand(
      IntTestHelpers.getQueryResults,
      queryId
    )) as unknown as TResponse[];

  const params = {
    QueryExecutionId: queryId,
  };
  const queryResults = await athenaClient.send(
    new GetQueryResultsCommand(params)
  );
  console.log("QueryResults:", queryResults.ResultSet?.Rows);
  if (queryResults?.ResultSet?.Rows?.[0]?.Data === undefined)
    throw new Error("Invalid query results");
  const columns = queryResults.ResultSet.Rows[0].Data;
  const rows = queryResults.ResultSet.Rows.slice(1).map((d) => d.Data);
  console.log("Rows:", rows);
  return rows
    .filter((val: Datum[] | undefined): val is Datum[] => val !== undefined)
    .map((row) =>
      row.reduce((acc, _, index) => {
        const fieldName = columns[index].VarCharValue;
        const fieldValue = row[index].VarCharValue;
        return fieldName === undefined || fieldValue === undefined
          ? acc
          : {
              ...acc,
              [fieldName]: fieldValue,
            };
      }, {})
    ) as TResponse[];
};
