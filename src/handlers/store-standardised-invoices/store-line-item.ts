import { SQSRecord } from "aws-lambda";
import {
  getStandardisedInvoiceFileName,
  getStandardisedInvoiceKey,
  LineItemFieldsForNaming,
  putTextS3,
} from "../../shared/utils";

export async function storeLineItem(
  record: SQSRecord,
  bucket: string,
  folder: string
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

  await putTextS3(
    bucket,
    getStandardisedInvoiceKey(folder, bodyObject),
    record.body
  );

  // TODO The legacy storage location.  This will go away with BTM-486.
  await putTextS3(
    bucket,
    `${folder}/${getStandardisedInvoiceFileName(bodyObject)}`,
    record.body
  );
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
