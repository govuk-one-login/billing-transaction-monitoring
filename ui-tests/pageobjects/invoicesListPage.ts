import Page from "./page";

class VendorPage extends Page {
  public get invoicesList(): Promise<WebdriverIO.Element[]> {
    return $$("ul.govuk-list li");
  }

  public async getInvoiceCount(): Promise<number> {
    const elementArray = this.invoicesList;
    const length = (await elementArray).length;
    return length;
  }

  public get invoiceLinkByIndex(): Promise<WebdriverIO.Element> {
    return $('a[href$="/contracts/1/invoices/2023-01"]');
  }

  public async clickInvoice(): Promise<void> {
    await (await this.invoiceLinkByIndex).click();
  }
}

export default new VendorPage();
