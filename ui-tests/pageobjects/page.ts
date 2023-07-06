/**
 * main page object containing all methods, selectors and functionality
 * that is shared across all page objects
 */
export default class Page {
  public async open(): Promise<string> {
    await browser.url("");
    return await browser.getUrl();
  }
}
