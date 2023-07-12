import { ChainablePromiseElement } from "webdriverio";
import Page from "./page.js";

class HomePage extends Page {
  /**
   * define selectors using getter methods
   */

  public get welcomeMessage(): ChainablePromiseElement<WebdriverIO.Element> {
    return $("p.govuk-body");
  }

  public get linkToContractsPage(): ChainablePromiseElement<WebdriverIO.Element> {
    return $('a[href$="/contracts"]');
  }

  public async getWelcomeMessageText(): Promise<string> {
    return await (await this.welcomeMessage).getText();
  }

  public async clickOnContractsPageLink(): Promise<void> {
    await this.linkToContractsPage.click();
  }
}

export default new HomePage();
