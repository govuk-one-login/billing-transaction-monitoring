import { SQSEvent } from "aws-lambda";
import { Response, StandardisedLineItem } from "../../shared/types";
import { getFromEnv, logger, moveToFolderS3 } from "../../shared/utils";
import { storeLineItem } from "./store-line-item";
import path from "path";
import { RAW_INVOICE_TEXTRACT_DATA_FOLDER_SUCCESS } from "../../shared/constants";

export const handler = async (event: SQSEvent): Promise<Response> => {
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
  for (const record of event.Records) {
    if (!record?.body) {
      throw new Error("Record contains no body");
    }
    const recordBody: StandardisedLineItem[] = JSON.parse(record.body);
    const recordItemFailures: Array<{ itemIdentifier: string }> = [];

    const promises = recordBody.map(async (line) =>
      await processLines(
        line,
        destinationBucket,
        destinationFolder,
        archiveFolder,
        recordItemFailures
      )
    );

    await Promise.all(promises);

    await moveSuccessful(
      recordItemFailures,
      recordBody[0],
      rawInvoiceBucket,
      response
    );
  }
  return response;
};

const moveSuccessful = async (
  recordItemFailures: Array<{ itemIdentifier: string }>,
  recordEntry: StandardisedLineItem,
  rawInvoiceBucket: string,
  response: Response
): Promise<void> => {
  if (recordItemFailures.length === 0) {
    const sourceKey = `${recordEntry.vendor_id}/${recordEntry.originalInvoiceFile}`;
    const destinationKey = `${RAW_INVOICE_TEXTRACT_DATA_FOLDER_SUCCESS}/${sourceKey}`;
    const successfulRawInvoiceFolder = path.dirname(destinationKey);

    logger.info(
      `moving ${rawInvoiceBucket}/${sourceKey} to ${rawInvoiceBucket}/${successfulRawInvoiceFolder}/${recordEntry.originalInvoiceFile}`
    );

    await moveToFolderS3(
      rawInvoiceBucket,
      sourceKey,
      successfulRawInvoiceFolder
    );
  } else {
    response.batchItemFailures =
      response.batchItemFailures.concat(recordItemFailures);
  }
};

const processLines = async (
  recordEntry: StandardisedLineItem,
  destinationBucket: string,
  destinationFolder: string,
  archiveFolder: string,
  recordItemFailures: Array<{ itemIdentifier: string }>
): Promise<void> => {
  try {
    await storeLineItem(
      recordEntry,
      destinationBucket,
      destinationFolder,
      archiveFolder
    );
  } catch (error) {
    logger.error(`Handler failure for ${JSON.stringify(recordEntry)}`, {
      error,
    });
    recordItemFailures.push({
      itemIdentifier: JSON.stringify(recordEntry),
    });
  }
};
