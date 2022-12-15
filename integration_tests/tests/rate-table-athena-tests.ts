import {
  startQueryExecutionCommand,
  formattedQueryResults,
} from "../helpers/athenaHelper";
import path from "path";
import csvjson from "csvtojson";
import { resourcePrefix } from "../helpers/envHelper";
const prefix = resourcePrefix();

describe("\n Execute athena query to retrieve rate details\n", () => {
  test("retrieved rate details should matches with rate csv uploaded in s3 config bucket ", async () => {
    const databaseName = `${prefix}-calculations`;
    const queryString = `SELECT * FROM "btm_rates_standardised"`;
    const queryId = await startQueryExecutionCommand(databaseName, queryString);
    const queryResult = await formattedQueryResults(queryId);
    const queryResultToString = JSON.stringify(queryResult)
      .replace(/\s00:00:00.000/g, "")
      .replace(/"(\d+)(?:(\.\d*?[1-9]+)0*|\.0*)"/g, '"$1$2"'); // regex removes trailing zeros after decimal places eg 1.00 to 1
    const queryJsonObj = JSON.parse(queryResultToString);
    const csvFilePath = "../../cloudformation/fake-prices.csv";
    const file = path.join(__dirname, csvFilePath);
    const csvData = await csvjson().fromFile(file);
    const csvFormattedData = JSON.parse(
      JSON.stringify(csvData).replace(
        /"(\d+)(?:(\.\d*?[1-9]+)0*|\.0*)"/g,
        '"$1$2"'
      ),
      (key, value) => (value === null || value === "" ? undefined : value)
    ); // regex removes trailing zeros after decimal places eg 9.00 to 9,7.30 to 7.3
    expect(csvFormattedData).toEqual(queryJsonObj);
  });
});
