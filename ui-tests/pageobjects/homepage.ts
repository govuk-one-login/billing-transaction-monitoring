import Page from "./page";

class HomePage extends Page {
  /**
   * define selectors using getter methods
   */

  public get welcomeMessage(): Promise<WebdriverIO.Element> {
    return $("p.govuk-body");
  }

  public get overViewTable(): Promise<WebdriverIO.Element> {
    return $("caption*=Overview").parentElement();
  }

  public get contractsLink(): Promise<WebdriverIO.Element> {
    return $('a[href$="/contracts"]');
  }

  public async clickOnContractsPageLink(): Promise<void> {
    await (await this.contractsLink).click();
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
}

export default new HomePage();
