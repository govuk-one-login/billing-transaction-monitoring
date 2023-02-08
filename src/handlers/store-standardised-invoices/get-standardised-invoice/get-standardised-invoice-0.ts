import { Textract } from "aws-sdk";
import { VendorServiceConfigRow } from "../../../shared/utils/config-utils/fetch-vendor-service-config";
import {
  getDueDate,
  getInvoiceReceiptDate,
  getInvoiceReceiptId,
  getItemDescription,
  getPrice,
  getSubtotal,
  getTax,
  getTaxPayerId,
  getTotal,
  getUnitPrice,
} from "../field-utils";
import {
  StandardisationModule,
  StandardisedLineItem,
} from "./get-standardised-invoice";

// To do: replace with useful invoice standardiser, and add unit tests (Jira: BTM-349)
export const getStandardisedInvoice0: StandardisationModule = (
  textractPages: Textract.ExpenseDocument[],
  {
    service_name: serviceName,
    service_regex: serviceRegexPattern,
    vendor_name: vendorName,
  }: VendorServiceConfigRow
): StandardisedLineItem[] => {
  const summaryFields = getSummaryFields(textractPages);

  const lineItems = getLineItems(textractPages);

  const summary = {
    invoice_receipt_id: getInvoiceReceiptId(summaryFields),
    vendor_name: vendorName,
    total: getTotal(summaryFields),
    invoice_receipt_date: getInvoiceReceiptDate(summaryFields),
    subtotal: getSubtotal(summaryFields),
    due_date: getDueDate(summaryFields),
    tax: getTax(summaryFields),
    tax_payer_id: getTaxPayerId(summaryFields),
  };

  const serviceRegex = new RegExp(serviceRegexPattern, "i");

  const standardisedLineItems = lineItems.reduce<StandardisedLineItem[]>(
    (acc, item) => {
      const itemFields = item.LineItemExpenseFields ?? [];

      const itemDescription = getItemDescription(itemFields);
      if (!itemDescription?.match(serviceRegex)) {
        return acc;
      }

      return [
        ...acc,
        {
          ...summary,
          item_description: itemDescription,
          price: getPrice(itemFields),
          quantity: 9001, // To do: get real quantity (Jira: BTM-349)
          service_name: serviceName,
          unit_price: getUnitPrice(itemFields),
        },
      ];
    },
    []
  );

  return standardisedLineItems;
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
