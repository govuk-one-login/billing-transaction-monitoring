import { waitForPageLoad } from "../helpers/waits";
import HomePage from "../pageobjects/homepage";
import InvoicePage from "../pageobjects/invoicePage";
import InvoicesListPage from "../pageobjects/invoicesListPage";
import Page from "../pageobjects/page";

const checkBreadcrumbsCount = async (
  page: Page,
  expectedCount: number
): Promise<void> => {
  const breadcrumbs = await page.getBreadcrumbs();
  expect(breadcrumbs.length).toBe(expectedCount);
};

describe("Breadcrumbs Tests", () => {
  before(async () => {
    await browser.url(" ");
    await waitForPageLoad();
  });

  it("Should display correct breadcrumbs", async () => {
    await checkBreadcrumbsCount(HomePage, 0);
    await HomePage.clickOnViewInvoiceLink();
    await checkBreadcrumbsCount(HomePage, 3);

    await InvoicePage.clickOnInvoiceBreadcrumbsLink();
    await waitForPageLoad();
    await checkBreadcrumbsCount(InvoicesListPage, 2);

    await InvoicesListPage.clickOnContractsBreadcrumbsLink();
    await waitForPageLoad();
    await checkBreadcrumbsCount(InvoicesListPage, 1);
  });
});
