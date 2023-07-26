import { waitForPageLoad } from "../helpers/waits";
import InvoicesListPage from "../pageobjects/invoicesListPage";
import {
  getTestDataFilePath,
  getUniqueInvoiceMonthsYearsByVendor,
  getUniqueVendorIdsFromJson,
  getUniqueVendorNamesFromJson,
} from "../utils/extractTestDatajson";
import { getVendorContractIdFromConfig } from "../utils/getVendorContractId";

/* UI tests for Invoices List Page. It verifies that the correct vendor name is displayed on the page.
It includes tests to ensure that the unique invoice count for each vendor matches the count obtained from the UI */

describe("InvoicesList Page", () => {
  const testDataFilePath = getTestDataFilePath();
  const vendorsNameFromJson = getUniqueVendorNamesFromJson(testDataFilePath);
  vendorsNameFromJson.forEach((vendor) => {
    it(`should display the correct vendor name for ${vendor}`, async () => {
      const vendorIds = getUniqueVendorIdsFromJson(vendor);
      for (const vendorId of vendorIds) {
        const contractId = await getVendorContractIdFromConfig(vendorId);
        await InvoicesListPage.open(`contracts/${contractId}/invoices`);
        await waitForPageLoad();
        const uiVendorName = await InvoicesListPage.getPageSubHeadingText();
        expect(uiVendorName).toContain(`${vendor}`);
      }
    });
  });

  vendorsNameFromJson.forEach((vendor) => {
    it(`should return the correct unique invoice count for ${vendor}`, async () => {
      const { count } = getUniqueInvoiceMonthsYearsByVendor(vendor);
      const vendorIds = getUniqueVendorIdsFromJson(vendor);
      for (const vendorId of vendorIds) {
        const contractId = await getVendorContractIdFromConfig(vendorId);
        await InvoicesListPage.open(`contracts/${contractId}/invoices`);
        await waitForPageLoad();
        const invoiceCountFromUI = await InvoicesListPage.getInvoiceCount();
        expect(count).toEqual(invoiceCountFromUI);
      }
    });
  });
});
