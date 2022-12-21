import JsPdf from "jspdf";
import autoTable from "jspdf-autotable";
import { writeInvoiceToDisk } from "./writer";
// import placeNames from "./place-names.json";

interface LineItem {
  description: string;
  quantity: number;
  unitPrice: number;
  vat: number;
  subtotal: number;
}

// interface Invoice {
//   customerAddress: string[];
//   companyAddress: string[];
//   date: Date;
//   invoiceNumber: string;
//   reference: string;
//   vatNumber: string;
//   dueDate: Date;
//   lineItems: LineItem[];
// }

// interface Suppliers {
//   [id: number]: string;
// }

// const randomName = (): string => {
//   return placeNames[Math.floor(Math.random() * placeNames.length)];
// };

// const generateSuppliers = (quantity: number): Suppliers => {
//   return new Array(quantity).fill(null).reduce<Suppliers>(
//     (acc, _cur, i) => ({
//       ...acc,
//       [i]: randomName(),
//     }),
//     {}
//   );
// };

const generateLineItem = (): LineItem => {
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

const generateLineItems = (quantity: number): LineItem[] => {
  return new Array(quantity).fill(null).map(generateLineItem);
};

export const makeInvoice =
  (writeOutput: (file: ArrayBuffer) => Promise<void>) =>
  async (lineItems: LineItem[]): Promise<void> => {
    const doc = new JsPdf({
      unit: "cm",
    });

    autoTable(doc, {
      head: [["Description", "Quantity", "Unit Price", "VAT", "Amount"]],
      body: lineItems.map((lineItem) => [
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
          `Subtotal: ${lineItems
            .reduce((acc, cur) => acc + cur.subtotal, 0)
            .toLocaleString("en-GB", {
              style: "currency",
              currency: "gbp",
            })}`,
        ],
        [
          `Total: ${lineItems
            .reduce((acc, cur) => acc + cur.subtotal + cur.vat, 0)
            .toLocaleString("en-GB", {
              style: "currency",
              currency: "gbp",
            })}`,
        ],
      ],
    });

    const output = doc.output("arraybuffer");

    await writeOutput(output);
  };

export const orchestrator = async (): Promise<void> => {
  await makeInvoice(writeInvoiceToDisk)(generateLineItems(10));
};
