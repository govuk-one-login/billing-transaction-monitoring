import {
  ConfigServicesRow,
  StandardisedLineItem,
  StandardisedLineItemSummary,
} from "../../../shared/types";
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
import { StandardisationModule } from "./get-standardised-invoice";
import {
  ExpenseDocument,
  ExpenseField,
  LineItemFields,
  LineItemGroup,
} from "@aws-sdk/client-textract";

interface TextractLineItemGroupWithLineItems extends LineItemGroup {
  LineItems: TextractLineItemWithFields[];
}

interface TextractLineItemWithFields extends LineItemFields {
  LineItemExpenseFields: ExpenseField[];
}

interface TextractPageWithLineItems extends ExpenseDocument {
  LineItemGroups: TextractLineItemGroupWithLineItems[];
}

export const getStandardisedInvoice0: StandardisationModule = (
  allTextractPages: ExpenseDocument[],
  vendorServiceConfigRows: ConfigServicesRow[],
  parserVersion: string,
  originalInvoiceFileName: string
): StandardisedLineItem[] => {
  // If you update this, please increment its version! See `README.md`.

  if (vendorServiceConfigRows.length === 0)
    throw new Error("No vendor service config rows");

  // Second page is guide to reading invoice with example data, so ignore it
  const textractPagesToUse = [...allTextractPages];
  textractPagesToUse.splice(1, 1);

  // First page has all summary fields, and others label subtotal as total, so use only first
  const summaryPage = textractPagesToUse[0];
  const summaryFields = summaryPage?.SummaryFields ?? [];

  // Daily transactions are sometimes shown as redundant line items and are always summed into a separate item on a different page, so just use that last page to avoid doubling
  const lastPageWithLineItems = getLastPageWithLineItems(textractPagesToUse);
  const lineItems =
    lastPageWithLineItems === undefined
      ? []
      : getLineItems(lastPageWithLineItems);

  const invoiceReceiptDate = getInvoiceReceiptDate(summaryFields);
  const summary = {
    invoice_receipt_id: getInvoiceReceiptId(summaryFields),
    vendor_id: vendorServiceConfigRows[0].vendor_id,
    vendor_name: vendorServiceConfigRows[0].vendor_name,
    total: getTotal(summaryFields),
    invoice_receipt_date: invoiceReceiptDate,
    invoice_period_start: invoiceReceiptDate,
    subtotal: getSubtotal(summaryFields),
    due_date: getDueDate(summaryFields),
    tax: getTax(summaryFields),
    tax_payer_id: getTaxPayerId(summaryFields),
    parser_version: parserVersion,
    originalInvoiceFile: originalInvoiceFileName,
  };

  return getStandardisedLineItems(summary, lineItems, vendorServiceConfigRows);
};

/** Try to get quantity and unit price from description text like "(X @ Y GBP)" */
const getDescriptionData = (
  description: string
): { quantity: number; unitPrice: number } | undefined => {
  const pattern = /\((.+)\s+@\s+(.+)\s+GBP\)/g;
  const match = pattern.exec(description);

  if (match !== null) {
    const quantity = Number(match[1]);
    const unitPrice = Number(match[2]);

    if (!Number.isNaN(quantity) && !Number.isNaN(unitPrice))
      return { quantity, unitPrice };
  }
};

const getLastPageWithLineItems = (
  textractPages: ExpenseDocument[]
): TextractPageWithLineItems | undefined => {
  const pagesWithItems = textractPages.filter((page) =>
    page.LineItemGroups?.some((group) =>
      group.LineItems?.some((item) => item.LineItemExpenseFields?.length)
    )
  ) as TextractPageWithLineItems[];

  return pagesWithItems[pagesWithItems.length - 1];
};

const getLineItems = (
  textractPage: TextractPageWithLineItems
): LineItemFields[] =>
  textractPage.LineItemGroups.flat()
    .map((group) => group.LineItems)
    .flat();

const getStandardisedLineItems = (
  summary: StandardisedLineItemSummary,
  lineItems: LineItemFields[],
  vendorServiceConfigRows: ConfigServicesRow[]
): StandardisedLineItem[] =>
  lineItems.reduce<StandardisedLineItem[]>((acc, item) => {
    const itemFields = item.LineItemExpenseFields as ExpenseField[];
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

      let quantity = getQuantity(itemFields);
      let unitPrice = getUnitPrice(itemFields);

      // Quantity and unit-price fields are sometimes wrong, and correct data are sometimes in description instead
      if (
        itemDescription !== undefined &&
        quantity === 1 &&
        unitPrice !== undefined &&
        unitPrice >= 100
      ) {
        const descriptionData = getDescriptionData(itemDescription);

        if (descriptionData !== undefined)
          ({ quantity, unitPrice } = descriptionData);
      }

      nextAcc = [
        ...nextAcc,
        {
          ...summary,
          event_name: eventName,
          item_description: itemDescription,
          price: getPrice(itemFields),
          quantity,
          service_name: serviceName,
          contract_id: contractId,
          unit_price: unitPrice,
        },
      ];
    }
    return nextAcc;
  }, []);
