import { queryObject, startQueryExecutionCommand } from "./athenaHelper";
import { TableNames } from "./commonHelpers";
import { resourcePrefix } from "./envHelper";

const prefix = resourcePrefix();
const databaseName = `${prefix}-calculations`;

export const queryResponseFilterByVendorServiceNameYearMonth = async (
  eventTime: string,
  vendorId: string,
  serviceName: string
): Promise<BillingTransactionCurated> => {
  const tableName = TableNames.BILLING_TRANSACTION_CURATED;
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

type BillingTransactionCurated = Array<{
  vendor_id: string;
  vendor_name: string;
  service_name: string;
  year: string;
  month: string;
  price_difference: number;
  quantity_difference: number;
  price_difference_percentage: number;
  quantity_difference_percentage: number;
  billing_price: number;
  billing_quantity: number;
  transaction_price: number;
  transaction_quantity: number;
}>;
