import ContractsPage from "../pageobjects/contractsPage";
import { waitForPageLoad } from "../helpers/waits";
import {
  getTestDataFilePath,
  getUniqueVendorNamesFromJson,
} from "../utils/extractTestDatajson";

/* UI tests for Contracts Page. It verifies the UI list of vendors 
matches the vendor name in test data file.
Also tests the navigation to the invoices list page for each vendor */

describe("Contracts Page Test", () => {
  const testDataFilePath = getTestDataFilePath();
  const jsonVendorNames = getUniqueVendorNamesFromJson(testDataFilePath);
  let uiContractAndVendorNames: string[];

  beforeEach(async () => {
    await ContractsPage.open("contracts");
    await waitForPageLoad();
    uiContractAndVendorNames = await ContractsPage.getListOfContractsText();
  });

  it("UI list of vendors should match with vendor names in test data file", () => {
    const sortedJsonVendorNames = Array.from(jsonVendorNames).sort((a, b) =>
      a.localeCompare(b)
    );

    // Expecting at least one UI vendor name to include vendor from  JSON
    sortedJsonVendorNames.forEach((vendor) => {
      expect(
        uiContractAndVendorNames.some((uiVendor) => uiVendor.includes(vendor))
      ).toBeTruthy();
    });
  });

  const sortedJsonVendorNames = Array.from(jsonVendorNames).sort((a, b) =>
    a.localeCompare(b)
  );
  sortedJsonVendorNames.forEach((vendor) => {
    it(`Should navigate to the invoice list page for ${vendor}`, async () => {
      await ContractsPage.clickContractByVendorName(vendor);
      await waitForPageLoad();
      const pageTitle = await browser.getTitle();
      expect(pageTitle).toContain(vendor);
    });
  });
});
