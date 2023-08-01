import { waitForPageLoad } from "../helpers/waits";
import InvoicePage from "../pageobjects/invoicePage";
import {
  FullExtractData,
  getInvoicesByContractIdYearMonth,
  getTestDataFilePath,
  extractAllUniqueVendorInvoiceDataFomJson,
  getPriceDifferencePercentageFromJson,
} from "../utils/extractTestDatajson";
import { generateExpectedBannerDetailsFromPercentagePriceDifference } from "../utils/generateExpectedStatusBannerDetails";
import { generateExpectedStatusFromPercentagePriceDifference } from "../utils/generateExpectedStatusFromPriceDifference";
import { getVendorContractIdFromConfig } from "../utils/getVendorContractId";
import { formatPercentageDifference } from "../utils/invoiceDataFormatters";

const openInvoicePage = async (
  contractId: string,
  year: string,
  month: string
): Promise<void> => {
  const invoicePageUrl = `contracts/${contractId}/invoices/${year}-${month}`;
  await InvoicePage.open(invoicePageUrl);
  await waitForPageLoad();
  expect(await browser.getUrl()).toContain(`${year}-${month}`);
};

const setupPageAndGetData = async (
  vendorId: string,
  year: string,
  month: string
): Promise<FullExtractData[]> => {
  const contractId = await getVendorContractIdFromConfig(vendorId);
  await openInvoicePage(contractId, year, month);
  return getInvoicesByContractIdYearMonth(contractId, year, month);
};

describe("Invoice Page Test", () => {
  const testDataFilePath = getTestDataFilePath();
  const vendorInvoiceTestData =
    extractAllUniqueVendorInvoiceDataFomJson(testDataFilePath);

  for (const { vendor, year, month, vendorId } of vendorInvoiceTestData) {
    describe(`Vendor: ${vendor},Invoice:${year}-${month}`, () => {
      let filteredInvoiceItems: FullExtractData[] = [];

      beforeEach(async () => {
        filteredInvoiceItems = await setupPageAndGetData(vendorId, year, month);
      });

      it(`should display correct status banner color and message`, async () => {
        const priceDifferencePercentage = getPriceDifferencePercentageFromJson(
          vendor,
          year,
          month
        );
        const expectedBannerColor =
          generateExpectedBannerDetailsFromPercentagePriceDifference(
            priceDifferencePercentage
          ).bannerColor;
        expect(await InvoicePage.getStatusBannerColor()).toEqual(
          expectedBannerColor
        );
        expectEqualTrimmed(
          await InvoicePage.getStatusBannerTitle(),
          generateExpectedBannerDetailsFromPercentagePriceDifference(
            priceDifferencePercentage
          ).bannerMessage
        );
      });

      it(`should validate reconciliation table data`, async () => {
        await validateTableDataWithAssertions(
          InvoicePage.getTableData(await InvoicePage.reconciliationTable),
          assertReconciliationTableData,
          filteredInvoiceItems
        );
      });

      it(`should validate quantity(events) table data`, async () => {
        await validateTableDataWithAssertions(
          InvoicePage.getTableData(await InvoicePage.quantityTable),
          assertQuantityTableData,
          filteredInvoiceItems
        );
      });

      it(`should validate price table data`, async () => {
        await validateTableDataWithAssertions(
          InvoicePage.getTableData(await InvoicePage.priceTable),
          assertPriceTableData,
          filteredInvoiceItems
        );
      });

      it(`should validate measured(events) table data`, async () => {
        await validateTableDataWithAssertions(
          InvoicePage.getTableData(await InvoicePage.measuredTable),
          assertMeasuredTableData,
          filteredInvoiceItems
        );
      });

      it(`should validate invoice table data`, async () => {
        await validateTableDataWithAssertions(
          InvoicePage.getTableData(await InvoicePage.invoiceTable),
          assertInvoiceTableData,
          filteredInvoiceItems
        );
      });
    });
  }
});

type TableRow = { [key: string]: string };
type AssertFunction = (
  tableRow: TableRow,
  filteredItem: FullExtractData
) => void;

const validateTableDataWithAssertions = async (
  tableData: Promise<TableRow[]>,
  assertFunction: AssertFunction,
  filteredInvoiceItems: FullExtractData[]
): Promise<void> => {
  const tableDataFromUI = await tableData;

  for (let i = 0; i < filteredInvoiceItems.length; i++) {
    assertFunction(tableDataFromUI[i], filteredInvoiceItems[i]);
  }
};

const assertReconciliationTableData = (
  tableRow: { [key: string]: string },
  filteredItem: FullExtractData
): void => {
  expectEqualTrimmed(tableRow["Line Item"], filteredItem.service_name);
  expectEqualTrimmed(
    tableRow["Quantity Discrepancy"],
    filteredItem.quantity_difference
  );
  expectEqualTrimmed(
    tableRow["Price Discrepancy"],
    filteredItem.price_difference
  ); // bug 713 currency issue
  expectEqualTrimmed(
    tableRow["Percentage Discrepancy"],
    formatPercentageDifference(
      parseFloat(filteredItem.price_difference_percentage)
    )
  );
  expectEqualTrimmed(
    tableRow.Status,
    generateExpectedStatusFromPercentagePriceDifference(
      parseFloat(filteredItem.price_difference_percentage)
    )
  );
};

const assertQuantityTableData = (
  tableRow: TableRow,
  filteredItem: FullExtractData
): void => {
  expectEqualTrimmed(tableRow["Line Item"], filteredItem.service_name);
  expectEqualTrimmed(
    tableRow["Invoiced Quantity"],
    filteredItem.billing_quantity
  );
  expectEqualTrimmed(
    tableRow["Measured Quantity"],
    filteredItem.transaction_quantity
  );
  expectEqualTrimmed(
    tableRow["Quantity Discrepancy"],
    filteredItem.quantity_difference
  );
};

const assertPriceTableData = (
  tableRow: TableRow,
  filteredItem: FullExtractData
): void => {
  expectEqualTrimmed(tableRow["Line Item"], filteredItem.service_name);
  expectEqualTrimmed(
    tableRow["Invoiced Price"],
    filteredItem.billing_price_formatted
  );
  expectEqualTrimmed(
    tableRow["Measured Price"],
    filteredItem.transaction_price_formatted
  );
  expectEqualTrimmed(
    tableRow["Price Discrepancy"],
    filteredItem.price_difference
  );
};

const assertMeasuredTableData = (
  tableRow: TableRow,
  filteredItem: FullExtractData
): void => {
  expectEqualTrimmed(tableRow["Line Item"], filteredItem.service_name);
  expectEqualTrimmed(tableRow.Quantity, filteredItem.transaction_quantity);
};

const assertInvoiceTableData = (
  tableRow: TableRow,
  filteredItem: FullExtractData
): void => {
  expectEqualTrimmed(tableRow["Line Item"], filteredItem.service_name);
  expectEqualTrimmed(tableRow.Quantity, filteredItem.billing_quantity);
  expectEqualTrimmed(tableRow["Unit Price"], filteredItem.billing_unit_price);
  expectEqualTrimmed(tableRow.Total, filteredItem.billing_price_formatted);
  expectEqualTrimmed(
    tableRow["Total + VAT"],
    filteredItem.billing_amount_with_tax
  ); // bug 714 and 715 message in the table
};

const expectEqualTrimmed = (actual: string, expected: string): void => {
  expect(actual.trim()).toEqual(expected.trim());
};
