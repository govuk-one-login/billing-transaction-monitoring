import { SQSRecord } from "aws-lambda";
import {
  getStandardisedInvoiceFileName,
  getStandardisedInvoiceKey,
  LineItemFieldsForNaming,
  listS3Keys,
  moveToFolderS3,
  putTextS3,
} from "../../shared/utils";

export async function storeLineItem(
  record: SQSRecord,
  bucket: string,
  destinationFolder: string,
  legacyDestinationFolder: string,
  archiveFolder: string
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

  const [itemKey, itemKeyPrefix] = getStandardisedInvoiceKey(
    destinationFolder,
    bodyObject
  );
  const staleItemKeys = await listS3Keys(bucket, itemKeyPrefix);

  await putTextS3(bucket, itemKey, record.body);

  // TODO The legacy storage location.  This will go away with BTM-486.
  await putTextS3(
    bucket,
    `${legacyDestinationFolder}/${getStandardisedInvoiceFileName(bodyObject)}`,
    record.body
  );

  const archivePromises = staleItemKeys.map(
    async (key) => await moveToFolderS3(bucket, key, archiveFolder)
  );

  await Promise.all(archivePromises);
}

const isNameable = (x: unknown): x is LineItemFieldsForNaming =>
  typeof x === "object" &&
  x !== null &&
  "event_name" in x &&
  typeof x.event_name === "string" &&
  "invoice_receipt_date" in x &&
  typeof x.invoice_receipt_date === "string" &&
  "vendor_id" in x &&
  typeof x.vendor_id === "string";
