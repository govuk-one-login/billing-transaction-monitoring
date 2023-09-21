import { waitForPageLoad } from "../helpers/waits";
import HomePage from "../pageobjects/homepage";

/* UI tests for web application firewall. It verifies that some requests are blocked */

describe("WAF Tests", () => {
  it("Should not block requests with query parameters in general", async () => {
    await browser.url("/?foo=bar");
    await waitForPageLoad();
    expect(await HomePage.isPageHeadingDisplayed()).toBe(true);
  });

  it("Should block request with with `<script>` tag in query parameter", async () => {
    await browser.url("/?foo=<script>");
    await waitForPageLoad();
    await expect(
      async () => await HomePage.isPageHeadingDisplayed()
    ).rejects.toThrow("Element did not displayed");
  });
});
