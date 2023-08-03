import { waitForPageLoad } from "../helpers/waits";
import HomePage from "../pageobjects/homepage";

describe("Footer Tests", () => {
  before(async () => {
    await browser.url(" ");
    await waitForPageLoad();
  });

  it("Should navigate to the Cookies page when clicked on the footer cookies link", async () => {
    await HomePage.clickOnCookiesFooterLink();
    expect(await browser.getUrl()).toContain("cookies");
    expect(await HomePage.isPageSubHeadingDisplayed()).toBe(true);
    expect(await HomePage.getPageSubHeadingText()).toEqual("Cookies");
  });
});
