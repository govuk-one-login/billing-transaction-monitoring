import Page from "./page";

class InvoicePage extends Page {
  /**
   * define selectors using getter methods
   */
  public get statusBanner(): Promise<WebdriverIO.Element> {
    return $(
      ".govuk-panel.warning, .govuk-panel.notice, .govuk-panel.payable, .govuk-panel.error"
    );
  }

  public get statusBannerTitle(): Promise<WebdriverIO.Element> {
    return $("h1.govuk-panel__title");
  }

  public get statusBannerBody(): Promise<WebdriverIO.Element> {
    return $("govuk-panel__body");
  }

  public async getStatusBannerColor(): Promise<string> {
    const statusBannerElement = await this.statusBanner;
    await statusBannerElement.waitForDisplayed();
    const color = await statusBannerElement.getCSSProperty("background-color");
    return color.parsed.hex ?? "";
  }
}

export default new InvoicePage();
