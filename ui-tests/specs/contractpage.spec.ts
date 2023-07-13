import ContractPage from "../pageobjects/contractpage.js";
import { configStackName } from "../../src/handlers/int-test-support/helpers/envHelper.js";
import { getVendorNames } from "../helpers/getvendorserviceConfig.js";
import { waitForPageLoad } from "../helpers/waits.js";
import { getUniqueVendorNamesFromJson } from "../helpers/extractDetailsTestDatajson.js";
import path, { dirname } from "path";
import { fileURLToPath } from "url";

describe("Contract Page Test", () => {
  let csvVendorNames: string[];
  let listOfContractsFromUI: string[];

  before(async () => {
    const config = configStackName();
    csvVendorNames = await getVendorNames(config, {});
    console.log("This is from csv:", csvVendorNames);
    await ContractPage.open("contracts");
    await waitForPageLoad();
    listOfContractsFromUI = await ContractPage.getListOfContractsText();
  });

  it("ui list of vendors should match with vendor names from config", async () => {
    const vendorNamesArray = extractOnlyVendorNames(listOfContractsFromUI);
    expect(vendorNamesArray.sort()).toEqual(csvVendorNames.sort());
  });

  it("ui list of vendors should match with vendor names in test data file", async () => {
    const vendorNamesArray = extractOnlyVendorNames(listOfContractsFromUI);
    const uniqueVendorNamesFromUI = [...new Set(vendorNamesArray)];
    const currentFilePath = fileURLToPath(import.meta.url);
    const currentDirPath = dirname(currentFilePath);
    const testDataFilePath = path.join(
      currentDirPath,
      "../testData/testData.json"
    );
    const vendorNamesFromTestDataFile =
      getUniqueVendorNamesFromJson(testDataFilePath);
    expect(vendorNamesFromTestDataFile.sort()).toEqual(
      uniqueVendorNamesFromUI.sort()
    );
  });

  it("should navigate to the vendor details page when a vendor name is selected", async () => {
    await ContractPage.clickVendorName();
    const vendorDetailsPageUrl = await browser.getUrl();
    expect(vendorDetailsPageUrl).toContain("contracts/1/invoices");
    const pageTitle = await browser.getTitle();
    expect(pageTitle).toBe("C01234 - Vendor One - Billings and Reconciliation");
  });
});

const extractOnlyVendorNames = (listOfContractFromUI: string[]): string[] => {
  const vendorNamesArray: string[] = [];
  listOfContractFromUI.forEach((item) => {
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
