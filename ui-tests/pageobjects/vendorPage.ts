import { ChainablePromiseElement, ElementArray } from "webdriverio";
import Page from "./page.js";

class VendorPage extends Page {
  public get listOfInvoices(): ElementArray {
    return $$("ul.govuk-list li");
  }

  public async getInvoicesCount(): Promise<number> {
    const elementArray = this.listOfInvoices;
    const length = elementArray.length;
    return length;
  }

  public get invoiceNameByIndex(): ChainablePromiseElement<WebdriverIO.Element> {
    return $('a[href$="/contracts/1/invoices/2023-01"]');
  }

  public async clickInvoice(): Promise<void> {
    await (await this.invoiceNameByIndex).click();
  }
}

export default new VendorPage();
