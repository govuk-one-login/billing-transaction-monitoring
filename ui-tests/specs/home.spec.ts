import { waitForPageLoad } from "../helpers/waits";
import HomePage from "../pageobjects/homepage";
import { getLatestInvoicePerVendor } from "../utils/extractTestDatajson";
import { prettyMonthName } from "../utils/getPrettyMonthName";
import { generateExpectedBannerDetailsFromPercentagePriceDifference } from "../utils/generateExpectedStatusBannerDetails";

/* UI tests for Home Page. It verifies the page displays the correct heading and subheading.
It also tests the navigation to the contract list page when the link is clicked */

describe("Home Page Tests", () => {
  before(async () => {
    await browser.url(" ");
    await waitForPageLoad();
  });

  it("Should display 'Billings and reconciliation' as the heading", async () => {
    expect(await HomePage.isPageHeadingDisplayed()).toBe(true);
    expect(await HomePage.getPageHeadingText()).toEqual(
      "Billings and reconciliation"
    );
  });

  it("Should display 'Billings and reconciliation for the OneLogin programme' as the page sub heading", async () => {
    expect(await HomePage.getPageSubHeadingText()).toEqual(
      "Billings and reconciliation for the OneLogin programme"
    );
  });

  it("Should display the overview table with correct data", async () => {
    const tableData = await HomePage.getTableData(await HomePage.overViewTable);
    const expectedTableDataFromJson = getLatestInvoicePerVendor().map(
      (invoice): OverviewTable => {
        const monthString = prettyMonthName(invoice.month);
        const reconciliationDetails =
          generateExpectedBannerDetailsFromPercentagePriceDifference(
            parseFloat(invoice.price_difference_percentage)
          );
        return {
          "Contract Name": invoice.contract_name,
          Vendor: invoice.vendor_name,
          Month: `${monthString} ${invoice.year}`,
          "Reconciliation Details":
            reconciliationDetails.bannerMessage.toUpperCase(),
          Details: "View Invoice",
        };
      }
    );
    const sortedTableData = tableData.sort((a, b) =>
      a.Vendor.localeCompare(b.Vendor)
    );
    const sortedExpectedData = expectedTableDataFromJson.sort((a, b) =>
      a.Vendor.localeCompare(b.Vendor)
    );
    expect(sortedExpectedData).toEqual(sortedTableData);
  });

  it("Should navigate to the Contracts page when clicked on the link", async () => {
    await HomePage.clickOnContractsPageLink();
    const newPageUrl = await browser.getUrl();
    expect(newPageUrl).toMatch(/contracts$/);
  });
});

export type OverviewTable = {
  "Contract Name": string;
  Vendor: string;
  Month: string;
  "Reconciliation Details": string;
  Details: string;
};
