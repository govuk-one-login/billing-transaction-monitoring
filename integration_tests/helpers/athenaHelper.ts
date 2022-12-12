import {
  StartQueryExecutionCommand,
  GetQueryExecutionCommand,
  GetQueryResultsCommand,
  QueryExecutionStatus,
  GetQueryResultsCommandOutput,
} from "@aws-sdk/client-athena";
import { waitForTrue } from "./commonHelpers";
import { athenaClient } from "../clients/athenaClient";
import { resourcePrefix } from "./envHelper";

interface StringObject {
  [key: string]: string;
}

const prefix = resourcePrefix();

async function startQueryExecutionCommand(
  databaseName: string,
  queryString: string
): Promise<string> {
  const params = {
    QueryExecutionContext: {
      Database: databaseName,
    },
    QueryString: queryString,
    WorkGroup: `${prefix}-athena-workgroup`,
  };
  const response = await athenaClient.send(
    new StartQueryExecutionCommand(params)
  );
  const queryId = response.QueryExecutionId ?? "queryId not found";
  console.log("QueryExecutionId:", queryId);
  return queryId;
}

async function getQueryExecutionStatus(
  queryId: string
): Promise<QueryExecutionStatus | undefined> {
  const params = {
    QueryExecutionId: queryId,
  };
  const response = await athenaClient.send(
    new GetQueryExecutionCommand(params)
  );
  console.log("QueryExecutionStatus:", response.QueryExecution?.Status);
  return response.QueryExecution?.Status;
}

async function getQueryResults(
  queryId: string
): Promise<GetQueryResultsCommandOutput | undefined> {
  const checkState = async (): Promise<RegExpMatchArray | null | undefined> => {
    const result = await getQueryExecutionStatus(queryId);
    return result?.State?.match("SUCCEEDED");
  };
  const queryStatusSuccess = await waitForTrue(checkState, 5000, 10000);
  if (queryStatusSuccess) {
    const params = {
      QueryExecutionId: queryId,
    };
    const response = await athenaClient.send(
      new GetQueryResultsCommand(params)
    );
    return response;
  }
}

async function formattedQueryResults(queryId: string): Promise<StringObject[]> {
  const queryResults = await getQueryResults(queryId);
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
}

export { getQueryResults, startQueryExecutionCommand, formattedQueryResults };
