import { waitForPageLoad } from "../helpers/waits.js";
import VendorPage from "../pageobjects/vendorPage.js";
import {
  getUniqueInvoiceMonthsYearsByVendor,
  getTestDataFilePath,
  getUniqueVendorNamesFromJson,
} from "../helpers/extractDetailsTestDatajson.js";

before(async () => {
  await VendorPage.open("contracts/1/invoices");
  await waitForPageLoad();
});

describe("Vendor Details Page", () => {
  it("should display the correct vendor name", async () => {
    const vendorName = await VendorPage.getPageSubHeadingText();
    expect(vendorName).toBe("C01234 - Vendor One");
  });

  it("should navigate to the Invoice Details page when an invoice is clicked", async () => {
    await VendorPage.clickInvoice();
    const invoiceDetailsPageUrl = await browser.getUrl();
    expect(invoiceDetailsPageUrl).toContain("invoices/2023-01");
  });
});

enum VendorNameContractIdMap {
  "Vendor One" = 1,
  "Vendor Two" = 2,
  "Vendor Three" = 3,
  "Vendor Four" = 4,
  "Vendor Five" = 5,
}

describe("getUniqueInvoiceCountByVendor", () => {
  const testDataFilePath = getTestDataFilePath();
  const vendors = getUniqueVendorNamesFromJson(testDataFilePath);
  vendors.forEach((vendor) => {
    it(`should return the correct unique invoice count for ${vendor}`, async () => {
      const uniqueInvoiceCount = getUniqueInvoiceMonthsYearsByVendor(vendor);
      const vendorContractId =
        VendorNameContractIdMap[vendor as keyof typeof VendorNameContractIdMap];
      await VendorPage.open(`contracts/${vendorContractId}/invoices`);
      await waitForPageLoad();
      const invoiceCountFromUI = await VendorPage.getInvoiceCount();
      expect(uniqueInvoiceCount).toEqual(invoiceCountFromUI);
    });
  });
});
