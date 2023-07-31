export default class Page {
  public async open(path: string): Promise<void> {
    await browser.url(`/${path}`);
  }

  public get pageHeading(): Promise<WebdriverIO.Element> {
    return $(".govuk-heading-xl");
  }

  public get pageSubHeading(): Promise<WebdriverIO.Element> {
    return $(".govuk-heading-l");
  }

  public get cookiesFooterLink(): Promise<WebdriverIO.Element> {
    return $('a[href="/cookies"]');
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

  public async clickOnCookiesFooterLink(): Promise<void> {
    await (await this.cookiesFooterLink).click();
  }
}
