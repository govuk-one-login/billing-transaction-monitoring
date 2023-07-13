import { ChainablePromiseArray, ChainablePromiseElement } from "webdriverio";
import Page from "./page.js";

class ContractPage extends Page {
  /**
   * define selectors using getter methods
   */

  public get listOfContracts(): ChainablePromiseArray<WebdriverIO.E> {
    return $$("ul.govuk-list");
  }

  public get vendorNameByIndex(): ChainablePromiseElement<WebdriverIO.Element> {
    return $('a[href$="/contracts/1/invoices"]');
  }

  public async isListContractsDisplayed(): Promise<boolean> {
    return (await this.listOfContracts).isDisplayed();
  }

  public async clickVendorName(): Promise<void> {
    await (await this.vendorNameByIndex).click();
  }

  public async getListOfContractsText(): Promise<string[]> {
    const listOfContractText = await this.listOfContracts.map(
      async (item) => await item.getText()
    );
    return listOfContractText;
  }
}

export default new ContractPage();
