import Page from "./page";

class HomePage extends Page {
  /**
   * define selectors using getter methods
   */

  public get welcomeMessage(): Promise<WebdriverIO.Element> {
    return $("p.govuk-body");
  }

  public get overViewTable(): Promise<WebdriverIO.Element> {
    return $("caption*=Overview").parentElement();
  }

  public get contractsLink(): Promise<WebdriverIO.Element> {
    return $('a[href$="/contracts"]');
  }

  public get viewInvoiceLink(): Promise<WebdriverIO.Element> {
    return $("=View Invoice");
  }

  public get overviewTableFirstContractLink(): Promise<WebdriverIO.Element> {
    return $('a[href*="/contracts/1/invoices"]');
  }

  public async clickOnContractsPageLink(): Promise<void> {
    await (await this.contractsLink).click();
  }

  public async clickOnViewInvoiceLink(): Promise<void> {
    await (await this.viewInvoiceLink).click();
  }

  public async clickOnFirstContractInTable(): Promise<void> {
    await (await this.overviewTableFirstContractLink).click();
  }
}

export default new HomePage();
