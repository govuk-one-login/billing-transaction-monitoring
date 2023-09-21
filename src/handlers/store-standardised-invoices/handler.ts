import { SQSEvent } from "aws-lambda";
import { Response, StandardisedLineItem } from "../../shared/types";
import { getFromEnv, logger, moveToFolderS3 } from "../../shared/utils";
import { storeLineItem } from "./store-line-item";
import path from "path";
import { RAW_INVOICE_TEXTRACT_DATA_FOLDER_SUCCESS } from "../../shared/constants";

export const handler = async (event: SQSEvent): Promise<Response> => {
  const records: StandardisedLineItem[] = JSON.parse(event.Records[0].body);
  const archiveFolder = getFromEnv("ARCHIVE_FOLDER");

  if (archiveFolder === undefined || archiveFolder.length === 0)
    throw new Error("Archive folder not set.");

  const destinationBucket = getFromEnv("DESTINATION_BUCKET");

  if (destinationBucket === undefined || destinationBucket.length === 0)
    throw new Error("Destination bucket not set.");

  const destinationFolder = getFromEnv("DESTINATION_FOLDER");

  if (destinationFolder === undefined || destinationFolder.length === 0)
    throw new Error("Destination folder not set.");

  const rawInvoiceBucket = getFromEnv("RAW_INVOICE_BUCKET");

  if (rawInvoiceBucket === undefined || rawInvoiceBucket.length === 0)
    throw new Error("Raw invoice bucket not set.");

  const response: Response = { batchItemFailures: [] };

  const promises = records.map(async (record) => {
    try {
      await storeLineItem(
        record,
        destinationBucket,
        destinationFolder,
        archiveFolder
      );
    } catch (error) {
      logger.error(`Handler failure for ${JSON.stringify(record)}`, { error });
      response.batchItemFailures.push({
        itemIdentifier: record.item_id
          ? record.item_id.toLocaleString()
          : JSON.stringify(record),
      });
    }
  });

  await Promise.all(promises);

  const firstRecord = records[0];
  const sourceKey = `${firstRecord.vendor_id}/${firstRecord.originalInvoiceFile}`;
  const destinationKey = `${RAW_INVOICE_TEXTRACT_DATA_FOLDER_SUCCESS}/${sourceKey}`;
  const successfulRawInvoiceFolder = path.dirname(destinationKey);

  logger.info(
    `moving ${rawInvoiceBucket}/${sourceKey} to ${rawInvoiceBucket}/${successfulRawInvoiceFolder}/${firstRecord.originalInvoiceFile}`
  );

  await moveToFolderS3(rawInvoiceBucket, sourceKey, successfulRawInvoiceFolder);

  return response;
};
