import { configStackName } from "../../src/handlers/int-test-support/helpers/envHelper";
import { getVendorServiceConfigRows } from "../../src/handlers/int-test-support/config-utils/get-vendor-service-config-rows";
import ContractPage from "../pageobjects/contract.page";

describe.only("Contract Page Tests", () => {
  before(async () => {
    await ContractPage.open("/contracts");
    console.log(await browser.getUrl());
  });

  it("should display the correct page heading", async () => {
    await expect(ContractPage.pageTitleIsDisplayed()).toBe(true);
    const configBucket = configStackName();
    const csvData = await getVendorServiceConfigRows(configBucket, {});
    /* const expectedItems = ['C01234 - Vendor One',
         'C01235 - Vendor Two',
         'C01236 - Vendor Three',
     'FOOBAR1 - Vendor Four',
   'FOOBAR2 - Vendor Five'] */
    const listItems = (await ContractPage.getListOfContractsText()).map(
      (item) => item.trim()
    );
    expect(csvData).toEqual(listItems);
  });
});
