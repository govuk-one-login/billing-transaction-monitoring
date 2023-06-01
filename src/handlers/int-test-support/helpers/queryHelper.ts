import {
  startQueryExecutionCommand,
  waitAndGetQueryResults,
} from "./athenaHelper";
import { resourcePrefix } from "./envHelper";

const prefix = resourcePrefix();
const databaseName = `${prefix}-calculations`;

export const queryAthena = async <TResponse>(
  queryString: string
): Promise<TResponse[]> => {
  const queryId = await startQueryExecutionCommand({
    databaseName,
    queryString,
  });
  return await waitAndGetQueryResults(queryId, { databaseName, queryString });
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
