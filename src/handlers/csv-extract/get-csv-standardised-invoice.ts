import { getVendorServiceConfigRows } from "../../shared/utils";
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

export const getCsvStandardisedInvoice = async (
  csvObject: CsvObject,
  vendorId: string,
  configBucket: string
): Promise<StandardisedLineItem[]> => {
  const summary = {
    invoice_receipt_id: csvObject["PO Number"],
    vendor_id: vendorId,
    vendor_name: csvObject.Vendor,
    invoice_receipt_date: csvObject["Invoice Date"],
    due_date: csvObject["Due Date"],
    tax_payer_id: csvObject["VAT Number"],
    parser_version: csvObject.Version,
  };
  console.log(summary);

  const vendorServiceConfigRows = await getVendorServiceConfigRows(
    configBucket,
    { vendor_id: vendorId }
  );
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
          subtotal: +item.Subtotal,
          quantity: +item.Quantity,
          service_name: serviceName,
          unit_price: +item["Unit Price"],
          total: +item.Total,
        },
      ];
      console.log("nextAcc", nextAcc);
    }
    return nextAcc;
  }, []);
};
