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
  vendorServiceConfigRows: VendorServiceConfigRow[]
): StandardisedLineItem[] => {
  const summaryFields = getSummaryFields(textractPages);

  const lineItems = getLineItems(textractPages);

  const summary = {
    invoice_receipt_id: getInvoiceReceiptId(summaryFields),
    vendor_name: vendorServiceConfigRows[0].vendor_name,
    total: getTotal(summaryFields),
    invoice_receipt_date: getInvoiceReceiptDate(summaryFields),
    subtotal: getSubtotal(summaryFields),
    due_date: getDueDate(summaryFields),
    tax: getTax(summaryFields),
    tax_payer_id: getTaxPayerId(summaryFields),
  };

  const serviceRegexArray = vendorServiceConfigRows.map((configLine) => ({
    serviceRegex: new RegExp(configLine.service_regex, "i"),
    service_name: configLine.service_name,
  }));

  console.log(serviceRegexArray);

  const standardisedLineItems = lineItems.map((item) => {
    const itemFields = item.LineItemExpenseFields ?? [];
    const itemDescription = getItemDescription(itemFields) ?? "";
    const serviceName = serviceRegexArray.find((serviceMatcher) => {
      return serviceMatcher.serviceRegex.test(itemDescription);
    })?.service_name;

    return {
      ...summary,
      item_description: getItemDescription(itemFields),
      unit_price: getUnitPrice(itemFields),
      quantity: 9001, // To do: get real quantity (Jira: BTM-349)
      price: getPrice(itemFields),
      service_name: serviceName,
    };
  });

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
