import { StandardisedLineItem } from "../types";
import crypto from "crypto";

export type LineItemFieldsForNaming = Pick<
  StandardisedLineItem,
  "event_name" | "invoice_receipt_date" | "vendor_id"
>;

export function getStandardisedInvoiceFileName(
  standardisedInvoice: LineItemFieldsForNaming
): string {
  const prefix = getStandardisedInvoiceFileNamePrefix(standardisedInvoice);
  const uuid = crypto.randomBytes(3).toString("hex");
  return `${prefix}${uuid}.txt`;
}

export function getStandardisedInvoiceFileNamePrefix(
  standardisedInvoice: LineItemFieldsForNaming
): string {
  const yearMonth = getYearMonth(standardisedInvoice.invoice_receipt_date);
  const vendorId = standardisedInvoice.vendor_id;
  const eventName = standardisedInvoice.event_name;
  return `${yearMonth}-${vendorId}-${eventName}-`;
}

export function getYearMonth(dateStr: string): string {
  const date = new Date(dateStr);
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  return `${year}-${month}`;
}
