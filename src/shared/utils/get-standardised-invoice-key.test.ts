import {
  getStandardisedInvoiceKey,
  getStandardisedInvoiceFileNamePrefix,
  getStandardisedInvoiceFileName,
  getYearMonth,
} from "./get-standardised-invoice-key";

test("Filename getter with standardised line item", () => {
  const standardisedLineItem = {
    invoice_receipt_id: "370 000",
    vendor_id: "vendor_testvendor1",
    vendor_name: "Vendor One",
    invoice_receipt_date: "2023-02-28",
    due_date: "2023-03-28",
    tax_payer_id: "123 4567 89",
    parser_version: "1.0.0",
    originalInvoiceFile: "vendorOne.csv",
    item_description: "Check one",
    subtotal: 4687.92,
    tax: 937.584,
    price: 4687.92,
    quantity: 13788,
    service_name: "Check one",
    unit_price: 0.34,
    total: 5625.504,
    event_name: "VENDOR_1_EVENT_1",
  };
  const filename = getStandardisedInvoiceKey("folder", standardisedLineItem);
  expect(filename).toMatch(
    /^folder\/2023\/02\/2023-02-vendor_testvendor1-VENDOR_1_EVENT_1-.{6}\.txt$/
  ); // <- expects 6 alphanumeric chars for the uuid
});

test("Filename prefix getter with standardised line item", () => {
  const standardisedLineItem = {
    vendor_id: "vendor_testvendor1",
    invoice_receipt_date: "2023-02-28",
    event_name: "VENDOR_1_EVENT_1",
  };
  const prefix = getStandardisedInvoiceFileNamePrefix(standardisedLineItem);
  expect(prefix).toMatch(/^2023-02-vendor_testvendor1-VENDOR_1_EVENT_1-$/);
});

// TODO The below tests will go away with BTM-486.

test("Filename getter with  standardised line item", () => {
  const standardisedLineItem = {
    invoice_receipt_id: "370 000",
    vendor_id: "vendor_testvendor1",
    vendor_name: "Vendor One",
    invoice_receipt_date: "2023-02-28",
    due_date: "2023-03-28",
    tax_payer_id: "123 4567 89",
    parser_version: "1.0.0",
    originalInvoiceFile: "vendorOne.csv",
    item_description: "Check one",
    subtotal: 4687.92,
    tax: 937.584,
    price: 4687.92,
    quantity: 13788,
    service_name: "Check one",
    unit_price: 0.34,
    total: 5625.504,
    event_name: "VENDOR_1_EVENT_1",
  };
  const filename = getStandardisedInvoiceFileName(standardisedLineItem);
  expect(filename).toMatch(
    /^2023-02-vendor_testvendor1-VENDOR_1_EVENT_1-.{6}\.txt$/
  ); // <- expects 6 alphanumeric chars for the uuid
});

test("Filename prefix getter with standardised line item", () => {
  const standardisedLineItem = {
    vendor_id: "vendor_testvendor1",
    invoice_receipt_date: "2023-02-28",
    event_name: "VENDOR_1_EVENT_1",
  };
  const prefix = getStandardisedInvoiceFileNamePrefix(standardisedLineItem);
  expect(prefix).toMatch(/^2023-02-vendor_testvendor1-VENDOR_1_EVENT_1-$/);
});

test("Year, month, and day are formatted to yyyy-mm", () => {
  const date: string = "2023/03/28";
  const yearMonth = getYearMonth(date);
  expect(yearMonth).toEqual("2023-03");
});
