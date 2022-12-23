import {
  startQueryExecutionCommand,
  formattedQueryResults,
} from "../helpers/athenaHelper";
import csvjson from "csvtojson";
import { configStackName, resourcePrefix } from "../helpers/envHelper";
import { getS3Object } from "../helpers/s3Helper";
const prefix = resourcePrefix();
const configBucket = configStackName();

describe("\n Execute athena query to retrieve vendor service details\n", () => {
  test("retrieved vendor service details should match with vendor service csv uploaded in s3 config bucket ", async () => {
    const databaseName = `${prefix}-calculations`;
    const queryString = `SELECT * FROM "btm_vendor_service_standardised"`;
    const queryId = await startQueryExecutionCommand(databaseName, queryString);
    const queryResult = await formattedQueryResults(queryId);
    const queryResultToString = JSON.stringify(queryResult);
    const queryJsonObj = JSON.parse(queryResultToString);
    const servicesCsv = await getS3Object({
      bucket: configBucket,
      key: "vendor_services/vendor-services.csv",
    });
    const csvData = await csvjson().fromString(servicesCsv ?? "");
    const csvFormattedData = JSON.parse(JSON.stringify(csvData), (key, value) =>
      value === null || value === "" ? undefined : value
    );
    expect(csvFormattedData).toEqual(queryJsonObj);
  });
});
