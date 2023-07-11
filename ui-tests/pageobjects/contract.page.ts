import { ChainablePromiseArray } from "webdriverio";
import Page from "./page.js";

class ContractPage extends Page {
  /**
   * define selectors using getter methods
   */

  public get listOfContracts(): ChainablePromiseArray<WebdriverIO.ElementArray> {
    return $$("ul.govuk-list");
  }

  public async getListOfContractsText(): Promise<string[]> {
    const listOfContractText = await this.listOfContracts.map(
      async (item) => await item.getText()
    );
    console.log(listOfContractText);
    return listOfContractText;
  }
}

export default new ContractPage();
