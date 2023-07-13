import { ChainablePromiseElement } from "webdriverio";

/**
 * main page object containing all methods, selectors and functionality
 * that is shared across all page objects
 */
export default class Page {
  public async open(path: string): Promise<void> {
    await browser.url(`/${path}`);
  }

  public get pageHeading(): ChainablePromiseElement<WebdriverIO.Element> {
    return $(".govuk-heading-xl");
  }

  public get pageSubHeading(): ChainablePromiseElement<WebdriverIO.Element> {
    return $(".govuk-heading-l");
  }

  public async isPageHeadingDisplayed(): Promise<boolean> {
    return await (await this.pageHeading).isDisplayed();
  }

  public async getPageHeadingText(): Promise<string> {
    return await (await this.pageHeading).getText();
  }

  public async isPageSubHeadingDisplayed(): Promise<boolean> {
    return await (await this.pageSubHeading).isDisplayed();
  }

  public async getPageSubHeadingText(): Promise<string> {
    return await (await this.pageSubHeading).getText();
  }
}
