import Page from "./page.js";

class ContractPage extends Page {
  /**
   * define selectors using getter methods
   */

  public get listOfContracts(): Promise<WebdriverIO.Element[]> {
    return $$("ul.govuk-list li a.govuk-link");
  }

  public async getContractElementByName(
    vendorName: string
  ): Promise<WebdriverIO.Element> {
    const matchedElement = (await this.listOfContracts).find(
      async (element) => {
        const text = await element.getText();
        return text.includes(`${vendorName}`);
      }
    );
    if (!matchedElement) {
      throw new Error(` Contract element with vendor name  not found`);
    }
    return matchedElement;
  }

  public get vendorNameByIndex(): Promise<WebdriverIO.Element> {
    return $('a[href$="/contracts/1/invoices"]');
  }

  public async clickContractByVendorName(vendorName: string): Promise<void> {
    const contractElement = this.getContractElementByName(vendorName);
    await (await contractElement).click();
  }

  public async getListOfContractsText(): Promise<string[]> {
    const listOfContractText: string[] = [];
    for (const contract of await this.listOfContracts) {
      const text: string = await contract.getText();
      listOfContractText.push(text);
    }
    return listOfContractText;
  }
}

export default new ContractPage();
