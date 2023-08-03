import Page from "./page";

class InvoicesListPage extends Page {
  public get invoicesList(): Promise<WebdriverIO.Element[]> {
    return $$("ul.govuk-list li");
  }

  public get contractsBreadcrumbsLink(): Promise<WebdriverIO.Element> {
    return $('a[href$="/contracts"]');
  }

  public async getInvoiceCount(): Promise<number> {
    const elementArray = this.invoicesList;
    const length = (await elementArray).length;
    return length;
  }

  public async clickOnContractsBreadcrumbsLink(): Promise<void> {
    await (await this.contractsBreadcrumbsLink).click();
  }
}

export default new InvoicesListPage();
