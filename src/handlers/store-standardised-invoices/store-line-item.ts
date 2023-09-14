import { SQSRecord } from "aws-lambda";
import path from "path";
import {
  getStandardisedInvoiceKey,
  LineItemFieldsForNaming,
  listS3Keys,
  logger,
  moveToFolderS3,
  putTextS3,
} from "../../shared/utils";
import { StandardisedLineItemSummary } from "../../shared/types";
import { RAW_INVOICE_TEXTRACT_DATA_FOLDER_SUCCESS } from "../../shared/constants";
import { resourcePrefix } from "../int-test-support/helpers/envHelper";

export async function storeLineItem(
  record: SQSRecord,
  destinationBucket: string,
  destinationFolder: string,
  archiveFolder: string,
  rawInvoiceBucket: string
): Promise<void> {
  let bodyObject;
  try {
    bodyObject = JSON.parse(record.body);
  } catch {
    throw new Error("Record body not valid JSON.");
  }

  if (!isNameable(bodyObject))
    throw new Error(
      "Event record body is not object with valid fields for generating a file name."
    );

  if (!isStandardisedLineItemSummary(bodyObject))
    throw new Error(
      "Event record body is not object with valid fields for generating a file name."
    );

  const [itemKey, itemKeyPrefix] = getStandardisedInvoiceKey(
    destinationFolder,
    bodyObject
  );
  const staleItemKeys = await listS3Keys(destinationBucket, itemKeyPrefix);
  logger.info(`Putting text to ${destinationBucket} ${itemKey}`);
  await putTextS3(destinationBucket, itemKey, record.body);

  const archivePromises = staleItemKeys.map(
    async (key) => await moveToFolderS3(destinationBucket, key, archiveFolder)
  );

  await Promise.all(archivePromises);

  const sourceKey = `${bodyObject.vendor_id}/${bodyObject.originalInvoiceFile}`;
  const destinationKey = `${RAW_INVOICE_TEXTRACT_DATA_FOLDER_SUCCESS}/${sourceKey}`;
  const successfulRawInvoiceFolder = path.dirname(destinationKey);

  logger.info(
    `moving ${rawInvoiceBucket}/${sourceKey} to ${rawInvoiceBucket}/${successfulRawInvoiceFolder}/${bodyObject.originalInvoiceFile}`
  );

  await moveToFolderS3(rawInvoiceBucket, sourceKey, successfulRawInvoiceFolder);
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
  isNameable(x) &&
  "invoice_receipt_id" in x &&
  typeof x.invoice_receipt_id === "string" &&
  "total" in x &&
  typeof x.total === "number" &&
  "invoice_receipt_date" in x &&
  typeof x.invoice_receipt_date === "string" &&
  "parser_version" in x &&
  typeof x.parser_version === "string" &&
  "originalInvoiceFile" in x &&
  typeof x.originalInvoiceFile === "string";
