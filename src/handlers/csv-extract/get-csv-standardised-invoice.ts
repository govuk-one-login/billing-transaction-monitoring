import { VendorServiceConfigRows } from "../../shared/utils";
import { StandardisedLineItem } from "../store-standardised-invoices/get-standardised-invoice";

export interface LineItem {
  "Service Name": string;
  "Unit Price": string;
  Quantity: string;
  Tax: string;
  Subtotal: string;
  Total: string;
}

export interface CsvObject {
  Vendor: string;
  "Invoice Date": string;
  "Due Date": string;
  "VAT Number": string;
  "PO Number": string;
  Version: string;
  lineItems: LineItem[];
}

export const getCsvStandardisedInvoice = (
  csvObject: CsvObject,
  vendorId: string,
  vendorServiceConfigRows: VendorServiceConfigRows
): StandardisedLineItem[] => {
  const summary = {
    invoice_receipt_id: csvObject["PO Number"],
    vendor_id: vendorId,
    vendor_name: csvObject.Vendor,
    invoice_receipt_date: formatDate(csvObject["Invoice Date"]),
    due_date: formatDate(csvObject["Due Date"]),
    tax_payer_id: csvObject["VAT Number"],
    parser_version: csvObject.Version,
  };

  return csvObject.lineItems.reduce<StandardisedLineItem[]>((acc, item) => {
    const itemDescription = item["Service Name"];
    let nextAcc = [...acc];

    for (const {
      service_name: serviceName,
      service_regex: serviceRegexPattern,
    } of vendorServiceConfigRows) {
      const serviceRegex = new RegExp(serviceRegexPattern, "i");
      console.log(serviceRegex);
      if (!itemDescription?.match(serviceRegex)) {
        continue;
      }

      nextAcc = [
        ...nextAcc,
        {
          ...summary,
          item_description: itemDescription,
          subtotal: formatNumber(item.Subtotal),
          price: formatNumber(item.Subtotal),
          quantity: formatNumber(item.Quantity),
          service_name: serviceName,
          unit_price: formatNumber(item["Unit Price"]),
          total: formatNumber(item.Total),
        },
      ];
    }
    return nextAcc;
  }, []);
};

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  if (date === null) {
    throw new Error(`Unsupported date format: ${dateStr}`);
  }
  const year = date.getFullYear();
  const month = `${(date.getMonth() + 1).toString().padStart(2, "0")}`; // Add leading zero if necessary
  const day = `${date.getDate().toString().padStart(2, "0")}`; // Add leading zero if necessary
  return `${year}-${month}-${day}`;
}

function formatNumber(str: string): number {
  if (isNaN(Number(str))) {
    throw new Error(`Unsupported money format: ${str}`);
  } else return Number(str);
}
