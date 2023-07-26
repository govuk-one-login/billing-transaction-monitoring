import { waitForPageLoad } from "../helpers/waits";
import InvoicePage from "../pageobjects/invoicePage";
import {
  FullExtractData,
  getInvoicesByContractIdYearMonth,
  getTestDataFilePath,
  getUniqueVendorNamesFromJson,
  getUniqueInvoiceMonthsYearsByVendor,
  getUniqueVendorIdsFromJson,
  getPriceDifferencePercentageFromJson,
} from "../utils/extractTestDatajson";
import { generateExpectedBannerDetailsFromPercentagePriceDifference } from "../utils/generateExpectedStatusBannerDetails";
import { generateExpectedStatusFromPercentagePriceDifference } from "../utils/generateExpectedStatusFromPriceDifference";
import { getVendorContractIdFromConfig } from "../utils/getVendorContractId";
import { formatPercentageDifference } from "../utils/invoiceDataFormatters";

const openInvoicePage = async (
  contractId: number,
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
  return await getInvoicesByContractIdYearMonth(contractId, year, month);
};

describe("Invoice Page Test", () => {
  const testDataFilePath = getTestDataFilePath();
  const vendorsNameFromJson = getUniqueVendorNamesFromJson(testDataFilePath);

  for (const vendor of vendorsNameFromJson) {
    const { monthYears } = getUniqueInvoiceMonthsYearsByVendor(vendor);
    const uniqueYearsMonths = Array.from(monthYears);

    for (const monthYear of uniqueYearsMonths) {
      const [year, month] = monthYear.split("-");
      const vendorIds = getUniqueVendorIdsFromJson(vendor);

      for (const vendorId of vendorIds) {
        describe(`Vendor: ${vendor},Invoice:${year}-${month}`, () => {
          let filteredInvoiceItems: FullExtractData[] = [];

          beforeEach(async () => {
            filteredInvoiceItems = await setupPageAndGetData(
              vendorId,
              year,
              month
            );
          });

          it(`should display correct status banner color and message`, async () => {
            const priceDifferencePercentage =
              getPriceDifferencePercentageFromJson(vendor, year, month);
            const expectedBannerColor =
              generateExpectedBannerDetailsFromPercentagePriceDifference(
                priceDifferencePercentage
              ).bannerColor;
            expect(await InvoicePage.getStatusBannerColor()).toEqual(
              expectedBannerColor
            );
            expect(await InvoicePage.getStatusBannerTitle()).toEqual(
              generateExpectedBannerDetailsFromPercentagePriceDifference(
                priceDifferencePercentage
              ).bannerMessage
            );
          });

          it(`should validate reconciliation table data`, async () => {
            const tableDataFromUI = await InvoicePage.getTableData(
              await InvoicePage.reconciliationTable
            );
            for (let i = 0; i < filteredInvoiceItems.length; i++) {
              assertReconciliationTableData(
                tableDataFromUI[i],
                filteredInvoiceItems[i]
              );
            }
          });

          it(`should validate quantity(events) table data`, async () => {
            const tableDataFromUI = await InvoicePage.getTableData(
              await InvoicePage.quantityTable
            );
            for (let i = 0; i < filteredInvoiceItems.length; i++) {
              assertQuantityTableData(
                tableDataFromUI[i],
                filteredInvoiceItems[i]
              );
            }
          });

          it(`should validate price table data`, async () => {
            const tableDataFromUI = await InvoicePage.getTableData(
              await InvoicePage.priceTable
            );
            for (let i = 0; i < filteredInvoiceItems.length; i++) {
              assertPriceTableData(tableDataFromUI[i], filteredInvoiceItems[i]);
            }
          });

          it(`should validate measured(events) table data`, async () => {
            const tableDataFromUI = await InvoicePage.getTableData(
              await InvoicePage.measuredTable
            );
            for (let i = 0; i < filteredInvoiceItems.length; i++) {
              assertMeasuredTableData(
                tableDataFromUI[i],
                filteredInvoiceItems[i]
              );
            }
          });

          it(`should validate invoice table data`, async () => {
            const tableDataFromUI = await InvoicePage.getTableData(
              await InvoicePage.invoiceTable
            );

            for (let i = 0; i < filteredInvoiceItems.length; i++) {
              assertInvoiceTableData(
                tableDataFromUI[i],
                filteredInvoiceItems[i]
              );
            }
          });
        });
      }
    }
  }
});

const assertReconciliationTableData = (
  tableRow: { [key: string]: string },
  filteredItem: FullExtractData
): void => {
  expect(tableRow["Line Item"]).toEqual(filteredItem.service_name);
  expect(tableRow["Quantity Discrepancy"]).toEqual(
    filteredItem.quantity_difference
  );
  expect(tableRow["Price Discrepancy"]).toEqual(filteredItem.price_difference); // bug 713 currency issue
  expect(tableRow["Percentage Discrepancy"]).toEqual(
    formatPercentageDifference(filteredItem.price_difference_percentage)
  );
  expect(tableRow.Status).toEqual(
    generateExpectedStatusFromPercentagePriceDifference(
      filteredItem.price_difference_percentage
    )
  );
};

const assertQuantityTableData = (
  tableRow: { [key: string]: string },
  filteredItem: FullExtractData
): void => {
  expect(tableRow["Line Item"]).toEqual(filteredItem.service_name);
  expect(tableRow["Invoiced Quantity"]).toEqual(filteredItem.billing_quantity);
  expect(tableRow["Measured Quantity"]).toEqual(
    filteredItem.transaction_quantity
  );
  expect(tableRow["Quantity Discrepancy"]).toEqual(
    filteredItem.quantity_difference
  );
};

const assertPriceTableData = (
  tableRow: { [key: string]: string },
  filteredItem: FullExtractData
): void => {
  expect(tableRow["Line Item"]).toEqual(filteredItem.service_name);
  expect(tableRow["Invoiced Price"]).toEqual(
    filteredItem.billing_price_formatted
  );
  expect(tableRow["Measured Price"]).toEqual(
    filteredItem.transaction_price_formatted
  );
  expect(tableRow["Price Discrepancy"]).toEqual(filteredItem.price_difference);
};

const assertMeasuredTableData = (
  tableRow: { [key: string]: string },
  filteredItem: FullExtractData
): void => {
  expect(tableRow["Line Item"]).toEqual(filteredItem.service_name);
  expect(tableRow.Quantity).toEqual(filteredItem.transaction_quantity);
};

const assertInvoiceTableData = (
  tableRow: { [key: string]: string },
  filteredItem: FullExtractData
): void => {
  expect(tableRow["Line Item"]).toEqual(filteredItem.service_name);
  expect(tableRow.Quantity).toEqual(filteredItem.billing_quantity);
  expect(tableRow["Unit Price"]).toEqual(filteredItem.billing_unit_price);
  expect(tableRow.Total).toEqual(filteredItem.billing_price_formatted);
  expect(tableRow["Total + VAT"]).toEqual(filteredItem.billing_amount_with_tax); // bug 714 and 715 message in the table
};
