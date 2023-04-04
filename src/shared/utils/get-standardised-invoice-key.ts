import { StandardisedLineItem } from "../types";
import crypto from "crypto";
import { formatDateAsYearMonth } from "./date-utils";

export type LineItemFieldsForNaming = Pick<
  StandardisedLineItem,
  "event_name" | "invoice_receipt_date" | "vendor_id"
>;

// TODO This will go away with BTM-486.
export function getStandardisedInvoiceFileName(
  standardisedInvoice: LineItemFieldsForNaming
): string {
  const yearMonth = getYearMonth(standardisedInvoice.invoice_receipt_date);
  const vendorId = standardisedInvoice.vendor_id;
  const eventName = standardisedInvoice.event_name;
  const uuid = crypto.randomBytes(3).toString("hex");
  const fileName = `${yearMonth}-${vendorId}-${eventName}-${uuid}.txt`;

  return fileName;
}

// TODO This will go away with BTM-486.
export function getYearMonth(dateStr: string): string {
  const date = new Date(dateStr);
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  return `${year}-${month}`;
}

export function getStandardisedInvoiceKey(
  folder: string,
  standardisedInvoice: LineItemFieldsForNaming
): string {
  const date = new Date(standardisedInvoice.invoice_receipt_date);
  const yearMonth = formatDateAsYearMonth(date, "-");
  const vendorId = standardisedInvoice.vendor_id;
  const eventName = standardisedInvoice.event_name;
  const uuid = crypto.randomBytes(3).toString("hex");
  return `${folder}/${formatDateAsYearMonth(
    date
  )}/${yearMonth}-${vendorId}-${eventName}-${uuid}.txt`;
}
