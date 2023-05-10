import {
  startQueryExecutionCommand,
  waitAndGetQueryResults,
} from "./athenaHelper";
import { resourcePrefix } from "./envHelper";

const prefix = resourcePrefix();
const databaseName = `${prefix}-calculations`;

export const queryAthena = async (
  queryString: string
): Promise<Array<Record<string, string>>> => {
  const queryId = await startQueryExecutionCommand({
    databaseName,
    queryString,
  });
  return await waitAndGetQueryResults(queryId);
};

export const getFilteredQueryResponse = async (
  tableName: string,
  vendorId: string,
  serviceName: string,
  eventTime: string
): Promise<Array<Record<string, string>>> => {
  const year = new Date(eventTime).getFullYear();
  const month = new Date(eventTime).toLocaleString("en-US", {
    month: "2-digit",
  });
  // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
  const queryString = `SELECT * FROM "${tableName}" WHERE vendor_id='${vendorId}' AND service_name='${serviceName}' AND year='${year}' AND month='${month}'`;
  return await queryAthena(queryString);
};
