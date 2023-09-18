import Page from "./page";
import { waitForElementDisplayed } from "../helpers/waits";

class InvoicePage extends Page {
  /**
   * define selectors using getter methods
   */
  public get statusBanner(): Promise<WebdriverIO.Element> {
    return $(".govuk-panel");
  }

  public get statusBannerTitle(): Promise<WebdriverIO.Element> {
    return $("h2.govuk-panel__title");
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
    const statusBannerTitleElement = await this.statusBannerTitle;
    await waitForElementDisplayed(statusBannerTitleElement);
    return await (await this.statusBannerTitle).getText();
  }

  public async waitForColorToMatch(
    element: WebdriverIO.Element,
    expectedColor: string,
    timeout: number = 5000
  ): Promise<string> {
    let actualColor = "";
    await browser.waitUntil(
      async () => {
        const color = await element.getCSSProperty("background-color");
        actualColor = color.parsed.hex ?? "";
        return actualColor === expectedColor;
      },
      {
        timeout,
        timeoutMsg: `Expected banner color to be ${expectedColor} but it did not appear within ${timeout}ms`,
      }
    );
    return actualColor;
  }

  public async getStatusBannerColor(
    expectedColor: string,
    timeout: number = 5000
  ): Promise<string> {
    const statusBannerElement = await this.statusBanner;
    await waitForElementDisplayed(statusBannerElement);
    return await this.waitForColorToMatch(
      statusBannerElement,
      expectedColor,
      timeout
    );
  }

  public async clickOnInvoiceBreadcrumbsLink(): Promise<void> {
    await waitForElementDisplayed(await this.invoiceBreadcrumbsLink);
    await (await this.invoiceBreadcrumbsLink).click();
  }
}

export default new InvoicePage();
