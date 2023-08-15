import { ConfigServicesRow } from "../../shared/types";
import {
  CsvObject,
  getCsvStandardisedInvoice,
} from "./get-csv-standardised-invoice";

describe("CSV Standardised invoice getter", () => {
  let givenValidCsvObject: CsvObject;
  let givenCsvObjectWithInvalidDate: CsvObject;
  let givenCsvObjectWithInvalidNumber: CsvObject;
  let givenVendorServiceConfigRows: ConfigServicesRow[];
  let givenSourceFileName: string;

  beforeEach(() => {
    givenVendorServiceConfigRows = [
      {
        vendor_name: "Vendor One",
        vendor_id: "vendor_testvendor1",
        service_name: "Check one",
        service_regex: "Check one",
        event_name: "VENDOR_1_EVENT_1",
        contract_id: "1",
        invoice_is_quarterly: false,
      },
      {
        vendor_name: "Vendor One",
        vendor_id: "vendor_testvendor1",
        service_name: "Check two",
        service_regex: "Check two",
        event_name: "VENDOR_1_EVENT_3",
        contract_id: "1",
        invoice_is_quarterly: true,
      },
    ];

    givenSourceFileName = "given-source-file-name.csv";
  });

  test("should return StandardisedLineItems when given a valid CsvObject that has 3 line items, with two that have service_names in the vendor service config", () => {
    givenValidCsvObject = {
      vendor: "Vendor One",
      "invoice period start": "2023/02/01",
      "invoice period end": "2023/02/28",
      "invoice date": "2023/02/28",
      "due date": "28/03/2023",
      "vat number": "123 4567 89",
      "po number": "370 000",
      version: "1.0.0",
      lineItems: [
        {
          "service name": "Check one",
          "unit price": "0.34",
          quantity: "13788",
          tax: "937.584",
          subtotal: "4687.92",
          total: "5625.504",
        },
        {
          "service name": "Check two",
          "unit price": "3.95",
          quantity: "83",
          tax: "65.57",
          subtotal: "327.85",
          total: "393.42",
        },
        {
          "service name": "Check three",
          "unit price": "20",
          quantity: "3",
          tax: "12",
          subtotal: "60",
          total: "72",
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
        contract_id: "1",
        unit_price: 0.34,
        total: 5625.504,
        event_name: "VENDOR_1_EVENT_1",
        invoice_is_quarterly: false,
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
        contract_id: "1",
        unit_price: 3.95,
        total: 393.42,
        event_name: "VENDOR_1_EVENT_3",
        invoice_is_quarterly: false,
      },
    ]);
  });

  test("should return quarterly StandardisedLineItems when date range is quarter", () => {
    givenValidCsvObject = {
      vendor: "Vendor One",
      "invoice period start": "2023/01/01",
      "invoice period end": "2023/03/31",
      "invoice date": "2023/03/31",
      "due date": "30/04/2023",
      "vat number": "123 4567 89",
      "po number": "370 000",
      version: "1.0.0",
      lineItems: [
        {
          "service name": "Check one",
          "unit price": "0.34",
          quantity: "13788",
          tax: "937.584",
          subtotal: "4687.92",
          total: "5625.504",
        },
        {
          "service name": "Check two",
          "unit price": "3.95",
          quantity: "83",
          tax: "65.57",
          subtotal: "327.85",
          total: "393.42",
        },
        {
          "service name": "Check three",
          "unit price": "20",
          quantity: "3",
          tax: "12",
          subtotal: "60",
          total: "72",
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
        invoice_receipt_date: "2023-03-31",
        due_date: "2023-04-30",
        tax_payer_id: "123 4567 89",
        parser_version: "1.0.0",
        originalInvoiceFile: givenSourceFileName,
        item_description: "Check one",
        subtotal: 4687.92,
        tax: 937.584,
        price: 4687.92,
        quantity: 13788,
        service_name: "Check one",
        contract_id: "1",
        unit_price: 0.34,
        total: 5625.504,
        event_name: "VENDOR_1_EVENT_1",
        invoice_is_quarterly: true,
      },
      {
        invoice_receipt_id: "370 000",
        vendor_id: "vendor_testvendor1",
        vendor_name: "Vendor One",
        invoice_receipt_date: "2023-03-31",
        due_date: "2023-04-30",
        tax_payer_id: "123 4567 89",
        parser_version: "1.0.0",
        originalInvoiceFile: givenSourceFileName,
        item_description: "Check two",
        subtotal: 327.85,
        tax: 65.57,
        price: 327.85,
        quantity: 83,
        service_name: "Check two",
        contract_id: "1",
        unit_price: 3.95,
        total: 393.42,
        event_name: "VENDOR_1_EVENT_3",
        invoice_is_quarterly: true,
      },
    ]);
  });

  test("should throw error when given a valid CsvObject that has an invalid date", () => {
    givenCsvObjectWithInvalidDate = {
      vendor: "Vendor One",
      "invoice period start": "2023/02/01",
      "invoice period end": "2023/02/28",
      "invoice date": "2023/02/28",
      "due date": "an invalid date", // <- invalid date
      "vat number": "123 4567 89",
      "po number": "370 000",
      version: "1.0.0",
      lineItems: [
        {
          "service name": "Check one",
          "unit price": "0.34",
          quantity: "13788",
          tax: "937.584",
          subtotal: "4687.92",
          total: "5625.504",
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
      vendor: "Vendor One",
      "invoice period start": "2023/02/01",
      "invoice period end": "2023/02/28",
      "invoice date": "2023/02/28",
      "due date": "2023/03/28",
      "vat number": "123 4567 89",
      "po number": "370 000",
      version: "1.0.0",
      lineItems: [
        {
          "service name": "Check one",
          "unit price": "x", // <- invalid number
          quantity: "13788",
          tax: "937.584",
          subtotal: "4687.92",
          total: "5625.504",
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
      vendor: "Vendor One",
      "invoice period start": "2023/02/01",
      "invoice period end": "2023/02/28",
      "invoice date": "2023/02/28",
      "due date": "2023/03/28",
      "vat number": "123 4567 89",
      "po number": "370 000",
      version: "1.0.0",
      lineItems: [
        {
          "service name": "Check one",
          "unit price": "", // <- empty field
          quantity: "13788",
          tax: "937.584",
          subtotal: "4687.92",
          total: "5625.504",
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
