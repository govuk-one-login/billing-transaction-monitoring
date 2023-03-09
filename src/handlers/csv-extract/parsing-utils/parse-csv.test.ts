import path from "path";
import fs from "fs";
import {parseCsv} from "./parse-csv";


describe("Parse CSV tests", () => {

  test("should parse a valid csv correctly", async () => {


    const file = "../test-support/csv/valid-test-invoice.csv";
    const filename = path.join(__dirname, file);
    const fileData = fs.readFileSync(filename).toString();
    const result = parseCsv(fileData);

    console.log(result);
  });

});
