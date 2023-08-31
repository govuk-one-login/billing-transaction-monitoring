import { waitForElementDisplayed } from "../helpers/waits";
export default class Page {
  public async open(path: string): Promise<void> {
    await browser.url(`/${path}`);
  }

  public get pageHeading(): Promise<WebdriverIO.Element> {
    return $(".govuk-heading-xl");
  }

  public get pageSubHeading(): Promise<WebdriverIO.Element> {
    return $(".govuk-heading-l");
  }

  public get pageParagraphText(): Promise<WebdriverIO.Element> {
    return $("p.govuk-body");
  }

  public get breadcrumbs(): Promise<WebdriverIO.ElementArray> {
    return $$("li.govuk-breadcrumbs__list-item");
  }

  public get cookiesFooterLink(): Promise<WebdriverIO.Element> {
    return $('a[href="/cookies"]');
  }

  public async isPageHeadingDisplayed(): Promise<boolean> {
    await waitForElementDisplayed(await this.pageHeading);
    return await (await this.pageHeading).isDisplayed();
  }

  public async getPageHeadingText(): Promise<string> {
    await waitForElementDisplayed(await this.pageHeading);
    return await (await this.pageHeading).getText();
  }

  public async isPageSubHeadingDisplayed(): Promise<boolean> {
    await waitForElementDisplayed(await this.pageSubHeading);
    return await (await this.pageSubHeading).isDisplayed();
  }

  public async getPageSubHeadingText(): Promise<string> {
    await waitForElementDisplayed(await this.pageSubHeading);
    return await (await this.pageSubHeading).getText();
  }

  public async getPageParagraphText(): Promise<string> {
    await waitForElementDisplayed(await this.pageParagraphText);
    return await (await this.pageParagraphText).getText();
  }

  public async getTableData(
    tableElement: WebdriverIO.Element
  ): Promise<Array<{ [key: string]: string }>> {
    const tableData: Array<{ [key: string]: string }> = [];
    await waitForElementDisplayed(tableElement);
    const rows = await tableElement.$$("tbody tr");
    const headerRow = await tableElement.$("thead tr");
    const headerColumns = await headerRow.$$("th");

    const columnHeaders = await Promise.all(
      headerColumns.map(async (headerColumn) => await headerColumn.getText())
    );

    for (const row of rows) {
      const columns = await row.$$("th,td");
      const rowData: { [key: string]: string } = {};

      for (const [index, header] of columnHeaders.entries()) {
        rowData[header] = await columns[index].getText();
      }

      tableData.push(rowData);
    }
    return tableData;
  }

  public async getBreadcrumbs(): Promise<string[]> {
    const breadcrumbsElements = await this.breadcrumbs;
    const breadcrumbs: string[] = [];

    for (const element of breadcrumbsElements) {
      const text = await element.getText();
      breadcrumbs.push(text);
    }
    return breadcrumbs;
  }

  public async clickOnCookiesFooterLink(): Promise<void> {
    await waitForElementDisplayed(await this.cookiesFooterLink);
    await (await this.cookiesFooterLink).click();
  }
}
