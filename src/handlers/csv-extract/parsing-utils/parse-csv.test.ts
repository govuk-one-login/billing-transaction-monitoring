import { parseCsv } from "./parse-csv";

describe("Parse CSV tests", () => {
  test("should parse a valid csv correctly", async () => {
    const fileData =
      "Vendor,Skippy’s Everything Shop,,,,,\n" +
      ",,,,,,\n" +
      "Service Name,Unit Price,Quantity,Tax,Subtotal,Total,\n" +
      "Horse Hoof Whittling,12.45,28,69.72,348.6,418.32,\n";
    const expected = {
      vendor: "Skippy’s Everything Shop",
      lineItems: [
        {
          "service name": "Horse Hoof Whittling",
          "unit price": "12.45",
          quantity: "28",
          tax: "69.72",
          subtotal: "348.6",
          total: "418.32",
        },
      ],
    };

    const result = parseCsv(fileData);

    expect(result).toEqual(expected);
  });

  test("should ignore trailing blank columns in line items header", async () => {
    const fileData =
      "column1,column2,column3,,,,,\n" + "value1,value2,value3,,,,,\n";

    const result = parseCsv(fileData);
    expect(result).toEqual({
      lineItems: [{ column1: "value1", column2: "value2", column3: "value3" }],
    });
  });

  test("should fail if columns in line items are more than the header row", async () => {
    const fileData =
      "column1,column2,column3,,,,,\n" + "value1,value2,value3,value4,,,,\n";

    expect(() => parseCsv(fileData)).toThrowError(
      "Wrong number of columns in line item"
    );
  });

  test("should allow blank columns in the middle of line items", async () => {
    const fileData = "column1,column2,column3,,,,,\n" + "value1,,value3,,,,,\n";

    const result = parseCsv(fileData);
    expect(result).toEqual({
      lineItems: [{ column1: "value1", column2: "", column3: "value3" }],
    });
  });

  test("should fail if line item has fewer columns than header row", async () => {
    const fileData =
      "column1,column2,column3,column4,,,,\n" + "value1,value2,value3,,,\n";

    expect(() => parseCsv(fileData)).toThrowError(
      "Wrong number of columns in line item"
    );
  });

  test("should parse correctly with \\r\\n line delimiters", async () => {
    const fileData =
      "Vendor,Skippy’s Everything Shop,,,,,\r\n" +
      ",,,,,,\r\n" +
      "Service Name,Unit Price,Quantity,Tax,Subtotal,Total,\r\n" +
      "Horse Hoof Whittling,12.45,28,69.72,348.6,418.32,\r\n";
    const expected = {
      vendor: "Skippy’s Everything Shop",
      lineItems: [
        {
          "service name": "Horse Hoof Whittling",
          "unit price": "12.45",
          quantity: "28",
          tax: "69.72",
          subtotal: "348.6",
          total: "418.32",
        },
      ],
    };
    const result = parseCsv(fileData);

    expect(result).toEqual(expected);
  });

  test("should parse correctly with abnormal capitalisation and white space", async () => {
    const fileData =
      " VENDOR ,Skippy’s Everything Shop,,,,,\r\n" +
      ",,,,,,\r\n" +
      "  Service name,unit Price  ,Quantity,Tax,Subtotal,Total,\r\n" +
      "Horse Hoof Whittling,12.45,28,69.72,348.6,418.32,\r\n";
    const expected = {
      vendor: "Skippy’s Everything Shop",
      lineItems: [
        {
          "service name": "Horse Hoof Whittling",
          "unit price": "12.45",
          quantity: "28",
          tax: "69.72",
          subtotal: "348.6",
          total: "418.32",
        },
      ],
    };
    const result = parseCsv(fileData);

    expect(result).toEqual(expected);
  });

  test("should parse correctly with quote-wrapped values that have commas and quotation marks", async () => {
    const fileData =
      "Vendor,Skippy’s Everything Shop,,,,,\n" +
      ",,,,,,\n" +
      "Service Name,Unit Price,Quantity,Tax,Subtotal,Total,\n" +
      '"Horse ""Hoof"" Whittling","12,000.45","28",69.72,348.6,418.32,\n';
    const expected = {
      vendor: "Skippy’s Everything Shop",
      lineItems: [
        {
          "service name": 'Horse "Hoof" Whittling',
          "unit price": "12,000.45",
          quantity: "28",
          tax: "69.72",
          subtotal: "348.6",
          total: "418.32",
        },
      ],
    };

    const result = parseCsv(fileData);

    expect(result).toEqual(expected);
  });
});
