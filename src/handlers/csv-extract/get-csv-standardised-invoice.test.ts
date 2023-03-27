import { VendorServiceConfigRows } from "../../shared/utils";
import {
  CsvObject,
  getCsvStandardisedInvoice,
} from "./get-csv-standardised-invoice";

describe("CSV Standardised invoice getter", () => {
  let givenValidCsvObject: CsvObject;
  let givenCsvObjectWithInvalidDate: CsvObject;
  let givenCsvObjectWithInvalidNumber: CsvObject;
  let givenVendorServiceConfigRows: VendorServiceConfigRows;
  let givenSourceFileName: string;

  beforeEach(() => {
    givenVendorServiceConfigRows = [
      {
        vendor_name: "Vendor One",
        vendor_id: "vendor_testvendor1",
        service_name: "Check one",
        service_regex: "Check one",
        event_name: "VENDOR_1_EVENT_1",
      },
      {
        vendor_name: "Vendor One",
        vendor_id: "vendor_testvendor1",
        service_name: "Check two",
        service_regex: "Check two",
        event_name: "VENDOR_1_EVENT_3",
      },
    ];

    givenSourceFileName = "given-source-file-name.csv";
  });

  test("should return StandardisedLineItems when given a valid CsvObject that has 3 line items, with two that have service_names in the vendor service config", () => {
    givenValidCsvObject = {
      Vendor: "Vendor One",
      "Invoice Date": "2023/02/28",
      "Due Date": "2023/03/28",
      "VAT Number": "123 4567 89",
      "PO Number": "370 000",
      Version: "1.0.0",
      lineItems: [
        {
          "Service Name": "Check one",
          "Unit Price": "0.34",
          Quantity: "13788",
          Tax: "937.584",
          Subtotal: "4687.92",
          Total: "5625.504",
        },
        {
          "Service Name": "Check two",
          "Unit Price": "3.95",
          Quantity: "83",
          Tax: "65.57",
          Subtotal: "327.85",
          Total: "393.42",
        },
        {
          "Service Name": "Check three",
          "Unit Price": "20",
          Quantity: "3",
          Tax: "12",
          Subtotal: "60",
          Total: "72",
        },
      ],
    };
    const result = getCsvStandardisedInvoice(
      givenValidCsvObject,
      "vendor_testvendor1",
      givenVendorServiceConfigRows,
      givenSourceFileName
    );

    expect(result).toEqual([
      {
        invoice_receipt_id: "370 000",
        vendor_id: "vendor_testvendor1",
        vendor_name: "Vendor One",
        invoice_receipt_date: "2023-02-28",
        due_date: "2023-03-28",
        tax_payer_id: "123 4567 89",
        parser_version: "1.0.0",
        originalInvoiceFile: givenSourceFileName,
        item_description: "Check one",
        subtotal: 4687.92,
        tax: 937.584,
        price: 4687.92,
        quantity: 13788,
        service_name: "Check one",
        unit_price: 0.34,
        total: 5625.504,
        event_name: "VENDOR_1_EVENT_1",
      },
      {
        invoice_receipt_id: "370 000",
        vendor_id: "vendor_testvendor1",
        vendor_name: "Vendor One",
        invoice_receipt_date: "2023-02-28",
        due_date: "2023-03-28",
        tax_payer_id: "123 4567 89",
        parser_version: "1.0.0",
        originalInvoiceFile: givenSourceFileName,
        item_description: "Check two",
        subtotal: 327.85,
        tax: 65.57,
        price: 327.85,
        quantity: 83,
        service_name: "Check two",
        unit_price: 3.95,
        total: 393.42,
        event_name: "VENDOR_1_EVENT_3",
      },
    ]);
  });

  test("should throw error when given a valid CsvObject that has an invalid date", () => {
    givenCsvObjectWithInvalidDate = {
      Vendor: "Vendor One",
      "Invoice Date": "2023/02/28",
      "Due Date": "an invalid date", // <- invalid date
      "VAT Number": "123 4567 89",
      "PO Number": "370 000",
      Version: "1.0.0",
      lineItems: [
        {
          "Service Name": "Check one",
          "Unit Price": "0.34",
          Quantity: "13788",
          Tax: "937.584",
          Subtotal: "4687.92",
          Total: "5625.504",
        },
      ],
    };

    expect(() =>
      getCsvStandardisedInvoice(
        givenCsvObjectWithInvalidDate,
        "vendor_testvendor1",
        givenVendorServiceConfigRows,
        givenSourceFileName
      )
    ).toThrowError("Unsupported date format");
  });

  test("should throw error when given a valid CsvObject that has an invalid number", () => {
    givenCsvObjectWithInvalidNumber = {
      Vendor: "Vendor One",
      "Invoice Date": "2023/02/28",
      "Due Date": "2023/03/28",
      "VAT Number": "123 4567 89",
      "PO Number": "370 000",
      Version: "1.0.0",
      lineItems: [
        {
          "Service Name": "Check one",
          "Unit Price": "x", // <- invalid number
          Quantity: "13788",
          Tax: "937.584",
          Subtotal: "4687.92",
          Total: "5625.504",
        },
      ],
    };
    expect(() =>
      getCsvStandardisedInvoice(
        givenCsvObjectWithInvalidNumber,
        "vendor_testvendor1",
        givenVendorServiceConfigRows,
        givenSourceFileName
      )
    ).toThrowError("Unsupported number format: x");
  });

  test("should throw error when given a valid CsvObject that has an empty number field", () => {
    givenCsvObjectWithInvalidNumber = {
      Vendor: "Vendor One",
      "Invoice Date": "2023/02/28",
      "Due Date": "2023/03/28",
      "VAT Number": "123 4567 89",
      "PO Number": "370 000",
      Version: "1.0.0",
      lineItems: [
        {
          "Service Name": "Check one",
          "Unit Price": "", // <- empty field
          Quantity: "13788",
          Tax: "937.584",
          Subtotal: "4687.92",
          Total: "5625.504",
        },
      ],
    };
    expect(() =>
      getCsvStandardisedInvoice(
        givenCsvObjectWithInvalidNumber,
        "vendor_testvendor1",
        givenVendorServiceConfigRows,
        givenSourceFileName
      )
    ).toThrowError("Empty number field in csv: ");
  });
});
