import { waitForPageLoad } from "../helpers/waits.js";
import HomePage from "../pageobjects/homePage.js";

describe("Home Page Tests", () => {
  before(async () => {
    await browser.url(" ");
    await waitForPageLoad();
  });

  it("should display 'Billings and reconciliation' as the heading", async () => {
    expect(await HomePage.isPageHeadingDisplayed()).toBe(true);
    expect(await HomePage.getPageHeadingText()).toEqual(
      "Billings and reconciliation"
    );
  });

  it("should display 'Billings and reconciliation for the OneLogin programme' as the page sub heading", async () => {
    expect(await HomePage.getPageSubHeadingText()).toEqual(
      "Billings and reconciliation for the OneLogin programme"
    );
  });

  it("should navigate to the Contracts page when clicked on the link", async () => {
    await HomePage.clickOnContractsPageLink();
    const newPageUrl = await browser.getUrl();
    expect(newPageUrl).toMatch(/contracts$/);
  });
});
