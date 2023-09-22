import {
  getStandardisedInvoiceKey,
  LineItemFieldsForNaming,
  listS3Keys,
  moveToFolderS3,
  putTextS3,
} from "../../shared/utils";
import { StandardisedLineItemSummary } from "../../shared/types";

export async function storeLineItem(
  record: StandardisedLineItemSummary,
  destinationBucket: string,
  destinationFolder: string,
  archiveFolder: string
): Promise<void> {
  if (!isNameable(record))
    throw new Error(
      "Event record body is not object with valid fields for generating a file name."
    );

  if (!isStandardisedLineItemSummary(record))
    throw new Error(
      "Event record body is not object with valid fields for generating a file name."
    );

  const [itemKey, itemKeyPrefix] = getStandardisedInvoiceKey(
    destinationFolder,
    record
  );

  const staleItemKeys = await listS3Keys(destinationBucket, itemKeyPrefix);
  await putTextS3(destinationBucket, itemKey, JSON.stringify(record));

  const archivePromises = staleItemKeys.map(
    async (key) => await moveToFolderS3(destinationBucket, key, archiveFolder)
  );

  await Promise.all(archivePromises);
}

const isNameable = (x: unknown): x is LineItemFieldsForNaming =>
  typeof x === "object" &&
  x !== null &&
  "event_name" in x &&
  typeof x.event_name === "string" &&
  "invoice_period_start" in x &&
  typeof x.invoice_period_start === "string" &&
  "invoice_is_quarterly" in x &&
  typeof x.invoice_is_quarterly === "boolean" &&
  "vendor_id" in x &&
  typeof x.vendor_id === "string";

const isStandardisedLineItemSummary = (
  x: unknown
): x is StandardisedLineItemSummary =>
  typeof x === "object" &&
  x !== null &&
  "originalInvoiceFile" in x &&
  typeof x.originalInvoiceFile === "string";
