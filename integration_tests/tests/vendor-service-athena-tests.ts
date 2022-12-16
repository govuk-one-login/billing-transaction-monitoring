import {
  startQueryExecutionCommand,
  formattedQueryResults,
} from "../helpers/athenaHelper";
import path from "path";
import csvjson from "csvtojson";
import { resourcePrefix } from "../helpers/envHelper";
const prefix = resourcePrefix();

describe("\n Execute athena query to retrieve vendor service details\n", () => {
  test("retrieved vendor service details should match with vendor service csv uploaded in s3 config bucket ", async () => {
    const databaseName = `${prefix}-calculations`;
    const queryString = `SELECT * FROM "btm_vendor_service_standardised"`;
    const queryId = await startQueryExecutionCommand(databaseName, queryString);
    const queryResult = await formattedQueryResults(queryId);
    const queryResultToString = JSON.stringify(queryResult);
    const queryJsonObj = JSON.parse(queryResultToString);
    const csvFilePath = "../../cloudformation/fake-vendor-services.csv";
    const file = path.join(__dirname, csvFilePath);
    const csvData = await csvjson().fromFile(file);
    const csvFormattedData = JSON.parse(
      JSON.stringify(csvData),
      (key, value) => (value === null || value === "" ? undefined : value)
    ); // regex removes trailing zeros after decimal places eg 9.00 to 9,7.30 to 7.3
    expect(csvFormattedData).toEqual(queryJsonObj);
  });
});
