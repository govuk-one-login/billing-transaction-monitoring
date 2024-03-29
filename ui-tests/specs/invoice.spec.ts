import { FullExtractData } from "../../src/handlers/int-test-support/types";
import { waitForPageLoad } from "../helpers/waits";
import InvoicePage from "../pageobjects/invoicePage";
import { expectEqual } from "../utils/customTestAssertion";
import {
  getInvoicesByContractIdYearMonth,
  getTestDataFilePath,
  extractAllUniqueVendorInvoiceDataFomJson,
  getPriceDifferencePercentageFromJson,
} from "../utils/extractTestDatajson";
import { generateExpectedBannerDetailsFromPercentagePriceDifference } from "../utils/generateExpectedStatusBannerDetails";
import { generateExpectedStatusFromPercentagePriceDifference } from "../utils/generateExpectedStatusFromPriceDifference";
import { quarterName, prettyMonthName } from "../utils/getPrettyMonthName";
import { getVendorContractIdFromConfig } from "../utils/getVendorContractId";
import { formatPercentageDifference } from "../utils/invoiceDataFormatters";

const openInvoicePage = async (
  contractId: string,
  year: string,
  monthOrQuarter: string
): Promise<void> => {
  const invoicePageUrl = `contracts/${contractId}/invoices/${year}-${monthOrQuarter}`;
  await InvoicePage.open(invoicePageUrl);
  await waitForPageLoad();
  expect(await browser.getUrl()).toContain(`${year}-${monthOrQuarter}`);
};

const setupPageAndGetData = async (
  vendorId: string,
  year: string,
  month: string,
  invoiceIsQuarterly: boolean = false
): Promise<FullExtractData[]> => {
  const contractId = await getVendorContractIdFromConfig(vendorId);
  const monthOrQuarter = invoiceIsQuarterly
    ? quarterName(month).toLowerCase()
    : month;
  await openInvoicePage(contractId, year, monthOrQuarter);
  return getInvoicesByContractIdYearMonth(contractId, year, month);
};

describe("Invoice Page Test", () => {
  const testDataFilePath = getTestDataFilePath();
  const vendorInvoiceTestData =
    extractAllUniqueVendorInvoiceDataFomJson(testDataFilePath);

  for (const {
    vendor,
    year,
    month,
    vendorId,
    invoiceIsQuarterly,
  } of vendorInvoiceTestData) {
    describe(`Vendor: ${vendor},Invoice:${year}-${
      invoiceIsQuarterly ? quarterName(month) : month
    }`, () => {
      let filteredInvoiceItems: FullExtractData[] = [];

      beforeEach(async () => {
        filteredInvoiceItems = await setupPageAndGetData(
          vendorId,
          year,
          month,
          invoiceIsQuarterly
        );
        const pageTitle = await InvoicePage.getPageHeadingText();
        const monthOrQuarterString = invoiceIsQuarterly
          ? quarterName(month)
          : prettyMonthName(month);
        expect(pageTitle).toContain(
          `${vendor} (${monthOrQuarterString} ${year})`
        );
      });

      it(`should display correct status banner color and message`, async () => {
        const priceDifferencePercentage = getPriceDifferencePercentageFromJson(
          vendor,
          year,
          month
        );
        expectEqual(
          await InvoicePage.getStatusBannerTitle(),
          generateExpectedBannerDetailsFromPercentagePriceDifference(
            priceDifferencePercentage
          ).bannerMessage
        );
        const expectedBannerColor =
          generateExpectedBannerDetailsFromPercentagePriceDifference(
            priceDifferencePercentage
          ).bannerColor;
        expectEqual(
          await InvoicePage.getStatusBannerColor(),
          expectedBannerColor
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
  expectEqual(tableRow["Line item"], filteredItem.service_name);
  expectEqual(
    tableRow["Quantity discrepancy"],
    filteredItem.quantity_difference
  );
  expectEqual(tableRow["Price discrepancy"], filteredItem.price_difference);
  expectEqual(
    tableRow["Percentage discrepancy"],
    formatPercentageDifference(
      parseFloat(filteredItem.price_difference_percentage)
    )
  );
  expectEqual(
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
  expectEqual(tableRow["Line item"], filteredItem.service_name);
  expectEqual(tableRow["Invoiced quantity"], filteredItem.billing_quantity);
  expectEqual(tableRow["Measured quantity"], filteredItem.transaction_quantity);
  expectEqual(
    tableRow["Quantity discrepancy"],
    filteredItem.quantity_difference
  );
};

const assertPriceTableData = (
  tableRow: TableRow,
  filteredItem: FullExtractData
): void => {
  expectEqual(tableRow["Line item"], filteredItem.service_name);
  expectEqual(tableRow["Invoiced price"], filteredItem.billing_price_formatted);
  expectEqual(
    tableRow["Measured price"],
    filteredItem.transaction_price_formatted
  );
  expectEqual(tableRow["Price discrepancy"], filteredItem.price_difference);
};

const assertMeasuredTableData = (
  tableRow: TableRow,
  filteredItem: FullExtractData
): void => {
  expectEqual(tableRow["Line item"], filteredItem.service_name);
  expectEqual(tableRow.Quantity, filteredItem.transaction_quantity);
};

const assertInvoiceTableData = (
  tableRow: TableRow,
  filteredItem: FullExtractData
): void => {
  expectEqual(tableRow["Line item"], filteredItem.service_name);
  expectEqual(tableRow.Quantity, filteredItem.billing_quantity);
  expectEqual(tableRow["Unit price"], filteredItem.billing_unit_price);
  expectEqual(tableRow.Total, filteredItem.billing_price_formatted);
  expectEqual(tableRow["Total + VAT"], filteredItem.billing_amount_with_tax);
};
