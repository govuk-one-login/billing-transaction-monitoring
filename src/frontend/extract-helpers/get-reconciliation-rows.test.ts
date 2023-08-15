import { getReconciliationRows, getTotals } from "./get-reconciliation-rows";
import { buildLineItem } from "./test-builders";

describe("getReconciliationRows", () => {
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
    invoice_is_quarterly: "false",
  };

  test("Should return the data for the Reconciliation Tables when all billing and transaction data is available", () => {
    // Arrange
    const givenLineItems = [
      buildLineItem(lineItem, [["price_difference_percentage", "-100.0"]]),
    ];

    const expectedReconciliationRow = [
      {
        serviceName: "Passport check",
        quantityDiscrepancy: "-9",
        priceDiscrepancy: "£-27.50",
        percentageDiscrepancy: "-100.0%",
        status: {
          message: "Below Threshold",
          class: "govuk-tag--blue",
        },
        billingUnitPrice: "£0.0000",
        billingQuantity: "2",
        transactionQuantity: "11",
        billingPrice: "£0.00",
        transactionPrice: "£27.50",
        billingPriceInclVat: "",
      },
    ];
    // Act
    const result = getReconciliationRows(givenLineItems);
    // Assert
    expect(result).toEqual(expectedReconciliationRow);
  });

  test("Should return the data for the Reconciliation Tables when Invoice data is missing", () => {
    // Arrange
    const givenLineItems = [
      buildLineItem(lineItem, [
        ["billing_unit_price", ""],
        ["billing_price_formatted", ""],
        ["price_difference", ""],
        ["billing_quantity", ""],
        ["quantity_difference", ""],
        ["price_difference_percentage", "-1234567.03"], // MN for Invoice data missing
      ]),
    ];

    const expectedReconciliationRow = [
      {
        serviceName: "Passport check",
        quantityDiscrepancy: "",
        priceDiscrepancy: "",
        percentageDiscrepancy: "Invoice data missing",
        status: {
          message: "Pending",
          class: "govuk-tag--grey",
        },
        billingQuantity: "Invoice data missing",
        transactionQuantity: "11",
        billingUnitPrice: "Invoice data missing",
        billingPrice: "Invoice data missing",
        transactionPrice: "£27.50",
        billingPriceInclVat: "Invoice data missing",
      },
    ];
    // Act
    const result = getReconciliationRows(givenLineItems);
    // Assert
    expect(result).toEqual(expectedReconciliationRow);
  });

  test("Should return the data for the Reconciliation Tables when transaction events are missing", () => {
    // Arrange
    const givenLineItems = [
      buildLineItem(lineItem, [
        ["billing_unit_price", "£0.3200"],
        ["billing_price_formatted", "£96"],
        ["billing_quantity", "300"],
        ["transaction_price_formatted", ""],
        ["price_difference", ""],
        ["transaction_quantity", ""],
        ["quantity_difference", ""],
        ["billing_amount_with_tax", "£116.10"],
        ["price_difference_percentage", "-1234567.04"], // MN for Events missing
      ]),
    ];
    const expectedReconciliationRow = [
      {
        serviceName: "Passport check",
        quantityDiscrepancy: "",
        priceDiscrepancy: "",
        percentageDiscrepancy: "Events missing",
        status: {
          message: "Error",
          class: "govuk-tag--grey",
        },
        billingQuantity: "300",
        transactionQuantity: "Events missing",
        billingUnitPrice: "£0.3200",
        billingPrice: "£96",
        transactionPrice: "Events missing",
        billingPriceInclVat: "£116.10",
      },
    ];
    // Act
    const result = getReconciliationRows(givenLineItems);
    // Assert
    expect(result).toEqual(expectedReconciliationRow);
  });

  test("Should return the data for the Reconciliation Table when there are two line items, one with an unexpected invoice charge and one within threshold.", () => {
    // Arrange
    const givenLineItems = [
      buildLineItem(lineItem, [
        ["billing_unit_price", "£2.5000"],
        ["service_name", "Passport check"],
        ["billing_price_formatted", "£27.50"],
        ["billing_quantity", "11"],
        ["transaction_price_formatted", "£0.00"],
        ["price_difference", "£27.50"],
        ["transaction_quantity", "2"],
        ["quantity_difference", "9"],
        ["billing_amount_with_tax", "£30.00"],
        ["price_difference_percentage", "-1234567.05"], // MN for unexpected charge
      ]),
      buildLineItem(lineItem, [
        ["billing_unit_price", "£9.0909"],
        ["service_name", "Standard Charge"],
        ["billing_price_formatted", "£100.00"],
        ["billing_quantity", "11"],
        ["transaction_price_formatted", "£100.00"],
        ["price_difference", "£0.00"],
        ["transaction_quantity", "11"],
        ["quantity_difference", "0"],
        ["billing_amount_with_tax", "£105.00"],
        ["price_difference_percentage", "0.0"],
      ]),
    ];
    const expectedReconciliationRow = [
      {
        serviceName: "Passport check",
        quantityDiscrepancy: "9",
        priceDiscrepancy: "£27.50",
        percentageDiscrepancy: "Unexpected invoice charge",
        status: {
          message: "Error",
          class: "govuk-tag--grey",
        },
        billingQuantity: "11",
        transactionQuantity: "2",
        billingUnitPrice: "£2.5000",
        billingPrice: "£27.50",
        transactionPrice: "£0.00",
        billingPriceInclVat: "£30.00",
      },
      {
        serviceName: "Standard Charge",
        quantityDiscrepancy: "0",
        priceDiscrepancy: "£0.00",
        percentageDiscrepancy: "0.0%",
        status: {
          message: "Within Threshold",
          class: "govuk-tag--green",
        },
        billingQuantity: "11",
        transactionQuantity: "11",
        billingUnitPrice: "£9.0909",
        billingPrice: "£100.00",
        transactionPrice: "£100.00",
        billingPriceInclVat: "£105.00",
      },
    ];
    // Act
    const result = getReconciliationRows(givenLineItems);
    // Assert
    expect(result).toEqual(expectedReconciliationRow);
  });

  describe("getTotals", () => {
    test("Should return the totals when there is one reconciliation row", () => {
      // Arrange
      const reconciliationRow = [
        {
          serviceName: "Passport Charge",
          quantityDiscrepancy: "0",
          priceDiscrepancy: "£0.00",
          percentageDiscrepancy: "0.0%",
          status: {
            message: "Within Threshold",
            class: "govuk-tag--green",
          },
          billingQuantity: "53430",
          transactionQuantity: "53430",
          billingUnitPrice: "£0.3000",
          billingPrice: "£16,029.00",
          transactionPrice: "£16,029.00",
          billingPriceInclVat: "£19,234.80",
        },
      ];
      // Act
      const result = getTotals(reconciliationRow);
      // Assert
      expect(result).toEqual({
        billingPriceInclVatTotal: "£19,234.80",
        billingPriceTotal: "£16,029.00",
      });
    });

    test("Should return the totals as 0 when there is one reconciliation row that has Invoice data missing", () => {
      // Arrange
      const reconciliationRow = [
        {
          serviceName: "Fraud check",
          quantityDiscrepancy: "",
          priceDiscrepancy: "",
          percentageDiscrepancy: "Invoice data missing",
          status: { message: "Pending", class: "govuk-tag--grey" },
          billingQuantity: "Invoice data missing",
          transactionQuantity: "17321",
          billingUnitPrice: "Invoice data missing",
          billingPrice: "Invoice data missing",
          billingPriceInclVat: "Invoice data missing",
          transactionPrice: "£5,889.14",
        },
      ];
      // Act
      const result = getTotals(reconciliationRow);
      // Assert
      expect(result).toEqual({
        billingPriceInclVatTotal: "£0.00",
        billingPriceTotal: "£0.00",
      });
    });

    test("Should return the totals when there are multiple reconciliation rows and has Invoice data missing", () => {
      // Arrange
      const reconciliationRow = [
        {
          serviceName: "Fraud check",
          quantityDiscrepancy: "",
          priceDiscrepancy: "",
          percentageDiscrepancy: "Invoice data missing",
          status: { message: "Pending", class: "govuk-tag--grey" },
          billingQuantity: "Invoice data missing",
          transactionQuantity: "17321",
          billingUnitPrice: "Invoice data missing",
          billingPrice: "Invoice data missing",
          billingPriceInclVat: "Invoice data missing",
          transactionPrice: "£5,889.14",
        },
        {
          serviceName: "Passport check",
          quantityDiscrepancy: "9",
          priceDiscrepancy: "£27.50",
          percentageDiscrepancy: "Unexpected invoice charge",
          status: {
            message: "Error",
            class: "govuk-tag--grey",
          },
          billingQuantity: "11",
          transactionQuantity: "2",
          billingUnitPrice: "£2.5000",
          billingPrice: "£27.50",
          transactionPrice: "£0.00",
          billingPriceInclVat: "£30.00",
        },
        {
          serviceName: "Standard Charge",
          quantityDiscrepancy: "0",
          priceDiscrepancy: "£0.00",
          percentageDiscrepancy: "0.0%",
          status: {
            message: "Within Threshold",
            class: "govuk-tag--green",
          },
          billingQuantity: "11",
          transactionQuantity: "11",
          billingUnitPrice: "£9.0909",
          billingPrice: "£100.00",
          transactionPrice: "£100.00",
          billingPriceInclVat: "£105.00",
        },
        {
          serviceName: "Additional Charge",
          quantityDiscrepancy: "0",
          priceDiscrepancy: "£0.00",
          percentageDiscrepancy: "0.0%",
          status: {
            message: "Within Threshold",
            class: "govuk-tag--green",
          },
          billingQuantity: "53430",
          transactionQuantity: "53430",
          billingUnitPrice: "£0.3000",
          billingPrice: "£16,029.00",
          transactionPrice: "£16,029.00",
          billingPriceInclVat: "£19,234.80",
        },
      ];
      // Act
      const result = getTotals(reconciliationRow);
      // Assert
      expect(result).toEqual({
        billingPriceInclVatTotal: "£19,369.80",
        billingPriceTotal: "£16,156.50",
      });
    });
  });
});
