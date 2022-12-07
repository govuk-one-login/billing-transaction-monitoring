import {
  StartQueryExecutionCommand,
  GetQueryExecutionCommand,
  GetQueryResultsCommand,
  GetQueryResultsCommandOutput,
} from "@aws-sdk/client-athena";
import { waitForTrue } from "./commonHelpers";
import { athenaClient } from "../clients/athenaClient";
import { resourcePrefix } from "./envHelper";

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

async function getQueryResults(queryId: string) {
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
    return response;
  }
}

async function formattedQueryResults(queryId: string) {
  const queryResults = await getQueryResults(queryId);
  const columns = queryResults?.ResultSet?.Rows![0].Data;
  const rows = queryResults?.ResultSet?.Rows!.slice(
    1,
    queryResults?.ResultSet?.Rows!.length
  ).map((d) => d.Data);
  const formattedData = rows!.map((row) => {
    const object: { [key: string]: string } = {};
    row!.forEach(function (item, index) {
      const fieldName = columns![index].VarCharValue;
      if (fieldName !== undefined) {
        object[fieldName] = row![index].VarCharValue!;
        console.log(object);
        return object;
      }
    });
    return object;
  });
  return formattedData;
}

export { getQueryResults, startQueryExecutionCommand, formattedQueryResults };
