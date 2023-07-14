import ContractsPage from "../pageobjects/contractsPage.js";
import { waitForPageLoad } from "../helpers/waits.js";
import {
  getTestDataFilePath,
  getUniqueVendorNamesFromJson,
} from "../helpers/extractDetailsTestDatajson.js";

describe("Contracts Page Test", () => {
  it("UI list of vendors should match with vendor names in test data file", async () => {
    await ContractsPage.open("contracts");
    await waitForPageLoad();
    const testDataFilePath = getTestDataFilePath();
    const jsonVendorNames = getUniqueVendorNamesFromJson(testDataFilePath);
    const uiContractAndVendorNames =
      await ContractsPage.getListOfContractsText();
    const uiVendorNames = extractOnlyVendorNames(uiContractAndVendorNames);
    const uiUniqueVendorNames = [...new Set(uiVendorNames)];
    expect(jsonVendorNames.sort()).toEqual(uiUniqueVendorNames.sort());
  });

  const testDataFilePath = getTestDataFilePath();
  const jsonVendorNames = getUniqueVendorNamesFromJson(testDataFilePath);
  jsonVendorNames.sort().forEach((vendor) => {
    it("Should navigate to the invoice list page for vendor", async () => {
      await ContractsPage.open("contracts");
      await waitForPageLoad();
      await ContractsPage.clickContractByVendorName(vendor);
      await waitForPageLoad();
      const pageTitle = await browser.getTitle();
      expect(pageTitle).toContain(vendor);
    });
  });
});

const extractOnlyVendorNames = (
  uiContractAndVendorNames: string[]
): string[] => {
  const vendorNamesArray: string[] = [];
  uiContractAndVendorNames.forEach((item: string) => {
    const vendorNames = item.match(/-([^]+)/);
    if (vendorNames) {
      vendorNames.forEach((vendor: string) => {
        const vendorName = vendor.replace(/- /, "").trim();
        vendorNamesArray.push(vendorName);
      });
    }
  });
  return vendorNamesArray;
};
