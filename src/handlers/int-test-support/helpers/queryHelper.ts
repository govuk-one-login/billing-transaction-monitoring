import {
  getQueryExecutionStatus,
  getQueryResults,
  startQueryExecutionCommand,
} from "./athenaHelper";
import { poll } from "./commonHelpers";
import { resourcePrefix } from "./envHelper";

const prefix = resourcePrefix();
const databaseName = `${prefix}-calculations`;

export const queryAthena = async <TResponse>(
  queryString: string
): Promise<TResponse[]> => {
  const maxRetries = 3;
  let retryCount = 0;
  let queryId: string = "";

  queryId = await startQueryExecutionCommand({ databaseName, queryString });

  const pollQueryExecutionStatus = async (): Promise<boolean> => {
    const queryStatus = await getQueryExecutionStatus(queryId);
    if (
      queryStatus?.state === "FAILED" &&
      queryStatus?.stateChangeReason?.includes("NoSuchKey") &&
      retryCount < maxRetries
    ) {
      console.log("Retrying due to failed state and NoSuchKey stateReason");
      queryId = await startQueryExecutionCommand({ databaseName, queryString });
      retryCount++;
    } else if (queryStatus?.state === "SUCCEEDED") {
      return true;
    }
    return false;
  };
  await poll(pollQueryExecutionStatus, (result) => result, {
    timeout: 30000,
    interval: 5000,
    notCompleteErrorMessage: "Query did not succeed within the given timeout",
  });
  return await getQueryResults<TResponse>(queryId);
};

export const getFilteredQueryResponse = async <TResponse>(
  tableName: string,
  vendorId: string,
  serviceName: string,
  eventTime: string
): Promise<TResponse> => {
  const year = new Date(eventTime).getFullYear();
  const month = new Date(eventTime).toLocaleString("en-US", {
    month: "2-digit",
  });
  // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
  const queryString = `SELECT * FROM "${tableName}" WHERE vendor_id='${vendorId}' AND service_name='${serviceName}' AND year='${year}' AND month='${month}'`;
  return (await queryAthena<TResponse>(queryString)) as TResponse;
};
