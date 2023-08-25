import JSPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { InvoiceData } from "./types";
import {
  getDateString,
  getQuarterEndDateString,
  getQuarterStartDateString,
} from "../../dateHelper";

export type WriteFunc<TWriteOutput> = (
  file: string,
  folder: string,
  filename: string
) => Promise<TWriteOutput>;

export class Invoice {
  constructor(invoice: InvoiceData) {
    this.vendor = invoice.vendor;
    this.customer = invoice.customer;
    this.date = new Date(invoice.dateString);
    this.invoiceNumber = invoice.invoiceNumber;
    this.dueDate = new Date(invoice.dueDateString);
    this.lineItems = invoice.lineItems;
    this.isQuarterly = invoice.isQuarterly;
  }

  public vendor;
  public customer;
  public date;
  public invoiceNumber;
  public dueDate;
  public lineItems;
  public isQuarterly;

  getQuantity(description?: string): number {
    return this.lineItems
      .filter((lineItem) => {
        return description === null || lineItem.description === description;
      })
      .reduce((acc, cur) => acc + cur.quantity, 0);
  }

  getSubtotal(description?: string): number {
    return this.lineItems
      .filter((lineItem) => {
        return (
          description === undefined || lineItem.description === description
        );
      })
      .reduce((acc, cur) => acc + cur.subtotal, 0);
  }

  getTotal(): number {
    return this.lineItems.reduce((acc, cur) => acc + cur.subtotal + cur.vat, 0);
  }

  getTotalTax(): number {
    return this.lineItems.reduce((acc, cur) => acc + cur.vat, 0);
  }

  getLineItemsSubTotal(): number {
    return this.lineItems.reduce((acc, cur) => acc + cur.subtotal, 0);
  }
}

export const makeMockInvoicePdfData = (invoice: Invoice): string => {
  const doc = new JSPDF({
    unit: "cm",
  });

  const date = new Date(invoice.date);
  const dueDate = new Date(invoice.dueDate);

  doc.setFontSize(24);
  doc.text(`Tax Invoice`, 2, 2);

  doc.setFontSize(8);
  invoice.customer.address.forEach((line, i) => {
    doc.text(line, 2, 3 + i / 2);
  });
  invoice.vendor.address.forEach((line, i) => {
    doc.text(line, 16, 2 + i / 2);
  });
  doc.text(`Invoice Number:\n${invoice.invoiceNumber}`, 12, 2);
  doc.text(`Invoice Date:\n${date.toLocaleDateString("en-GB")}`, 12, 3);
  doc.text(`Due Date:\n${dueDate.toLocaleDateString("en-GB")}`, 12, 4);
  doc.text(`VAT Number:\n${invoice.vendor.vatNumber}`, 12, 5);

  autoTable(doc, {
    startY: 8,
    head: [["Description", "Quantity", "Unit Price", "VAT", "Amount"]],
    body: invoice.lineItems.map((lineItem) => [
      lineItem.description,
      lineItem.quantity,
      lineItem.unitPrice.toLocaleString("en-GB", {
        style: "currency",
        currency: "gbp",
      }),
      lineItem.vat.toLocaleString("en-GB", {
        style: "currency",
        currency: "gbp",
      }),
      lineItem.subtotal.toLocaleString("en-GB", {
        style: "currency",
        currency: "gbp",
      }),
    ]),
    foot: [
      [
        `Subtotal: ${invoice.getSubtotal().toLocaleString("en-GB", {
          style: "currency",
          currency: "gbp",
        })}`,
      ],
      [
        `Total: ${invoice.getTotal().toLocaleString("en-GB", {
          style: "currency",
          currency: "gbp",
        })}`,
      ],
    ],
  });
  doc.text(`Invoice number: ${invoice.invoiceNumber}`, 2, 20);
  return doc.output();
};

export const makeMockInvoicePDF =
  <TWriteOutput>(writeOutput: WriteFunc<TWriteOutput>) =>
  async (
    invoice: Invoice,
    folder: string,
    filename: string
  ): Promise<TWriteOutput> => {
    const data = makeMockInvoicePdfData(invoice);
    return await writeOutput(data, folder, filename);
  };

export const makeMockInvoiceCSVData = (invoice: Invoice): string => {
  const csvData = [
    ["Vendor", invoice.vendor.name],
    [
      "Invoice period start",
      invoice.isQuarterly
        ? getQuarterStartDateString(invoice.date)
        : getDateString(invoice.date),
    ],
    [
      "Invoice period end",
      invoice.isQuarterly
        ? getQuarterEndDateString(invoice.date)
        : getDateString(invoice.date),
    ],
    ["Invoice Date", getDateString(invoice.date)],
    ["Due Date", getDateString(invoice.dueDate)],
    ["VAT Number", invoice.vendor.vatNumber],
    ["WP Number", invoice.vendor.vatNumber],
    ["PO Number", invoice.vendor.vatNumber],
    ["Version", "1.0.0"],
    ["Service Name", "Unit Price", "Quantity", "Tax", "Subtotal", "Total"],
    ...invoice.lineItems.map((lineItem) => [
      lineItem.description,
      lineItem.unitPrice,
      lineItem.quantity,
      lineItem.vat.toFixed(4),
      lineItem.subtotal.toFixed(4),
      invoice.getTotal().toFixed(4),
    ]),
    [
      "Total",
      "",
      "",
      invoice.getTotalTax(),
      invoice.getLineItemsSubTotal(),
      invoice.getTotal(),
    ],
  ];
  const csvString = csvData.map((row) => row.join(",")).join("\n");
  return csvString;
};

export const makeMockInvoiceCSV =
  <TWriteOutput>(writeOutput: WriteFunc<TWriteOutput>) =>
  async (
    invoice: Invoice,
    folder: string,
    filename: string
  ): Promise<TWriteOutput> => {
    const csvString = makeMockInvoiceCSVData(invoice);
    return await writeOutput(csvString, folder, filename);
  };
