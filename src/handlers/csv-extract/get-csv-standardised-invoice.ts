import { formatDate, VendorServiceConfigRows } from "../../shared/utils";
import { StandardisedLineItem } from "../pdf-standardisation/get-standardised-invoice";

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
    invoice_receipt_date: formatDate(new Date(csvObject["Invoice Date"])),
    due_date: formatDate(new Date(csvObject["Due Date"])),
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
          tax: formatNumber(item.Tax),
          total: formatNumber(item.Total),
        },
      ];
    }
    return nextAcc;
  }, []);
};

function formatNumber(str: string): number {
  if (isNaN(Number(str))) {
    throw new Error(`Unsupported number format: ${str}`);
  } else if (!str) {
    throw new Error(`Empty number field in csv: ${str}`);
  } else return Number(str);
}
