import ContractPage from "../pageobjects/contractpage.js";
import { configStackName } from "../../src/handlers/int-test-support/helpers/envHelper.js";
import { getVendorNames } from "../helpers/getvendorserviceConfig.js";
import { waitForPageLoad } from "../helpers/waits.js";

describe("Contract Page Test", () => {
  it("ui list of vendors should match with vendor names from config", async () => {
    await ContractPage.open("contracts");
    console.log(await browser.getUrl());
    const config = configStackName();
    const csvVendorNames = await getVendorNames(config, {});
    console.log("This is from csv:", csvVendorNames);
    await waitForPageLoad();
    const uiVendorNames = (await ContractPage.getListOfContractsText()).map(
      (item) => item.split(" - ")[1]
    );
    const sortedCsvVendorNames = csvVendorNames.sort();
    const sortedUiVendorNames = uiVendorNames.sort();
    console.log(sortedCsvVendorNames);
    console.log(sortedUiVendorNames);
    expect(sortedUiVendorNames).toEqual(sortedCsvVendorNames);
  });
});
