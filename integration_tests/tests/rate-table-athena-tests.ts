import {
  configStackName,
  resourcePrefix,
} from "../../src/handlers/int-test-support/helpers/envHelper";
import {
  waitAndGetQueryResults,
  startQueryExecutionCommand,
} from "../../src/handlers/int-test-support/helpers/athenaHelper";
import { getRatesFromConfig } from "../../src/handlers/int-test-support/config-utils/get-rate-config-rows";
const prefix = resourcePrefix();
const configBucket = configStackName();

describe("Execute athena query to retrieve rate details", () => {
  test("retrieved rate details should match rate csv uploaded in s3 config bucket", async () => {
    const databaseName = `${prefix}-calculations`;
    const queryString = `SELECT * FROM "btm_rates_standardised"`;
    const queryId = await startQueryExecutionCommand({
      databaseName,
      queryString,
    });
    const queryResult = await waitAndGetQueryResults(queryId);
    const queryResultToString = JSON.stringify(queryResult)
      .replace(/\s00:00:00.000/g, "")
      .replace(/"(\d+)(?:(\.\d*?[1-9]+)0*|\.0*)"/g, '"$1$2"'); // regex removes trailing zeros after decimal places eg 1.00 to 1
    const queryJsonObj = JSON.parse(queryResultToString);
    const csvData = await getRatesFromConfig(configBucket);
    const csvFormattedData = JSON.parse(
      JSON.stringify(csvData).replace(
        /"(\d+)(?:(\.\d*?[1-9]+)0*|\.0*)"/g,
        '"$1$2"'
      ),
      (key, value) => (value === null || value === "" ? undefined : value)
    ); // regex removes trailing zeros after decimal places eg 9.00 to 9,7.30 to 7.3
    expect(queryJsonObj).toEqual(csvFormattedData);
  });
});
