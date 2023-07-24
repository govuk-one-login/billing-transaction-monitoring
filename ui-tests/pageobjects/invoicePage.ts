import Page from "./page";

class InvoicePage extends Page {
  /**
   * define selectors using getter methods
   */
  public get statusBanner(): Promise<WebdriverIO.Element> {
    return $(
      ".govuk-panel.warning, .govuk-panel.notice, .govuk-panel.payable, .govuk-panel.error"
    );
  }

  public get statusBannerTitle(): Promise<WebdriverIO.Element> {
    return $("h1.govuk-panel__title");
  }

  public get statusBannerBody(): Promise<WebdriverIO.Element> {
    return $("govuk-panel__body");
  }

  public get reconciliationTable(): Promise<WebdriverIO.Element> {
    return $("caption*=Reconciliation").parentElement();
  }

  public get quantityTable(): Promise<WebdriverIO.Element> {
    return $("caption*=Quantity (events)").parentElement();
  }

  public get priceTable(): Promise<WebdriverIO.Element> {
    return $("caption*=Price").parentElement();
  }

  public get measuredTable(): Promise<WebdriverIO.Element> {
    return $("caption*=Measured (events)").parentElement();
  }

  public get invoiceTable(): Promise<WebdriverIO.Element> {
    return $("caption*=Invoice").parentElement();
  }

  public async getStatusBannerColor(): Promise<string> {
    const statusBannerElement = await this.statusBanner;
    await statusBannerElement.waitForDisplayed();
    const color = await statusBannerElement.getCSSProperty("background-color");
    return color.parsed.hex ?? "";
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

    for (let i = 0; i < rows.length; i++) {
      const columns = await rows[i].$$("th,td");

      const rowData: { [key: string]: string } = {};

      for (let j = 0; j < columnHeaders.length; j++) {
        rowData[columnHeaders[j]] = await columns[j].getText();
      }

      tableData.push(rowData);
    }
    return tableData;
  }
}

export default new InvoicePage();
