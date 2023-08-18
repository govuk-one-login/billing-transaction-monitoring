import { Textract } from "aws-sdk";
import { ConfigServicesRow, StandardisedLineItem } from "../../../shared/types";
import {
  getDueDate,
  getInvoiceReceiptDate,
  getInvoicePeriodStart,
  getInvoiceReceiptId,
  getItemDescription,
  getPrice,
  getQuantity,
  getSubtotal,
  getTax,
  getTaxPayerId,
  getTotal,
  getUnitPrice,
} from "../field-utils";
import { StandardisationModule } from "./get-standardised-invoice";

export const getStandardisedInvoiceDefault: StandardisationModule = (
  textractPages: Textract.ExpenseDocument[],
  vendorServiceConfigRows: ConfigServicesRow[],
  parserVersion: string,
  originalInvoiceFileName: string
): StandardisedLineItem[] => {
  // If you update this, please increment its version! See `README.md`.

  const summaryFields = getSummaryFields(textractPages);

  // To do: get line items another way, at least when not found this way (Jira: BTM-161)
  const lineItems = getLineItems(textractPages);

  const summary = {
    invoice_receipt_id: getInvoiceReceiptId(summaryFields),
    vendor_id: vendorServiceConfigRows[0].vendor_id,
    vendor_name: vendorServiceConfigRows[0].vendor_name,
    total: getTotal(summaryFields),
    invoice_receipt_date: getInvoiceReceiptDate(summaryFields),
    invoice_period_start: getInvoicePeriodStart(summaryFields),
    subtotal: getSubtotal(summaryFields),
    due_date: getDueDate(summaryFields),
    tax: getTax(summaryFields),
    tax_payer_id: getTaxPayerId(summaryFields),
    parser_version: parserVersion,
    originalInvoiceFile: originalInvoiceFileName,
  };

  return lineItems.reduce<StandardisedLineItem[]>((acc, item) => {
    const itemFields = item.LineItemExpenseFields ?? [];
    let nextAcc = [...acc];
    for (const {
      service_name: serviceName,
      service_regex: serviceRegexPattern,
      event_name: eventName,
      contract_id: contractId,
    } of vendorServiceConfigRows) {
      const serviceRegex = new RegExp(serviceRegexPattern, "i");
      const itemDescription = getItemDescription(itemFields);
      if (!itemDescription?.match(serviceRegex)) {
        continue;
      }

      nextAcc = [
        ...nextAcc,
        {
          ...summary,
          event_name: eventName,
          item_description: itemDescription,
          price: getPrice(itemFields),
          quantity: getQuantity(itemFields),
          service_name: serviceName,
          contract_id: contractId,
          unit_price: getUnitPrice(itemFields),
        },
      ];
    }
    return nextAcc;
  }, []);
};

const getLineItems = (
  textractPages: Textract.ExpenseDocument[]
): Textract.LineItemFields[] =>
  textractPages
    .map((page) => page.LineItemGroups ?? [])
    .flat()
    .map((group) => group.LineItems ?? [])
    .flat();

const getSummaryFields = (
  textractPages: Textract.ExpenseDocument[]
): Textract.ExpenseField[] =>
  textractPages.map((page) => page.SummaryFields ?? []).flat();
