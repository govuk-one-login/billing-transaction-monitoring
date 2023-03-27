import { StandardisedLineItem } from "../types";
import crypto from "crypto";

export function getStandardisedInvoiceFileName(
  standardisedInvoice: StandardisedLineItem
): string {
  const yearMonth = getYearMonth(standardisedInvoice.invoice_receipt_date);
  const vendorId = standardisedInvoice.vendor_id;
  const eventName = standardisedInvoice.event_name;
  const uuid = crypto.randomBytes(3).toString("hex");
  const fileName = `${yearMonth}-${vendorId}-${eventName}-${uuid}.txt`;

  return fileName;
}

export function getYearMonth(dateStr: string): string {
  const date = new Date(dateStr);
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  return `${year}-${month}`;
}
