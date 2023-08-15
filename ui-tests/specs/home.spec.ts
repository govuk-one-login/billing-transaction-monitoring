import { waitForPageLoad } from "../helpers/waits";
import HomePage from "../pageobjects/homepage";
import { getLatestInvoicePerVendor } from "../utils/extractTestDatajson";
import { prettyMonthName, quarterName } from "../utils/getPrettyMonthName";
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
    expect(await HomePage.getPageParagraphText()).toEqual(
      "Billings and reconciliation for the OneLogin programme"
    );
  });

  it("Should navigate to the Contracts page when clicked on the link", async () => {
    await HomePage.clickOnContractsPageLink();
    const newPageUrl = await browser.getUrl();
    expect(newPageUrl).toMatch(/contracts$/);
  });
});

describe("Home Page Overview table Tests", () => {
  beforeEach(async () => {
    await browser.url(" ");
    await waitForPageLoad();
  });

  it("Should display the overview table with correct data", async () => {
    const tableData = await HomePage.getTableData(await HomePage.overViewTable);
    const expectedTableDataFromJson = getLatestInvoicePerVendor().map(
      (invoice): OverviewTable => {
        const monthOrQuarterString =
          invoice.invoice_is_quarterly === "true"
            ? quarterName(invoice.month)
            : prettyMonthName(invoice.month);
        const reconciliationDetails =
          generateExpectedBannerDetailsFromPercentagePriceDifference(
            parseFloat(invoice.price_difference_percentage)
          );
        return {
          contractName: invoice.contract_name,
          vendor: invoice.vendor_name,
          period: `${monthOrQuarterString} ${invoice.year}`,
          reconciliationDetails:
            reconciliationDetails.bannerMessage.toUpperCase(),
          details: "View Invoice",
        };
      }
    );
    const sortedTableDataByVendor = tableData
      .map((data) => ({
        contractName: data["Contract name"].trim(),
        vendor: data.Vendor.trim(),
        period: data.Period.trim(),
        reconciliationDetails: data["Reconciliation status"]
          .trim()
          .toUpperCase(),
        details: data.Details.trim(),
      }))
      .sort((a, b) => a.vendor.localeCompare(b.vendor));

    const sortedExpectedData = Array.from(expectedTableDataFromJson).sort(
      (a, b) => a.vendor.localeCompare(b.vendor)
    );
    expect(sortedExpectedData).toEqual(sortedTableDataByVendor);
  });

  it(`Should navigate to the correct contract page on "Contract Name" click`, async () => {
    const firstInvoice = getLatestInvoicePerVendor().sort((a, b) =>
      a.contract_name.localeCompare(b.contract_name)
    )[0];
    await HomePage.clickOnFirstContractInTable();
    await waitForPageLoad();
    expect(await browser.getUrl()).toContain(
      `${firstInvoice.contract_id}/invoices`
    );
  });

  it(`Should navigate to the correct invoice page on "View Invoice" click`, async () => {
    const firstInvoice = getLatestInvoicePerVendor().sort((a, b) =>
      a.contract_name.localeCompare(b.contract_name)
    )[0];
    await HomePage.clickOnViewInvoiceLink();
    await waitForPageLoad();
    const expectedMonthOrQuarter =
      firstInvoice.invoice_is_quarterly === "true"
        ? quarterName(firstInvoice.month).toLowerCase()
        : firstInvoice.month;
    expect(await browser.getUrl()).toContain(
      `${firstInvoice.contract_id}/invoices/${firstInvoice.year}-${expectedMonthOrQuarter}`
    );
  });
});

export type OverviewTable = {
  contractName: string;
  vendor: string;
  period: string;
  reconciliationDetails: string;
  details: string;
};
