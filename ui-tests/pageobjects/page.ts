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

  public get breadcrumbs(): Promise<WebdriverIO.ElementArray> {
    return $$("li.govuk-breadcrumbs__list-item");
  }

  public async isPageHeadingDisplayed(): Promise<boolean> {
    return await (await this.pageHeading).isDisplayed();
  }

  public async getPageHeadingText(): Promise<string> {
    return await (await this.pageHeading).getText();
  }

  public async isPageSubHeadingDisplayed(): Promise<boolean> {
    return await (await this.pageSubHeading).isDisplayed();
  }

  public async getPageSubHeadingText(): Promise<string> {
    return await (await this.pageSubHeading).getText();
  }

  public async getTableData(
    tableElement: WebdriverIO.Element
  ): Promise<Array<{ [key: string]: string }>> {
    const tableData: Array<{ [key: string]: string }> = [];

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
}
