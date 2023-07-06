import Page from "./page.js";
import { ChainablePromiseElement } from "webdriverio";

/**
 * sub page containing specific selectors and methods for a specific page
 */
class HomePage extends Page {
  /**
   * define selectors using getter methods
   */

  public get pageTitle(): ChainablePromiseElement<WebdriverIO.Element> {
    return $("h1.govuk-heading-l");
  }

  public get welcomeMessage(): ChainablePromiseElement<WebdriverIO.Element> {
    return $("p.govuk-body");
  }

  public get linkToContractsPage(): ChainablePromiseElement<WebdriverIO.Element> {
    return $('a[href$="/contracts"]');
  }

  public async clickOnContractsPageLink(): Promise<void> {
    await this.linkToContractsPage.click();
  }
}

export default new HomePage();
