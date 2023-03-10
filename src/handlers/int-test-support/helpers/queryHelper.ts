import { queryObject, startQueryExecutionCommand } from "./athenaHelper";
import { resourcePrefix } from "./envHelper";

const prefix = resourcePrefix();
const databaseName = `${prefix}-calculations`;

export const queryResponseFilterByVendorServiceNameYearMonth = async (
  vendorId: string,
  serviceName: string,
  tableName: string,
  eventTime: string
): Promise<[]> => {
  const year = new Date(eventTime).getFullYear();
  const month = new Date(eventTime).toLocaleString("en-US", {
    month: "2-digit",
  });

  // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
  const curatedQueryString = `SELECT * FROM "${tableName}" WHERE vendor_id='${vendorId}' AND service_name='${serviceName}' AND year='${year}' AND month='${month}'`;
  console.log(curatedQueryString);
  const queryId = await startQueryExecutionCommand({
    databaseName,
    queryString: curatedQueryString,
  });

  return await queryObject(queryId);
};
