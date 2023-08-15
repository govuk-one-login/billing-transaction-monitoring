import { getStandardisedInvoiceKey } from "./get-standardised-invoice-key";

test("Invoice key getter with non-quarterly standardised line item", () => {
  const standardisedLineItem = {
    invoice_receipt_id: "370 000",
    vendor_id: "vendor_testvendor1",
    vendor_name: "Vendor One",
    invoice_receipt_date: "2023-02-28",
    due_date: "2023-03-28",
    tax_payer_id: "123 4567 89",
    parser_version: "1.0.0",
    originalInvoiceFile: "vendorOne.csv",
    invoice_is_quarterly: false,
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
  const [key, prefix] = getStandardisedInvoiceKey(
    "folder",
    standardisedLineItem
  );
  expect(key).toMatch(
    /^folder\/2023\/02\/2023-02-vendor_testvendor1-VENDOR_1_EVENT_1-.{6}\.txt$/
  );
  expect(prefix).toMatch(
    /^folder\/2023\/02\/2023-02-vendor_testvendor1-VENDOR_1_EVENT_1-$/
  ); // <- expects 6 alphanumeric chars for the uuid
});

test("Invoice key getter with quarterly standardised line item", () => {
  const standardisedLineItem = {
    invoice_receipt_id: "370 000",
    vendor_id: "vendor_testvendor1",
    vendor_name: "Vendor One",
    invoice_receipt_date: "2023-02-28",
    due_date: "2023-03-28",
    tax_payer_id: "123 4567 89",
    parser_version: "1.0.0",
    originalInvoiceFile: "vendorOne.csv",
    invoice_is_quarterly: true,
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
  const [key, prefix] = getStandardisedInvoiceKey(
    "folder",
    standardisedLineItem
  );
  expect(key).toMatch(
    /^folder\/2023\/01\/2023-01-vendor_testvendor1-VENDOR_1_EVENT_1-.{6}\.txt$/
  );
  expect(prefix).toMatch(
    /^folder\/2023\/01\/2023-01-vendor_testvendor1-VENDOR_1_EVENT_1-$/
  ); // <- expects 6 alphanumeric chars for the uuid
});
