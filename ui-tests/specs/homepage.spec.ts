import HomePage from "../pageobjects/home.page.js";

describe.skip("Home Page Test", () => {
  before(async () => {
    await browser.url("");
    expect(await HomePage.pageTitleIsDisplayed()).toBe(true);
  });

  it("should display the correct page heading", async () => {
    expect(await HomePage.getPageTitleText()).toEqual(
      "Digital Identity Billing Dashboard"
    );
  });

  it("should contain a welcome message", async () => {
    expect(await HomePage.getWelcomeMessageText()).toEqual(
      "Welcome to the dashboard!"
    );
  });

  it("should navigate to the correct link", async () => {
    await HomePage.clickOnContractsPageLink();
    const newPageUrl = await browser.getUrl();
    expect(newPageUrl).toMatch(/contracts$/);
  });
});
