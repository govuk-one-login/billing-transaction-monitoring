import { waitForPageLoad } from "../helpers/waits.js";
import HomePage from "../pageobjects/home.page.js";

describe("Home Page Test", () => {
  before(async () => {
    await HomePage.open();
    console.log(browser.getUrl());
  });

  it("should display the correct page heading", async () => {
    await expect(HomePage.pageTitle).toBeExisting();
    await expect(await HomePage.pageTitle).toHaveText(
      "Digital Identity Billing Dashboard"
    );
  });

  it("should contain a welcome message", async () => {
    await expect(await HomePage.welcomeMessage).toHaveText(
      "Welcome to the dashboard!"
    );
  });

  it("should navigate to the correct link", async () => {
    await expect(await HomePage.linkToContractsPage).toBeExisting();
    await HomePage.clickOnContractsPageLink();
    const newPageUrl = await browser.getUrl();
    await waitForPageLoad(newPageUrl);
    await expect(newPageUrl).toMatch(/contracts$/);
  });
});
