import Page from "./page";

class InvoicePage extends Page {
  /**
   * define selectors using getter methods
   */
  public get statusBanner(): Promise<WebdriverIO.Element> {
    return $(".govuk-panel");
  }

  public get statusBannerTitle(): Promise<WebdriverIO.Element> {
    return $("h1.govuk-panel__title");
  }

  public get statusBannerBody(): Promise<WebdriverIO.Element> {
    return $("govuk-panel__body");
  }

  public get reconciliationTable(): Promise<WebdriverIO.Element> {
    return $("caption*=Reconciliation").parentElement();
  }

  public get quantityTable(): Promise<WebdriverIO.Element> {
    return $("caption*=Quantity (events)").parentElement();
  }

  public get priceTable(): Promise<WebdriverIO.Element> {
    return $("caption*=Price").parentElement();
  }

  public get measuredTable(): Promise<WebdriverIO.Element> {
    return $("caption*=Measured (events)").parentElement();
  }

  public get invoiceTable(): Promise<WebdriverIO.Element> {
    return $("caption*=Invoice").parentElement();
  }

  public get invoiceBreadcrumbsLink(): Promise<WebdriverIO.Element> {
    return $('a[href$="/invoices"]');
  }

  public async getStatusBannerTitle(): Promise<string> {
    await (await this.statusBannerTitle).isDisplayed();
    return await (await this.statusBannerTitle).getText();
  }

  public async getStatusBannerColor(): Promise<string> {
    const statusBannerElement = await this.statusBanner;
    await statusBannerElement.waitForDisplayed();
    const color = await statusBannerElement.getCSSProperty("background-color");
    return color.parsed.hex ?? "";
  }

  public async clickOnInvoiceBreadcrumbsLink(): Promise<void> {
    await (await this.invoiceBreadcrumbsLink).click();
  }
}

export default new InvoicePage();
