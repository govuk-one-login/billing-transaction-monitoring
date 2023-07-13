import { waitForPageLoad } from "../helpers/waits.js";
import VendorPage from "../pageobjects/vendorPage.js";
import {
  getExtractDataFromJson,
  getUniqueInvoiceMonthsYearsByVendor,
} from "../helpers/extractDetailsTestDatajson.js";
import path, { dirname } from "path";
import { fileURLToPath } from "url";

before(async () => {
  await VendorPage.open("contracts/1/invoices");
  await waitForPageLoad();
});

describe("Vendor Details Page", () => {
  it("should display the correct vendor name", async () => {
    const vendorName = await VendorPage.getPageSubHeadingText();
    expect(vendorName).toBe("C01234 - Vendor One");
  });

  it("should match the number of invoices from JSON with the UI", async () => {
    const invoiceCountFromUI = await VendorPage.getInvoicesCount();
    const expectedInvoiceCount =
      getUniqueInvoiceMonthsYearsByVendor("Vendor One");
    expect(invoiceCountFromUI).toBe(expectedInvoiceCount);
  });

  it("should navigate to the Invoice Details page when an invoice is clicked", async () => {
    await VendorPage.clickInvoice();
    const invoiceDetailsPageUrl = await browser.getUrl();
    expect(invoiceDetailsPageUrl).toContain("invoices/2023-01");
  });
});

describe.only("getUniqueInvoiceCountByVendor", () => {
  const currentFilePath = fileURLToPath(import.meta.url);
  const currentDirPath = dirname(currentFilePath);
  const testDataFilePath = path.join(
    currentDirPath,
    "../testData/testData.json"
  );
  const vendors = getExtractDataFromJson(testDataFilePath);
  vendors.data.forEach((vendor) => {
    it(`should return the correct unique invoice count for ${vendor.vendor_name}`, async () => {
      const uniqueInvoiceCount = getUniqueInvoiceMonthsYearsByVendor(
        vendor.vendor_name
      );
      console.log(uniqueInvoiceCount);
    });
  });
});
