import InvoicePage from "../pageobjects/invoicePage";
import {
  getTestDataFilePath,
  getUniqueVendorNamesFromJson,
  getUniqueVendorIdsFromJson,
  getUniqueInvoiceMonthsYearsByVendor,
  getBannerColorFromPercentagePriceDifference,
  getPriceDifferencePercentageFromJson,
  getItemsByContractIdYearMonth,
  getStatusFromPercentagePriceDifference,
  getPercentagePriceDifference,
  FullExtractData,
  getBannerMessageFromPercentagePriceDifference,
} from "../utils/extractTestDatajson";
import { getVendorContractIdFromConfig } from "../utils/getVendorContractId";
import { waitForPageLoad } from "../helpers/waits";

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

describe("Invoice Page Test", async () => {
  const testDataFilePath = getTestDataFilePath();
  const vendorsNameFromJson = getUniqueVendorNamesFromJson(testDataFilePath);
  for (const vendor of vendorsNameFromJson) {
    const vendorIds = getUniqueVendorIdsFromJson(vendor);
    for (const vendorId of vendorIds) {
      const uniqueYearsMonths = getUniqueInvoiceMonthsYearsByVendor(vendor);
      for (const monthYear of uniqueYearsMonths) {
        const [year, month] = monthYear.split("-");

        describe(`Vendor: ${vendor},Invoice:${year}-${month}`, () => {
          let contractId: number = 0;
          beforeEach(async () => {
            contractId = await getVendorContractIdFromConfig(vendorId);
            await openInvoicePage(contractId, year, month);
          });

          it.only(`should display correct status banner color and message`, async () => {
            const priceDifferencePercentage =
              getPriceDifferencePercentageFromJson(year, month);
            console.log(
              priceDifferencePercentage.toString() +
                ` ${vendor} ${year} ${month}`
            );
            const expectedBannerColor =
              getBannerColorFromPercentagePriceDifference(
                priceDifferencePercentage
              );
            expect(await InvoicePage.getStatusBannerColor()).toEqual(
              expectedBannerColor
            );
            console.log(
              priceDifferencePercentage.toString() +
                `${vendor} ${year} ${month}`
            );

            expect(await InvoicePage.getStatusBannerTitle()).toEqual(
              getBannerMessageFromPercentagePriceDifference(
                priceDifferencePercentage
              )
            );
          });

          it(`should validate reconciliation table data`, async () => {
            const tableDataFromUI = await InvoicePage.getTableData(
              await InvoicePage.reconciliationTable
            );
            const filteredItems = await getItemsByContractIdYearMonth(
              contractId,
              year,
              month
            );
            for (let i = 0; i < filteredItems.length; i++) {
              assertReconciliationTableData(
                tableDataFromUI[i],
                filteredItems[i]
              );
            }
          });

          it(`should validate quantity(events) table data`, async () => {
            const tableDataFromUI = await InvoicePage.getTableData(
              await InvoicePage.quantityTable
            );
            const filteredItems = await getItemsByContractIdYearMonth(
              contractId,
              year,
              month
            );
            for (let i = 0; i < filteredItems.length; i++) {
              assertQuantityTableData(tableDataFromUI[i], filteredItems[i]);
            }
          });

          it(`should validate price table data`, async () => {
            const tableDataFromUI = await InvoicePage.getTableData(
              await InvoicePage.priceTable
            );
            const filteredItems = await getItemsByContractIdYearMonth(
              contractId,
              year,
              month
            );
            for (let i = 0; i < filteredItems.length; i++) {
              assertPriceTableData(tableDataFromUI[i], filteredItems[i]);
            }
          });

          it(`should validate measured(events) table data`, async () => {
            const tableDataFromUI = await InvoicePage.getTableData(
              await InvoicePage.measuredTable
            );
            const filteredItems = await getItemsByContractIdYearMonth(
              contractId,
              year,
              month
            );
            for (let i = 0; i < filteredItems.length; i++) {
              assertMeasuredTableData(tableDataFromUI[i], filteredItems[i]);
            }
          });

          it(`should validate invoice table data`, async () => {
            const tableDataFromUI = await InvoicePage.getTableData(
              await InvoicePage.invoiceTable
            );
            const filteredItems = await getItemsByContractIdYearMonth(
              contractId,
              year,
              month
            );
            for (let i = 0; i < filteredItems.length; i++) {
              assertInvoiceTableData(tableDataFromUI[i], filteredItems[i]);
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
  // expect(tableRow['Price Discrepancy']).toEqual(filteredItem.price_difference)
  expect(tableRow["Percentage Discrepancy"]).toEqual(
    getPercentagePriceDifference(
      parseFloat(filteredItem.price_difference_percentage)
    )
  );
  expect(tableRow.Status).toEqual(
    getStatusFromPercentagePriceDifference(
      parseFloat(filteredItem.price_difference_percentage)
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
  expect(tableRow["Total + VAT"]).toEqual(filteredItem.billing_amount_with_tax);
};
