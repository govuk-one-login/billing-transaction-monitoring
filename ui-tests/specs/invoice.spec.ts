import InvoicePage from "../pageobjects/invoicePage";
import {
  getTestDataFilePath,
  getUniqueVendorNamesFromJson,
  getUniqueVendorIdsFromJson,
  getUniqueInvoiceMonthsYearsByVendor,
  getBannerColorFromPercentagePriceDifference,
  getPriceDifferencePercentageFromJson,
} from "../utils/extractTestDatajson";
import { getVendorContractIdFromConfig } from "../utils/getVendorContractId";
import { waitForPageLoad } from "../helpers/waits";

describe("Invoice Page Test", async () => {
  const testDataFilePath = getTestDataFilePath();
  const vendorsNameFromJson = getUniqueVendorNamesFromJson(testDataFilePath);

  vendorsNameFromJson.forEach((vendor) => {
    it(`should display correct status banner color for each invoice of ${vendor}`, async () => {
      const vendorIds = getUniqueVendorIdsFromJson(vendor);
      for (const vendorId of vendorIds) {
        const contractId = await getVendorContractIdFromConfig(vendorId);
        const uniqueYearsMonths = getUniqueInvoiceMonthsYearsByVendor(vendor);
        for (const monthYear of uniqueYearsMonths) {
          const [year, month] = monthYear.split("-");
          const invoicePageUrl = `contracts/${contractId}/invoices/${year}-${month}`;
          console.log(invoicePageUrl);
          await InvoicePage.open(invoicePageUrl);
          await waitForPageLoad();
          expect(await browser.getUrl()).toContain(`${year}-${month}`);
          const priceDifferencePercentage =
            getPriceDifferencePercentageFromJson(year, month);
          console.log(priceDifferencePercentage);
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
});
