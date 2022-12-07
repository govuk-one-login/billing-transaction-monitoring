import {
  startQueryExecutionCommand,
  formattedQueryResults,
} from "../helpers/athenaHelper";
import fs from "fs";
import path from "path";
import * as CSV from "csv-string";
import { resourcePrefix } from "../helpers/envHelper";

const prefix = resourcePrefix();

describe("\n Execute athena query to retrieve rate details\n", () => {
  test("retrieved rate details should matches with rate csv uploaded in s3 config bucket ", async () => {
    const databaseName = `${prefix}-calculations`;
    const queryString = `SELECT * FROM \"btm_rate_tables\"`;
    const queryId = await startQueryExecutionCommand(databaseName, queryString);
    const queryResult = await formattedQueryResults(queryId);
    console.log("queryResult", queryResult);
    const csvFilePath = "../../cloudformation/prices1.csv";
    const filename = path.join(__dirname, csvFilePath);
    const fileContent = fs.readFileSync(filename, { encoding: "utf-8" });
    const csvRows = CSV.parse(fileContent, { output: "objects" });
    console.log("csv", csvRows);
    expect(queryResult).toEqual(csvRows);
  });
});
