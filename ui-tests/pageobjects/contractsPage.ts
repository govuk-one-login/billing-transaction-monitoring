import Page from "./page";

class ContractsPage extends Page {
  /**
   * define selectors using getter methods
   */

  public get listOfContracts(): Promise<WebdriverIO.Element[]> {
    return $$("ul.govuk-list li a");
  }

  public async clickContractByVendorName(vendorName: string): Promise<void> {
    const contractElements = await this.listOfContracts;
    let matchedElement;
    for (const contract of contractElements) {
      await contract.waitForDisplayed();
      const text: string = await contract.getText();
      if (text.includes(vendorName)) {
        matchedElement = contract;
        break;
      }
    }
    if (!matchedElement) {
      throw new Error(
        `Contract element with vendor name "${vendorName}" not found`
      );
    }

    return await matchedElement.click();
  }

  public async getListOfContractsText(): Promise<string[]> {
    const listOfContractText: string[] = [];
    for (const contract of await this.listOfContracts) {
      await contract.waitForDisplayed();
      const text: string = await contract.getText();
      listOfContractText.push(text);
    }
    return listOfContractText;
  }
}

export default new ContractsPage();
