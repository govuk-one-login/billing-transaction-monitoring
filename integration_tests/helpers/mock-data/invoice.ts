import JSPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { writeInvoiceToDisk } from "./writer";
import placeNames from "./place-names.json";
import streetTypes from "./street-types.json";

interface LineItem {
  description: string;
  quantity: number;
  unitPrice: number;
  vat: number;
  subtotal: number;
}

interface Vendor {
  name: string;
  address: string[];
  vatNumber: string;
}

interface Customer {
  name: string;
  address: string[];
}

interface InvoiceData {
  vendor: Vendor;
  customer: Customer;
  date: Date;
  dueDate: Date;
  invoiceNumber: string;
  lineItems: LineItem[];
}

class Invoice {
  constructor(invoice: InvoiceData) {
    this.vendor = invoice.vendor;
    this.customer = invoice.customer;
    this.date = invoice.date;
    this.invoiceNumber = invoice.invoiceNumber;
    this.dueDate = invoice.dueDate;
    this.lineItems = invoice.lineItems;
  }

  public vendor;
  public customer;
  public date;
  public invoiceNumber;
  public dueDate;
  public lineItems;

  getSubtotal(): number {
    return this.lineItems.reduce((acc, cur) => acc + cur.subtotal, 0);
  }

  getTotal(): number {
    return this.lineItems.reduce((acc, cur) => acc + cur.subtotal, 0);
  }
}

const randomLetter = (): string => {
  return Math.ceil(10 + Math.random() * 25).toString(36);
};

const randomString = (length: number): string => {
  return new Array(length)
    .fill(null)
    .reduce<string>((acc) => acc + randomLetter(), "");
};

const randomStreetType = (): string => {
  return streetTypes[Math.floor(Math.random() * streetTypes.length)];
};

const randomName = (): string => {
  return placeNames[Math.floor(Math.random() * placeNames.length)];
};

const randomPostcode = (): string => {
  return `${randomLetter()}${randomLetter()}${Math.floor(
    1 + Math.random() * 8
  )} ${Math.floor(
    1 + Math.random() * 8
  )}${randomLetter()}${randomLetter()}`.toUpperCase();
};

const randomAddress = (): string[] => {
  return [
    `${Math.floor(Math.random() * 100)} ${randomName()}`,
    `${randomName()} ${randomStreetType()}`,
    randomName(),
    randomPostcode(),
  ];
};

const randomVendor = (): Vendor => {
  return {
    name: randomName(),
    vatNumber: `GB${Math.floor(Math.random() * 1_000_000_000)}`,
    address: randomAddress(),
  };
};

const randomCustomer = (): Customer => {
  return {
    name: randomName(),
    address: randomAddress(),
  };
};

const randomLineItem = (): LineItem => {
  const priceTier = [
    { min: 0, max: 5, unitPrice: 6.5 },
    { min: 6, max: 10, unitPrice: 0.25 },
    { min: 10, unitPrice: 8.88 },
  ][Math.floor(Math.random() * 3)]; // These match fake-prices.csv
  const quantity =
    priceTier.min + Math.floor(Math.random() * (priceTier.max ?? 20));
  const subtotal = quantity * priceTier.unitPrice;
  return {
    description: "Verification of sentience via address checking mechanism", // should match IPV_ADDRESS_CRI_END from fake-vendor-services.csv
    vat: 0.2 * subtotal,
    quantity,
    unitPrice: priceTier.unitPrice,
    subtotal,
  };
};

const randomLineItems = (quantity: number): LineItem[] => {
  return new Array(quantity).fill(null).map(randomLineItem);
};

export const randomInvoice = (): Invoice => {
  return new Invoice({
    vendor: randomVendor(),
    customer: randomCustomer(),
    date: new Date(),
    invoiceNumber: `${randomString(3)}-${Math.floor(
      Math.random() * 1_000_000_000
    )}`,
    dueDate: new Date(new Date().getTime() + 1000 * 60 * 60 * 24 * 30),
    lineItems: randomLineItems(10),
  });
};

export const makeInvoicePDF =
  <TWriteOutput>(writeOutput: (file: ArrayBuffer) => Promise<TWriteOutput>) =>
  async (invoice: Invoice): Promise<TWriteOutput> => {
    const doc = new JSPDF({
      unit: "cm",
    });

    autoTable(doc, {
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
    const output = await writeOutput(doc.output("arraybuffer"));

    return output;
  };

export const orchestrator = async (): Promise<void> => {
  await makeInvoicePDF(writeInvoiceToDisk)(randomInvoice());
};
