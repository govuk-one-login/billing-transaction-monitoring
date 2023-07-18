import { waitForPageLoad } from "../helpers/waits.js";
import InvoicesListPage from "../pageobjects/invoicesListPage.js";
import {
  getUniqueInvoiceMonthsYearsByVendor,
  getTestDataFilePath,
  getUniqueVendorNamesFromJson,
} from "../utils/extractTestDatajson.js";

/* UI tests for Invoices List Page. It verifies that the correct vendor name is displayed on the page.
It includes tests to ensure that the unique invoice count for each vendor matches the count obtained from the UI */

describe("InvoicesList Page", () => {
  enum VendorNameContractIdMap {
    "Vendor One" = 1,
    "Vendor Two" = 2,
    "Vendor Three" = 3,
    "Vendor Four" = 4,
    "Vendor Five" = 5,
  }

  const testDataFilePath = getTestDataFilePath();
  const vendorsNameFromJson = getUniqueVendorNamesFromJson(testDataFilePath);
  
  vendorsNameFromJson.forEach((vendor)=> {
  it(`should display the correct vendor name for ${vendor}`, async () => {
    const vendorContractId = VendorNameContractIdMap[vendor as keyof typeof VendorNameContractIdMap]
    await InvoicesListPage.open(`contracts/${vendorContractId}/invoices`)
    await waitForPageLoad()
    const uiVendorName = await InvoicesListPage.getPageSubHeadingText();
    expect(uiVendorName).toContain(`${vendor}`);
  });

  vendorsNameFromJson.forEach((vendor) => {
    it(`should return the correct unique invoice count for ${vendor}`, async () => {
      const uniqueInvoiceCount = getUniqueInvoiceMonthsYearsByVendor(vendor);
      const vendorContractId =
        VendorNameContractIdMap[vendor as keyof typeof VendorNameContractIdMap];
      await InvoicesListPage.open(`contracts/${vendorContractId}/invoices`);
      await waitForPageLoad();
      const invoiceCountFromUI = await InvoicesListPage.getInvoiceCount();
      expect(uniqueInvoiceCount).toEqual(invoiceCountFromUI);
    });
  });
});
})