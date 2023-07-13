import { ChainablePromiseArray, ChainablePromiseElement } from "webdriverio";
import Page from "./page.js";

class ContractPage extends Page {
  /**
   * define selectors using getter methods
   */

  public get listOfContracts(): ChainablePromiseArray<WebdriverIO.Element> {
    return $$("ul.govuk-list li a.govuk-link");
  }

  public getContractElementByName(
    vendorName: string
  ): ChainablePromiseElement<WebdriverIO.Element> {
    const matchedElement = this.listOfContracts.find(async (element) => {
      const text = await element.getText();
      return text.includes(`${vendorName}`);
    }) as ChainablePromiseElement<WebdriverIO.Element>;
    return matchedElement;
  }

  public get vendorNameByIndex(): ChainablePromiseElement<WebdriverIO.Element> {
    return $('a[href$="/contracts/1/invoices"]');
  }

  public async isListContractsDisplayed(): Promise<boolean> {
    return await (await this.listOfContracts).isDisplayed();
  }

  public async clickContractByVendorName(vendorName: string): Promise<void> {
    const contractElement = this.getContractElementByName(vendorName);
    await contractElement.click();
  }

  public async getListOfContractsText(): Promise<string[]> {
    const listOfContractText = await this.listOfContracts.map(
      async (item) => await item.getText()
    );
    return listOfContractText;
  }
}

export default new ContractPage();
