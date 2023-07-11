import { ChainablePromiseElement } from "webdriverio";

/**
 * main page object containing all methods, selectors and functionality
 * that is shared across all page objects
 */
export default class Page {
  public async open(path: string): Promise<void> {
    await browser.url(`/${path}`);
  }

  public get pageTitle(): ChainablePromiseElement<WebdriverIO.Element> {
    return $("h1.govuk-heading-l");
  }

  public async pageTitleIsDisplayed(): Promise<boolean> {
    return await (await this.pageTitle).isDisplayed();
  }

  public async getPageTitleText(): Promise<string> {
    return await (await this.pageTitle).getText();
  }
}
