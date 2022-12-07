import {
  startQueryExecutionCommand,
  formattedQueryResults,
} from "../helpers/athenaHelper";
import fs from "fs";
import path from "path";
import csvjson from "csvtojson";
import { resourcePrefix } from "../helpers/envHelper";
;



const prefix = resourcePrefix();

describe("\n Execute athena query to retrieve rate details\n", () => {
  test("retrieved rate details should matches with rate csv uploaded in s3 config bucket ", async () => {
   const databaseName = `${prefix}-calculations`;
    const queryString = `SELECT * FROM \"btm_rate_tables\"`;
    const queryId = await startQueryExecutionCommand(databaseName, queryString);
    const queryResult = await formattedQueryResults(queryId);
   const queryResultToString=JSON.stringify(queryResult).replace(/\s00:00:00.000/g,'').replace(/\b(\d+)(?:(\.\d*?[1-9]+)0*|\.0*)/g,"$1$2")
   const queryJsonObj=JSON.parse(queryResultToString)
    const csvFilePath = "../../cloudformation/prices.csv";
    const file = path.join(__dirname, csvFilePath);
   const csvData=await csvjson().fromFile(file);
   const csvFormattedData= JSON.parse(JSON.stringify(csvData).replace(/\b(\d+)(?:(\.\d*?[1-9]+)0*|\.0*)/gm, "$1$2"),
   (key, value) => value === null || value === '' ? undefined : value );
    console.log(csvFormattedData)
    expect(csvFormattedData).toEqual(queryJsonObj)
});
})
