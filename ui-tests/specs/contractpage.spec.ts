import ContractPage from "../pageobjects/contractpage.js";
import { configStackName } from "../../src/handlers/int-test-support/helpers/envHelper.js";
import { uniqueVendorNamesFromConfig } from "../helpers/getvendorserviceConfig.js";
import { waitForPageLoad } from "../helpers/waits.js";
import {
  getTestDataFilePath,
  getUniqueVendorNamesFromJson,
} from "../helpers/extractDetailsTestDatajson.js";

describe("Contract Page Test", () => {
  let csvVendorNames: string[];
  let uiUniqueVendorNames: string[];
  let jsonVendorNames: string[] = [];

  before(async () => {
    const config = configStackName();
    csvVendorNames = await uniqueVendorNamesFromConfig(config, {});
    const testDataFilePath = getTestDataFilePath();
    jsonVendorNames = getUniqueVendorNamesFromJson(testDataFilePath);
  });

  beforeEach(async () => {
    await ContractPage.open("contracts");
    await waitForPageLoad();
    const uiContractAndVendorNames =
      await ContractPage.getListOfContractsText();
    const uiVendorNames = extractOnlyVendorNames(uiContractAndVendorNames);
    uiUniqueVendorNames = [...new Set(uiVendorNames)];
  });

  it("UI list of vendors should match with vendor names from config", async () => {
    expect(uiUniqueVendorNames.sort()).toEqual(csvVendorNames.sort());
  });

  it("UI list of vendors should match with vendor names in test data file", async () => {
    expect(jsonVendorNames.sort()).toEqual(uiUniqueVendorNames.sort());
  });

  jsonVendorNames.sort().forEach((vendor) => {
    it(`Should navigate to the vendor details page for ${vendor}`, async () => {
      await ContractPage.clickContractByVendorName(vendor);
      await waitForPageLoad();
      const pageTitle = await browser.getTitle();
      expect(pageTitle.includes(`${vendor}`)).toBe(true);
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
