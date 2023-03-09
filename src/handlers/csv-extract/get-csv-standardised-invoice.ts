import { StandardisedLineItem } from "../store-standardised-invoices/get-standardised-invoice";

interface LineItem {
  "Service Name": string;
  "Unit Price": string;
  Quantity: string;
  Tax: string;
  Subtotal: string;
  Total: string;
}

interface CsvObject {
  Vendor: string;
  "Invoice Date": string;
  "Due Date": string;
  "VAT Number": string;
  lineItems: LineItem[];
}

export const getCsvStandardisedInvoice = async (
  csvObject: CsvObject
): Promise<StandardisedLineItem[]> => {
  console.log(csvObject);
  throw new Error("Temporary");
};
