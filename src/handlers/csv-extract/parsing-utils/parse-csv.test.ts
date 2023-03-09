import path from "path";
import fs from "fs";
import {parseCsv} from "./parse-csv";
import {getAthenaViewResourceData} from "../../custom-athena-view-resource/get-athena-view-resource-data";


describe("Parse CSV tests", () => {

  test("should parse a valid csv correctly", async () => {

    const fileData = 'Vendor,Skippy’s Everything Shop,,,,,\n' +
      ',,,,,,\n' +
      'Service Name,Unit Price,Quantity,Tax,Subtotal,Total,\n' +
      'Horse Hoof Whittling,12.45,28,69.72,348.6,418.32,\n';
    const expected = {
      Vendor: 'Skippy’s Everything Shop',
      lineItems: [
        {
          'Service Name': 'Horse Hoof Whittling',
          'Unit Price': '12.45',
          Quantity: '28',
          Tax: '69.72',
          Subtotal: '348.6',
          Total: '418.32'
        },
      ]
    };

    const result = parseCsv(fileData);

    expect(result).toEqual(expected);
  });

  test("should reject key/values with extra columns", async () => {
    const fileData = 'key1,value1,EXTRA DATA,,,\n';

    const result = parseCsv(fileData);
    expect(result).toEqual({ lineItems: [] });
  });

  test("should ignore extra columns in line items", async () => {
    const fileData = 'column1,column2,column3,\n' +
      'value1,value2,value3,EXTRA DATA,\n';

    const result = parseCsv(fileData);
    expect(result).toEqual({
      lineItems: [ { column1: 'value1', column2: 'value2', column3: 'value3' } ]
    });
  });

});
