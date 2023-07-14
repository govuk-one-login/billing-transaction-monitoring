import Page from "./page.js";

class HomePage extends Page {
  /**
   * define selectors using getter methods
   */

  public get welcomeMessage(): Promise<WebdriverIO.Element> {
    return $("p.govuk-body");
  }

  public get contractsLink(): Promise<WebdriverIO.Element> {
    return $('a[href$="/contracts"]');
  }

  public async clickOnContractsPageLink(): Promise<void> {
    await (await this.contractsLink).click();
  }
}

export default new HomePage();
