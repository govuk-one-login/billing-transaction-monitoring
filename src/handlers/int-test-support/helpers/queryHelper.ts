import {
  getQueryExecutionStatus,
  getQueryResults,
  startQueryExecutionCommand,
} from "./athenaHelper";
import { poll } from "./commonHelpers";
import { getQuarterMonthString } from "./dateHelper";
import { resourcePrefix } from "./envHelper";

const prefix = resourcePrefix();
const databaseName = `${prefix}-calculations`;

export const queryAthena = async <TResponse>(
  queryString: string
): Promise<TResponse[]> => {
  const maxRetries = 3;
  let retryCount = 0;
  let queryId: string = "";

  const pollQueryExecutionStatus = async (): Promise<boolean> => {
    if (!queryId)
      queryId = await startQueryExecutionCommand({ databaseName, queryString });
    const queryStatus = await getQueryExecutionStatus(queryId);
    if (
      queryStatus?.state === "FAILED" &&
      queryStatus?.stateChangeReason?.includes("NoSuchKey")
    ) {
      if (retryCount >= maxRetries)
        throw Error(`Failed with NoSuchKey after ${retryCount} retries`);
      console.log("Retrying due to failed state and NoSuchKey stateReason");
      queryId = "";
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

export const getQueryResponse = async <TResponse>(
  tableName: string,
  vendorId: string,
  serviceName: string,
  time: string,
  useQuarterMonth: boolean = false
): Promise<TResponse> => {
  const date = new Date(time);
  const year = date.getFullYear();
  const month = useQuarterMonth
    ? getQuarterMonthString(date)
    : date.toLocaleString("en-US", { month: "2-digit" });
  // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
  const queryString = `SELECT * FROM "${tableName}" WHERE vendor_id='${vendorId}' AND service_name='${serviceName}' AND year='${year}' AND month='${month}'`;
  return (await queryAthena<TResponse>(queryString)) as TResponse;
};
