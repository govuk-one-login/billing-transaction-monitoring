import ContractPage from "../pageobjects/contractpage.js";
import { configStackName } from "../../src/handlers/int-test-support/helpers/envHelper.js";
import { getVendorNames } from "../helpers/getvendorserviceConfig.js";
import { waitForPageLoad } from "../helpers/waits.js";
import {
  getTestDataFilePath,
  getUniqueVendorNamesFromJson,
} from "../helpers/extractDetailsTestDatajson.js";

describe("Contract Page Test", () => {
  let csvVendorNames: string[];
  let uiContractNames: string[] = [];
  let uiVendorNamesArray: string[];
  let uniqueVendorNamesFromUI: string[];
  let vendorNamesFromTestDataFile: string[] = [];
  const testDataFilePath = getTestDataFilePath();
  vendorNamesFromTestDataFile = getUniqueVendorNamesFromJson(testDataFilePath);

  before(async () => {
    const config = configStackName();
    csvVendorNames = await getVendorNames(config, {});
    console.log("This is from csv:", csvVendorNames);
    uiVendorNamesArray = extractOnlyVendorNames(uiContractNames);
    uniqueVendorNamesFromUI = [...new Set(uiVendorNamesArray)];
    await ContractPage.open("contracts");
    await waitForPageLoad();
    uiContractNames = await ContractPage.getListOfContractsText();
  });

  it.only("ui list of vendors should match with vendor names from config", async () => {
    expect(uniqueVendorNamesFromUI.sort()).toEqual(csvVendorNames.sort());
  });

  it("ui list of vendors should match with vendor names in test data file", async () => {
    expect(vendorNamesFromTestDataFile.sort()).toEqual(
      uniqueVendorNamesFromUI.sort()
    );
  });

  vendorNamesFromTestDataFile.sort().forEach((vendor) => {
    it(`should navigate to the vendor details page for ${vendor}`, async () => {
      await ContractPage.open("contracts");
      await waitForPageLoad();
      await ContractPage.clickContractByVendorName(vendor);
      await waitForPageLoad();
      const pageTitle = await browser.getTitle();
      expect(pageTitle.includes(`${vendor}`)).toBe(true);
    });
  });
});

const extractOnlyVendorNames = (uiContractNames: string[]): string[] => {
  const vendorNamesArray: string[] = [];
  uiContractNames.forEach((item) => {
    const vendorNames = item.split("\n");
    vendorNames.forEach((vendor) => {
      const vendorNameMatch = vendor.match(/-([^]+)/);
      if (vendorNameMatch) {
        const vendorName = vendorNameMatch[1].trim();
        vendorNamesArray.push(vendorName);
      }
    });
  });
  return vendorNamesArray;
};
