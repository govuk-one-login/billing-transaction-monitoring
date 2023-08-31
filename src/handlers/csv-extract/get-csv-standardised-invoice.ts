import { ConfigServicesRow, StandardisedLineItem } from "../../shared/types";
import {
  dateRangeIsQuarter,
  formatDate,
  getDate,
  logger,
} from "../../shared/utils";

export interface LineItem {
  "service name": string;
  "unit price": string;
  quantity: string;
  tax: string;
  subtotal: string;
  total: string;
}

export interface CsvObject {
  vendor: string;
  "invoice date": string;
  "invoice period start": string;
  "invoice period end": string;
  "due date": string;
  "vat number": string;
  "po number": string;
  version: string;
  lineItems: LineItem[];
}

export const getCsvStandardisedInvoice = (
  csvObject: CsvObject,
  vendorId: string,
  vendorServiceConfigRows: ConfigServicesRow[],
  sourceFileName: string
): StandardisedLineItem[] => {
  const summary = {
    invoice_receipt_id: csvObject["po number"],
    vendor_id: vendorId,
    vendor_name: csvObject.vendor,
    invoice_receipt_date: formatDate(getDate(csvObject["invoice date"])),
    invoice_period_start: formatDate(
      getDate(csvObject["invoice period start"])
    ),
    due_date: formatDate(getDate(csvObject["due date"])),
    tax_payer_id: csvObject["vat number"],
    parser_version: csvObject.version,
    originalInvoiceFile: sourceFileName,
    invoice_is_quarterly: dateRangeIsQuarter(
      getDate(csvObject["invoice period start"]),
      getDate(csvObject["invoice period end"])
    ),
  };

  return csvObject.lineItems.reduce<StandardisedLineItem[]>((acc, item) => {
    const itemDescription = item["service name"];
    let nextAcc = [...acc];

    for (const {
      service_name: serviceName,
      service_regex: serviceRegexPattern,
      event_name: eventName,
      contract_id: contractId,
      invoice_is_quarterly: invoiceIsQuarterly,
      vendor_name: vendorName,
    } of vendorServiceConfigRows) {
      const serviceRegex = new RegExp(serviceRegexPattern, "i");
      if (!itemDescription?.match(serviceRegex)) {
        continue;
      }

      if (invoiceIsQuarterly !== summary.invoice_is_quarterly)
        throw Error(
          `Service config and line item quarterly flags do not match for "${serviceName}" on invoice ${summary.invoice_receipt_id} received ${summary.invoice_receipt_date} from ${vendorName}`
        );

      nextAcc = [
        ...nextAcc,
        {
          ...summary,
          event_name: eventName,
          item_description: itemDescription,
          subtotal: formatNumber(item.subtotal),
          price: formatNumber(item.subtotal),
          quantity: formatNumber(item.quantity),
          service_name: serviceName,
          contract_id: contractId,
          unit_price: formatNumber(item["unit price"]),
          tax: formatNumber(item.tax),
          total: formatNumber(item.total),
        },
      ];
    }

    if (acc.length === nextAcc.length)
      logger.warn("No service config found for line item", {
        vendorId,
        invoiceReceiptDate: summary.invoice_receipt_date,
        lastMatchedEventName: acc[acc.length - 1]?.event_name,
      });

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
