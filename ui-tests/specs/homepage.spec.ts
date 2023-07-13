import HomePage from "../pageobjects//homepage.js";

describe.skip("Home Page Test", () => {
  before(async () => {
    await browser.url(" ");
    expect(await HomePage.isPageHeadingDisplayed()).toBe(true);
  });

  it("should display the correct page heading", async () => {
    expect(await HomePage.getPageHeadingText()).toEqual(
      "Billings and reconciliation"
    );
  });

  it("should display the correct page sub heading", async () => {
    expect(await HomePage.getPageSubHeadingText()).toEqual(
      "Billings and reconciliation for the OneLogin programme"
    );
  });

  it("should navigate to the correct link", async () => {
    await HomePage.clickOnContractsPageLink();
    const newPageUrl = await browser.getUrl();
    expect(newPageUrl).toMatch(/contracts$/);
  });
});
