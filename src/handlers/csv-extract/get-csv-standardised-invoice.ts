import { VendorServiceConfigRows } from "../../shared/utils";
import { getNumberFromMoneyText } from "../store-standardised-invoices/field-utils/get-number-from-money-text";
import { getStandardisedDateText } from "../store-standardised-invoices/field-utils/get-standardised-date-text";
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
    invoice_receipt_date: getStandardisedDateText(csvObject["Invoice Date"]),
    due_date: getStandardisedDateText(csvObject["Due Date"]),
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
          subtotal: getNumberFromMoneyText(item.Subtotal),
          quantity: Number(item.Quantity),
          service_name: serviceName,
          unit_price: getNumberFromMoneyText(item["Unit Price"]),
          total: getNumberFromMoneyText(item.Total),
        },
      ];
    }

    return nextAcc;
  }, []);
};
