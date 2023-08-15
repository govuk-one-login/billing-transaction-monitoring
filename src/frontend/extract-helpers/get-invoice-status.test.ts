import { getInvoiceStatus } from "./get-invoice-status";
import { buildLineItem } from "./test-builders";
import {
  LineItemStatuses,
  lineItemStatusLookup,
} from "../utils/line-item-statuses";
import { invoiceStatusLabelLookup, InvoiceStatuses } from "../utils";

describe("getInvoiceStatus", () => {
  const lineItem = {
    vendor_id: "vendor_testvendor4",
    vendor_name: "Vendor Four",
    service_name: "Passport check",
    contract_id: "4",
    contract_name: "FOOBAR1",
    year: "2005",
    month: "02",
    billing_unit_price: "£0.0000",
    billing_price_formatted: "£0.00",
    transaction_price_formatted: "£27.50",
    price_difference: "£-27.50",
    billing_quantity: "2",
    transaction_quantity: "11",
    quantity_difference: "-9",
    billing_amount_with_tax: "",
    price_difference_percentage: "",
  };

  test("should return the expected message and warning banner class if there are no line items", () => {
    // Act
    const result = getInvoiceStatus([]);
    // Assert
    expect(result).toEqual({
      bannerClass: "notice",
      bannerText: "Invoice and events missing",
      statusLabel:
        invoiceStatusLabelLookup[InvoiceStatuses.invoiceAndEventsMissing],
    });
  });

  test("should return the expected invoice status and the warning banner class when Invoice data is missing", () => {
    // Arrange
    // There are multiple different line items with problems, but only the invoice
    // missing message should appear as it's the highest priority.
    const givenLineItems = [
      buildLineItem(lineItem, [
        [
          "price_difference_percentage",
          lineItemStatusLookup[LineItemStatuses.rateMissing].magicNumber ?? "",
        ],
      ]),
      buildLineItem(lineItem, [
        [
          "price_difference_percentage",
          lineItemStatusLookup[LineItemStatuses.invoiceMissing].magicNumber ??
            "",
        ],
      ]),
      buildLineItem(lineItem, [
        [
          "price_difference_percentage",
          lineItemStatusLookup[LineItemStatuses.eventsMissing].magicNumber ??
            "",
        ],
      ]),
      buildLineItem(lineItem, [
        [
          "price_difference_percentage",
          lineItemStatusLookup[LineItemStatuses.unexpectedCharge].magicNumber ??
            "",
        ],
      ]),
      buildLineItem(lineItem, [["price_difference_percentage", "0.00"]]),
    ];
    // Act
    const result = getInvoiceStatus(givenLineItems);
    // Assert
    expect(result).toEqual({
      bannerClass: "notice",
      bannerText: "Invoice data missing",
      statusLabel: invoiceStatusLabelLookup[InvoiceStatuses.invoiceDataMissing],
    });
  });

  test("should return the expected invoice status and the warning banner class when events data is missing", () => {
    // Arrange
    // There are multiple different line items with problems, but only the events
    // missing message should appear as it has higher priority than the others.
    const givenLineItems = [
      buildLineItem(lineItem, [
        [
          "price_difference_percentage",
          lineItemStatusLookup[LineItemStatuses.rateMissing].magicNumber ?? "",
        ],
      ]),
      buildLineItem(lineItem, [
        [
          "price_difference_percentage",
          lineItemStatusLookup[LineItemStatuses.eventsMissing].magicNumber ??
            "",
        ],
      ]),
      buildLineItem(lineItem, [
        [
          "price_difference_percentage",
          lineItemStatusLookup[LineItemStatuses.unexpectedCharge].magicNumber ??
            "",
        ],
      ]),
      buildLineItem(lineItem, [["price_difference_percentage", "2"]]),
    ];
    // Act
    const result = getInvoiceStatus(givenLineItems);
    // Assert
    expect(result).toEqual({
      bannerClass: "error",
      bannerText: "Events missing",
      statusLabel: invoiceStatusLabelLookup[InvoiceStatuses.eventsMissing],
    });
  });

  test("should return the expected invoice status and the warning banner class when rates are missing", () => {
    // Arrange
    // There are two different line items with problems, but only the rates
    // missing message should appear as it has higher priority than the other.
    const givenLineItems = [
      buildLineItem(lineItem, [
        [
          "price_difference_percentage",
          lineItemStatusLookup[LineItemStatuses.unexpectedCharge].magicNumber ??
            "",
        ],
      ]),
      buildLineItem(lineItem, [["price_difference_percentage", "2"]]),
      buildLineItem(lineItem, [
        [
          "price_difference_percentage",
          lineItemStatusLookup[LineItemStatuses.rateMissing].magicNumber ?? "",
        ],
      ]),
    ];
    // Act
    const result = getInvoiceStatus(givenLineItems);
    // Assert
    expect(result).toEqual({
      bannerClass: "error",
      bannerText: "Unable to find rate",
      statusLabel: invoiceStatusLabelLookup[InvoiceStatuses.unableToFindRate],
    });
  });

  test("should return the expected invoice status and the warning banner class when the invoice has an unexpected charge", () => {
    // Arrange
    // The unexpected charge line should take precedence over the line item that's over threshold.
    const givenLineItems = [
      buildLineItem(lineItem, [
        [
          "price_difference_percentage",
          lineItemStatusLookup[LineItemStatuses.unexpectedCharge].magicNumber ??
            "",
        ],
      ]),
      buildLineItem(lineItem, [["price_difference_percentage", "2"]]),
      buildLineItem(lineItem, [["price_difference_percentage", "-2"]]),
    ];
    // Act
    const result = getInvoiceStatus(givenLineItems);
    // Assert
    expect(result).toEqual({
      bannerClass: "warning",
      bannerText: "Unexpected invoice charge",
      statusLabel:
        invoiceStatusLabelLookup[InvoiceStatuses.invoiceHasUnexpectedCharge],
    });
  });

  test("should return the expected invoice status and the error banner class when there is a line item above threshold ", () => {
    // Arrange
    // The single line item that's over threshold should cause the warning
    // even though the other line items are okay or below threshold.
    const givenLineItems = [
      buildLineItem(lineItem, [["price_difference_percentage", "2"]]),
      buildLineItem(lineItem, [["price_difference_percentage", "0"]]),
      buildLineItem(lineItem, [["price_difference_percentage", "-2"]]),
    ];
    // Act
    const result = getInvoiceStatus(givenLineItems);
    // Assert
    expect(result).toEqual({
      bannerClass: "warning",
      bannerText: "Invoice above threshold",
      statusLabel:
        invoiceStatusLabelLookup[InvoiceStatuses.invoiceAboveThreshold],
    });
  });

  test("should return the expected invoice status and the notice banner class when there is a line item below threshold ", () => {
    // Arrange
    // The single line item that's below threshold should cause the warning
    // even though the other line items are within threshold.
    const givenLineItems = [
      buildLineItem(lineItem, [["price_difference_percentage", "0.35"]]),
      buildLineItem(lineItem, [["price_difference_percentage", "0.00"]]),
      buildLineItem(lineItem, [["price_difference_percentage", "-2"]]),
    ];
    // Act
    const result = getInvoiceStatus(givenLineItems);
    // Assert
    expect(result).toEqual({
      bannerClass: "payable",
      bannerText: "Invoice below threshold",
      statusLabel:
        invoiceStatusLabelLookup[InvoiceStatuses.invoiceBelowThreshold],
    });
  });

  test("should return the expected invoice status and the payable banner class when there is a line item within threshold ", () => {
    // Arrange
    // No items are outside threshold in the default data set, so we should get the nominal message.
    const givenLineItems = [
      buildLineItem(lineItem, [["price_difference_percentage", "0.35"]]),
      buildLineItem(lineItem, [["price_difference_percentage", "0.00"]]),
    ];
    // Act
    const result = getInvoiceStatus(givenLineItems);
    // Assert
    expect(result).toEqual({
      bannerClass: "payable",
      bannerText: "Invoice within threshold",
      statusLabel:
        invoiceStatusLabelLookup[InvoiceStatuses.invoiceWithinThreshold],
    });
  });

  test("should return the expected invoice status and the payable banner class when there is only one line item and it has no charge", () => {
    // Arrange
    const givenLineItems = [
      buildLineItem(lineItem, [["price_difference_percentage", "-1234567.01"]]),
    ];
    // Act
    const result = getInvoiceStatus(givenLineItems);
    // Assert
    expect(result).toEqual({
      bannerClass: "payable",
      bannerText: "No charge",
      statusLabel: invoiceStatusLabelLookup[InvoiceStatuses.invoiceHasNoCharge],
    });
  });
});
