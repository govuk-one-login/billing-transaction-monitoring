import { Textract } from "aws-sdk";
import { VendorServiceConfigRows } from "../../../shared/utils";
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

interface TextractLineItemGroupWithLineItems extends Textract.LineItemGroup {
  LineItems: TextractLineItemWithFields[];
}

interface TextractLineItemWithFields extends Textract.LineItemFields {
  LineItemExpenseFields: Textract.ExpenseField[];
}

interface TextractPageWithLineItems extends Textract.ExpenseDocument {
  LineItemGroups: TextractLineItemGroupWithLineItems[];
}

export const getStandardisedInvoice0: StandardisationModule = (
  allTextractPages: Textract.ExpenseDocument[],
  vendorServiceConfigRows: VendorServiceConfigRows
): StandardisedLineItem[] => {
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

  const summary = {
    invoice_receipt_id: getInvoiceReceiptId(summaryFields),
    vendor_id: vendorServiceConfigRows[0].vendor_id,
    vendor_name: vendorServiceConfigRows[0].vendor_name,
    total: getTotal(summaryFields),
    invoice_receipt_date: getInvoiceReceiptDate(summaryFields),
    subtotal: getSubtotal(summaryFields),
    due_date: getDueDate(summaryFields),
    tax: getTax(summaryFields),
    tax_payer_id: getTaxPayerId(summaryFields),
  };

  return lineItems.reduce<StandardisedLineItem[]>((acc, item) => {
    const itemFields = item.LineItemExpenseFields as Textract.ExpenseField[];
    let nextAcc = [...acc];
    for (const {
      service_name: serviceName,
      service_regex: serviceRegexPattern,
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
          item_description: itemDescription,
          price: getPrice(itemFields),
          quantity,
          service_name: serviceName,
          unit_price: unitPrice,
        },
      ];
    }
    return nextAcc;
  }, []);
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
  textractPages: Textract.ExpenseDocument[]
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
): Textract.LineItemFields[] =>
  textractPage.LineItemGroups.flat()
    .map((group) => group.LineItems)
    .flat();
