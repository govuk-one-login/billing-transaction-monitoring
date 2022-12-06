import {
  getQueryResults,
 startQuery
} from "../helpers/athenaHelper";
import fs from "fs"
import path from "path"
import * as CSV from 'csv-string'




describe("\nPublish valid sns message and execute athena query\n", () => {
 test.only("should contain eventId in the generated query results", async () => {
    const queryId = await startQuery ();
    const queryResult = await getQueryResults(queryId);
    const rows = queryResult!.ResultSet?.Rows;

    const rowVals = rows!.map(({ Data }) => Data?.map((val) => val.VarCharValue).map((o)=>o.));

    console.log("query",rowVals)
   

   })
    const csvFilePath = '../../cloudformation/prices.csv'
    const filename = path.join(__dirname, csvFilePath);
   const fileContent = fs.readFileSync(filename, { encoding: 'utf-8' });
   

    const csvRows = CSV.parse(fileContent, { output: 'objects' })
   console.log("csv values:", csvRows)

});