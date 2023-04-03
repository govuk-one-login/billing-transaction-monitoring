import {
  configStackName,
  resourcePrefix,
} from "../../src/handlers/int-test-support/helpers/envHelper";
import {
  formattedQueryResults,
  startQueryExecutionCommand,
} from "../../src/handlers/int-test-support/helpers/athenaHelper";
import { getVendorServiceConfigRows } from "../../src/handlers/int-test-support/config-utils/get-vendor-service-config-rows";

const prefix = resourcePrefix();
const configBucket = configStackName();

describe("\n Execute athena query to retrieve vendor service details\n", () => {
  test("retrieved vendor service details should match with vendor service csv uploaded in s3 config bucket ", async () => {
    const databaseName = `${prefix}-calculations`;
    const queryString = `SELECT * FROM "btm_vendor_service_standardised"`;
    const queryId = await startQueryExecutionCommand({
      databaseName,
      queryString,
    });
    const queryResult = await formattedQueryResults(queryId);
    const queryResultToString = JSON.stringify(queryResult);
    const queryJsonObj = JSON.parse(queryResultToString);
    const csvData = await getVendorServiceConfigRows(configBucket, {});
    expect(csvData).toEqual(queryJsonObj);
  });
});
