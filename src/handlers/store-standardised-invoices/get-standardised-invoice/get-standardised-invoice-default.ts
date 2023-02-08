import { Textract } from "aws-sdk";
import { VendorServiceConfigRow } from "../../../shared/utils/config-utils/fetch-vendor-service-config";
import {
  getDueDate,
  getInvoiceReceiptDate,
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
import {
  StandardisationModule,
  StandardisedLineItem,
} from "./get-standardised-invoice";

export const getStandardisedInvoiceDefault: StandardisationModule = (
  textractPages: Textract.ExpenseDocument[],
  vendorServiceConfigRows: VendorServiceConfigRow[]
): StandardisedLineItem[] => {
  const summaryFields = getSummaryFields(textractPages);

  // To do: get line items another way, at least when not found this way (Jira: BTM-161)
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
      item_description: itemDescription,
      unit_price: getUnitPrice(itemFields),
      quantity: getQuantity(itemFields),
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
