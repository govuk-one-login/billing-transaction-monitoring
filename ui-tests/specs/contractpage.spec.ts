import ContractPage from "../pageobjects/contractpage.js";
import { configStackName } from "../../src/handlers/int-test-support/helpers/envHelper.js";
import { getVendorNames } from "../helpers/getvendorserviceConfig.js";
import { waitForPageLoad } from "../helpers/waits.js";

describe("Contract Page Test", () => {
  let csvVendorNames: string[];

  before(async () => {
    const config = configStackName();
    csvVendorNames = await getVendorNames(config, {});
    console.log("This is from csv:", csvVendorNames);
    await ContractPage.open("contracts");
    await waitForPageLoad();
  });

  it("ui list of vendors should match with vendor names from config", async () => {
    const listOfContractsFromUI = await ContractPage.getListOfContractsText();
    const vendorNamesArray = extractOnlyVendorNames(listOfContractsFromUI);
    expect(vendorNamesArray.sort()).toEqual(csvVendorNames.sort());
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
