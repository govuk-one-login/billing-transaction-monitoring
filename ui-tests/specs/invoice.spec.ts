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
} from "../utils/extractTestDatajson";
import { getVendorContractIdFromConfig } from "../utils/getVendorContractId";
import { waitForPageLoad } from "../helpers/waits";

describe("Invoice Page Test", async () => {
  const testDataFilePath = getTestDataFilePath();
  const vendorsNameFromJson = getUniqueVendorNamesFromJson(testDataFilePath);

  vendorsNameFromJson.forEach((vendor) => {
    it(`should display correct status banner color and message for each invoice of ${vendor}`, async () => {
      const vendorIds = getUniqueVendorIdsFromJson(vendor);
      for (const vendorId of vendorIds) {
        const contractId = await getVendorContractIdFromConfig(vendorId);
        const uniqueYearsMonths = getUniqueInvoiceMonthsYearsByVendor(vendor);
        for (const monthYear of uniqueYearsMonths) {
          const [year, month] = monthYear.split("-");
          const invoicePageUrl = `contracts/${contractId}/invoices/${year}-${month}`;
          await InvoicePage.open(invoicePageUrl);
          await waitForPageLoad();
          expect(await browser.getUrl()).toContain(`${year}-${month}`);
          const priceDifferencePercentage =
            getPriceDifferencePercentageFromJson(year, month);
          const expectedBannerColor =
            getBannerColorFromPercentagePriceDifference(
              priceDifferencePercentage
            );
          expect(await InvoicePage.getStatusBannerColor()).toEqual(
            expectedBannerColor
          );
        }
      }
    });
  });

  vendorsNameFromJson.forEach((vendor) => {
    it(`should display the reconciliation table for all vendors invoices`, async () => {
      const vendorIds = getUniqueVendorIdsFromJson(vendor);
      for (const vendorId of vendorIds) {
        const contractId = await getVendorContractIdFromConfig(vendorId);
        const uniqueYearsMonths = getUniqueInvoiceMonthsYearsByVendor(vendor);
        for (const monthYear of uniqueYearsMonths) {
          const [year, month] = monthYear.split("-");
          const invoicePageUrl = `contracts/${contractId}/invoices/${year}-${month}`;
          await InvoicePage.open(invoicePageUrl);
          await waitForPageLoad();
          expect(await browser.getUrl()).toContain(`${year}-${month}`);
          const filteredItems = await getItemsByContractIdYearMonth(
            contractId,
            year,
            month
          );
          const tableDataFromUI = await InvoicePage.getTableData(
            await InvoicePage.reconciliationTable
          );
          for (let i = 0; i < filteredItems.length; i++) {
            expect(tableDataFromUI[i]["Line Item"]).toEqual(
              filteredItems[i].service_name
            );
            expect(tableDataFromUI[i]["Quantity Discrepancy"]).toEqual(
              filteredItems[i].quantity_difference
            );
            // expect(tableDataFromUI[i]['Price Discrepancy']).toEqual(lineItems[i].price_difference)
            expect(tableDataFromUI[i]["Percentage Discrepancy"]).toEqual(
              getPercentagePriceDifference(
                parseFloat(filteredItems[i].price_difference_percentage)
              )
            );
            expect(tableDataFromUI[i].Status).toEqual(
              getStatusFromPercentagePriceDifference(
                parseFloat(filteredItems[i].price_difference_percentage)
              )
            );
          }
        }
      }
    });
  });

  vendorsNameFromJson.forEach((vendor) => {
    it(`should display the quantity table for all vendors invoices`, async () => {
      const vendorIds = getUniqueVendorIdsFromJson(vendor);
      for (const vendorId of vendorIds) {
        const contractId = await getVendorContractIdFromConfig(vendorId);
        const uniqueYearsMonths = getUniqueInvoiceMonthsYearsByVendor(vendor);
        for (const monthYear of uniqueYearsMonths) {
          const [year, month] = monthYear.split("-");
          const invoicePageUrl = `contracts/${contractId}/invoices/${year}-${month}`;
          await InvoicePage.open(invoicePageUrl);
          await waitForPageLoad();
          expect(await browser.getUrl()).toContain(`${year}-${month}`);
          const filteredItems = await getItemsByContractIdYearMonth(
            contractId,
            year,
            month
          );
          const tableDataFromUI = await InvoicePage.getTableData(
            await InvoicePage.quantityTable
          );
          for (let i = 0; i < filteredItems.length; i++) {
            expect(tableDataFromUI[i]["Line Item"]).toEqual(
              filteredItems[i].service_name
            );
            expect(tableDataFromUI[i]["Invoiced Quantity"]).toEqual(
              filteredItems[i].billing_quantity
            );
            expect(tableDataFromUI[i]["Measured Quantity"]).toEqual(
              filteredItems[i].transaction_quantity
            );
            expect(tableDataFromUI[i]["Quantity Discrepancy"]).toEqual(
              filteredItems[i].quantity_difference
            );
          }
        }
      }
    });

    vendorsNameFromJson.forEach((vendor) => {
      it(`should display the price table for all vendors invoices`, async () => {
        const vendorIds = getUniqueVendorIdsFromJson(vendor);
        for (const vendorId of vendorIds) {
          const contractId = await getVendorContractIdFromConfig(vendorId);
          const uniqueYearsMonths = getUniqueInvoiceMonthsYearsByVendor(vendor);
          for (const monthYear of uniqueYearsMonths) {
            const [year, month] = monthYear.split("-");
            const invoicePageUrl = `contracts/${contractId}/invoices/${year}-${month}`;
            await InvoicePage.open(invoicePageUrl);
            await waitForPageLoad();
            expect(await browser.getUrl()).toContain(`${year}-${month}`);
            const filteredItems = await getItemsByContractIdYearMonth(
              contractId,
              year,
              month
            );
            const tableDataFromUI = await InvoicePage.getTableData(
              await InvoicePage.priceTable
            );
            for (let i = 0; i < filteredItems.length; i++) {
              expect(tableDataFromUI[i]["Line Item"]).toEqual(
                filteredItems[i].service_name
              );
              expect(tableDataFromUI[i]["Invoiced Price"]).toEqual(
                filteredItems[i].billing_price_formatted
              );
              expect(tableDataFromUI[i]["Measured Price"]).toEqual(
                filteredItems[i].transaction_price_formatted
              );
              expect(tableDataFromUI[i]["Price Discrepancy"]).toEqual(
                filteredItems[i].price_difference
              );
            }
          }
        }
      });
    });
  });

  vendorsNameFromJson.forEach((vendor) => {
    it(`should display the measured table for all vendors invoices`, async () => {
      const vendorIds = getUniqueVendorIdsFromJson(vendor);
      for (const vendorId of vendorIds) {
        const contractId = await getVendorContractIdFromConfig(vendorId);
        const uniqueYearsMonths = getUniqueInvoiceMonthsYearsByVendor(vendor);
        for (const monthYear of uniqueYearsMonths) {
          const [year, month] = monthYear.split("-");
          const invoicePageUrl = `contracts/${contractId}/invoices/${year}-${month}`;
          await InvoicePage.open(invoicePageUrl);
          await waitForPageLoad();
          expect(await browser.getUrl()).toContain(`${year}-${month}`);
          const filteredItems = await getItemsByContractIdYearMonth(
            contractId,
            year,
            month
          );
          const tableDataFromUI = await InvoicePage.getTableData(
            await InvoicePage.measuredTable
          );
          for (let i = 0; i < filteredItems.length; i++) {
            console.log(filteredItems);
            expect(tableDataFromUI[i]["Line Item"]).toEqual(
              filteredItems[i].service_name
            );
            expect(tableDataFromUI[i].Quantity).toEqual(
              filteredItems[i].transaction_quantity
            );
          }
        }
      }
    });
  });

  vendorsNameFromJson.forEach((vendor) => {
    it.only(`should display the invoice table for all ${vendor} invoices`, async () => {
      const vendorIds = getUniqueVendorIdsFromJson(vendor);
      for (const vendorId of vendorIds) {
        const contractId = await getVendorContractIdFromConfig(vendorId);
        const uniqueYearsMonths = getUniqueInvoiceMonthsYearsByVendor(vendor);
        for (const monthYear of uniqueYearsMonths) {
          const [year, month] = monthYear.split("-");
          const invoicePageUrl = `contracts/${contractId}/invoices/${year}-${month}`;
          await InvoicePage.open(invoicePageUrl);
          await waitForPageLoad();
          expect(await browser.getUrl()).toContain(`${year}-${month}`);
          const filteredItems = await getItemsByContractIdYearMonth(
            contractId,
            year,
            month
          );
          const tableDataFromUI = await InvoicePage.getTableData(
            await InvoicePage.invoiceTable
          );
          console.log(tableDataFromUI);
          for (let i = 0; i < filteredItems.length; i++) {
            expect(tableDataFromUI[i]["Line Item"]).toEqual(
              filteredItems[i].service_name
            );
            expect(tableDataFromUI[i].Quantity).toEqual(
              filteredItems[i].billing_quantity
            );
            expect(tableDataFromUI[i]["Unit Price"]).toEqual(
              filteredItems[i].billing_unit_price
            );
            expect(tableDataFromUI[i].Total).toEqual(
              filteredItems[i].billing_price_formatted
            );
            expect(tableDataFromUI[i]["Total + VAT"]).toEqual(
              filteredItems[i].billing_amount_with_tax
            );
          }
        }
      }
    });
  });
});
