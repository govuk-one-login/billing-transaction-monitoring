import { StandardisedLineItem } from "../types";
import crypto from "crypto";
import {
  formatDateAsYearMonth,
  getMonthQuarter,
  getQuarterMonth,
} from "./date-utils";

export type LineItemFieldsForNaming = Pick<
  StandardisedLineItem,
  "event_name" | "invoice_is_quarterly" | "invoice_receipt_date" | "vendor_id"
>;

export function getStandardisedInvoiceKeyPrefix(
  folder: string,
  standardisedInvoice: LineItemFieldsForNaming
): string {
  const date = new Date(standardisedInvoice.invoice_receipt_date);
  if (standardisedInvoice.invoice_is_quarterly) {
    const month = date.getMonth() + 1;
    const quarter = getMonthQuarter(month);
    const quarterMonth = getQuarterMonth(quarter);
    date.setMonth(quarterMonth - 1);
  }
  const yearMonth = formatDateAsYearMonth(date);
  const vendorId = standardisedInvoice.vendor_id;
  const eventName = standardisedInvoice.event_name;
  return `${folder}/${formatDateAsYearMonth(
    date,
    "/"
  )}/${yearMonth}-${vendorId}-${eventName}-`;
}

export function getStandardisedInvoiceKey(
  folder: string,
  standardisedInvoice: LineItemFieldsForNaming
): [string, string] {
  const uuid = crypto.randomBytes(3).toString("hex");
  const prefix = getStandardisedInvoiceKeyPrefix(folder, standardisedInvoice);
  return [`${prefix}${uuid}.txt`, prefix];
}
