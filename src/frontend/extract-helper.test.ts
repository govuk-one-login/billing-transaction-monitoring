import {
  getContractPeriods,
  getLineItems,
  getReconciliationRows,
} from "./extract-helper";
import { fetchS3 } from "../shared/utils";

jest.mock("../shared/utils");
const mockedFetchS3 = fetchS3 as jest.Mock;

describe("extract helper", () => {
  let contractId: string;

  const fakeDataRow = (
    year: string,
    month: string,
    contractId: string,
    prefix: string
  ): string => {
    return `{"month":"${month}", "year":"${year}", "contract_id":"${contractId}", "vendor_id": "${prefix}_vendor_id", "vendor_name": "${prefix} vendor_name", "service_name": "${prefix} service_name", "contract_name": "${prefix} contract_name", "billing_price_formatted": "${prefix} bpf", "transaction_price_formatted": "${prefix} tpf", "price_difference": "${prefix} pd", "billing_quantity":"2", "transaction_quantity":"11", "quantity_difference":"-9", "billing_amount_with_tax": "${prefix} bawt", "price_difference_percentage": "${prefix} pdp"}`;
  };

  beforeEach(() => {
    process.env = {
      STORAGE_BUCKET: "given storage bucket",
    };

    contractId = "1";

    mockedFetchS3.mockResolvedValue(
      fakeDataRow("2023", "03", "1", "test1") +
        "\n" +
        fakeDataRow("2023", "03", "2", "test1") +
        "\n" +
        fakeDataRow("2023", "04", "1", "test1") +
        "\n" +
        fakeDataRow("2023", "05", "1", "test1") +
        "\n" +
        fakeDataRow("2023", "05", "1", "test2") +
        "\n" +
        fakeDataRow("2023", "06", "1", "test1")
    );
  });

  describe("getContractPeriods", () => {
    test("should return the month, year and prettyMonth", async () => {
      // Act
      const result = await getContractPeriods(contractId);
      // Assert
      expect(result).toEqual([
        { month: "03", prettyMonth: "Mar", year: "2023" },
        { month: "04", prettyMonth: "Apr", year: "2023" },
        { month: "05", prettyMonth: "May", year: "2023" },
        { month: "06", prettyMonth: "Jun", year: "2023" },
      ]);
    });
  });

  describe("getLineItems", () => {
    test("should return the month, year and prettyMonth", async () => {
      // Act
      const result = await getLineItems(contractId, "2023", "05");
      // Assert
      expect(result).toEqual([
        {
          vendor_id: "test1_vendor_id",
          vendor_name: "test1 vendor_name",
          contract_id: "1",
          contract_name: "test1 contract_name",
          service_name: "test1 service_name",
          year: "2023",
          month: "05",
          price_difference: "test1 pd",
          price_difference_percentage: "test1 pdp",
          transaction_price_formatted: "test1 tpf",
          billing_quantity: "2",
          transaction_quantity: "11",
          quantity_difference: "-9",
          billing_amount_with_tax: "test1 bawt",
          billing_price_formatted: "test1 bpf",
        },
        {
          vendor_id: "test2_vendor_id",
          vendor_name: "test2 vendor_name",
          contract_id: "1",
          contract_name: "test2 contract_name",
          service_name: "test2 service_name",
          year: "2023",
          month: "05",
          price_difference: "test2 pd",
          price_difference_percentage: "test2 pdp",
          transaction_price_formatted: "test2 tpf",
          billing_quantity: "2",
          transaction_quantity: "11",
          quantity_difference: "-9",
          billing_amount_with_tax: "test2 bawt",
          billing_price_formatted: "test2 bpf",
        },
      ]);
    });
  });

  describe("getReconciliationRows", () => {
    test("Should return the data for the Reconciliation Table when all billing and transaction data is available", async () => {
      // Arrange
      const givenLineItems = [
        {
          vendor_id: "vendor_testvendor4",
          vendor_name: "Vendor Four",
          service_name: "Passport check",
          contract_id: "4",
          contract_name: "FOOBAR1",
          year: "2005",
          month: "02",
          billing_price_formatted: "£0.00",
          transaction_price_formatted: "£27.50",
          price_difference: "£-27.50",
          billing_quantity: "2",
          transaction_quantity: "11",
          quantity_difference: "-9",
          billing_amount_with_tax: "",
          price_difference_percentage: "-100.0",
        },
      ];
      const expectedReconciliationRow = [
        {
          serviceName: "Passport check",
          quantityDiscrepancy: "-9",
          priceDiscrepancy: "£-27.50",
          percentageDiscrepancy: "-100.0%",
          status: {
            statusMessage: "Below Threshold",
            statusClasses: "govuk-tag--blue",
          },
          billingQuantity: "2",
          transactionQuantity: "11",
        },
      ];
      // Act
      const result = getReconciliationRows(givenLineItems);
      // Assert
      expect(result).toEqual(expectedReconciliationRow);
    });

    test("Should return the data for the Reconciliation Table when Invoice data is missing", async () => {
      // Arrange
      const givenLineItems = [
        {
          vendor_id: "vendor_testvendor4",
          vendor_name: "Vendor Four",
          service_name: "Passport check",
          contract_id: "4",
          contract_name: "FOOBAR1",
          year: "2005",
          month: "02",
          billing_price_formatted: "",
          transaction_price_formatted: "£27.50",
          price_difference: "",
          billing_quantity: "",
          transaction_quantity: "11",
          quantity_difference: "",
          billing_amount_with_tax: "",
          price_difference_percentage: "-1234567.03",
        },
      ];
      const expectedReconciliationRow = [
        {
          serviceName: "Passport check",
          quantityDiscrepancy: "",
          priceDiscrepancy: "",
          percentageDiscrepancy: "Invoice data missing",
          status: {
            statusMessage: "Pending",
            statusClasses: "govuk-tag--grey",
          },
          billingQuantity: "Invoice data missing",
          transactionQuantity: "11",
        },
      ];
      // Act
      const result = getReconciliationRows(givenLineItems);
      // Assert
      expect(result).toEqual(expectedReconciliationRow);
    });

    test("Should return the data for the Reconciliation Table when transaction events are missing", async () => {
      // Arrange
      const givenLineItems = [
        {
          vendor_id: "vendor_testvendor4",
          vendor_name: "Vendor Four",
          service_name: "Passport check",
          contract_id: "4",
          contract_name: "FOOBAR1",
          year: "2005",
          month: "02",
          billing_price_formatted: "£96",
          transaction_price_formatted: "",
          price_difference: "",
          billing_quantity: "300",
          transaction_quantity: "",
          quantity_difference: "",
          billing_amount_with_tax: "£116.10",
          price_difference_percentage: "-1234567.04",
        },
      ];
      const expectedReconciliationRow = [
        {
          serviceName: "Passport check",
          quantityDiscrepancy: "",
          priceDiscrepancy: "",
          percentageDiscrepancy: "Events missing",
          status: {
            statusMessage: "Error",
            statusClasses: "govuk-tag--grey",
          },
          billingQuantity: "300",
          transactionQuantity: "Events missing",
        },
      ];
      // Act
      const result = getReconciliationRows(givenLineItems);
      // Assert
      expect(result).toEqual(expectedReconciliationRow);
    });

    test("Should return the data for the Reconciliation Table when there are two line items, one with an unexpected invoice charge and one within threshold.", async () => {
      // Arrange
      const givenLineItems = [
        {
          vendor_id: "vendor_testvendor4",
          vendor_name: "Vendor Four",
          service_name: "Passport check",
          contract_id: "4",
          contract_name: "FOOBAR1",
          year: "2005",
          month: "02",
          billing_price_formatted: "£27.50",
          transaction_price_formatted: "0.00",
          price_difference: "£27.50",
          billing_quantity: "11",
          transaction_quantity: "2",
          quantity_difference: "9",
          billing_amount_with_tax: "£30.00",
          price_difference_percentage: "-1234567.05",
        },
        {
          vendor_id: "vendor_testvendor4",
          vendor_name: "Vendor Four",
          service_name: "Standard Charge",
          contract_id: "4",
          contract_name: "FOOBAR1",
          year: "2005",
          month: "02",
          billing_price_formatted: "£100.00",
          transaction_price_formatted: "100.00",
          price_difference: "£0.00",
          billing_quantity: "11",
          transaction_quantity: "11",
          quantity_difference: "0",
          billing_amount_with_tax: "£105.00",
          price_difference_percentage: "0.0",
        },
      ];
      const expectedReconciliationRow = [
        {
          serviceName: "Passport check",
          quantityDiscrepancy: "9",
          priceDiscrepancy: "£27.50",
          percentageDiscrepancy: "Unexpected invoice charge",
          status: {
            statusMessage: "Above Threshold",
            statusClasses: "govuk-tag--red",
          },
          billingQuantity: "11",
          transactionQuantity: "2",
        },
        {
          serviceName: "Standard Charge",
          quantityDiscrepancy: "0",
          priceDiscrepancy: "£0.00",
          percentageDiscrepancy: "0.0%",
          status: {
            statusMessage: "Within Threshold",
            statusClasses: "govuk-tag--green",
          },
          billingQuantity: "11",
          transactionQuantity: "11",
        },
      ];
      // Act
      const result = getReconciliationRows(givenLineItems);
      // Assert
      expect(result).toEqual(expectedReconciliationRow);
    });
  });
});
