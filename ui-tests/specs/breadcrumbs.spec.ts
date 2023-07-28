import { waitForPageLoad } from "../helpers/waits";
import HomePage from "../pageobjects/homepage";
import InvoicePage from "../pageobjects/invoicePage";
import InvoicesListPage from "../pageobjects/invoicesListPage";
import ContractsPage from "../pageobjects/contractsPage";

describe("Breadcrumbs Tests", () => {
  before(async () => {
    await browser.url(" ");
    await waitForPageLoad();
  });

  it("Should display correct breadcrumbs", async () => {
    let breadcrumbs = await HomePage.getBreadcrumbs();
    expect(breadcrumbs.length).toBe(0);
    await HomePage.clickOnViewInvoiceLink();
    breadcrumbs = await HomePage.getBreadcrumbs();
    expect(breadcrumbs.length).toBe(3);
    await InvoicePage.clickOnInvoiceBreadcrumbsLink();
    await waitForPageLoad();
    breadcrumbs = await InvoicesListPage.getBreadcrumbs();
    expect(breadcrumbs.length).toBe(2);
    await InvoicesListPage.clickOnContractsBreadcrumbsLink();
    await waitForPageLoad();
    breadcrumbs = await ContractsPage.getBreadcrumbs();
    expect(breadcrumbs.length).toBe(1);
  });
});
