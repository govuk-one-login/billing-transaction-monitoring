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

    const promises = recordBody.map(async (line) => {
      try {
        await storeLineItem(
          line,
          destinationBucket,
          destinationFolder,
          archiveFolder
        );
      } catch (error) {
        logger.error(`Handler failure for ${JSON.stringify(line)}`, { error });
        recordItemFailures.push({
          itemIdentifier: JSON.stringify(line),
        });
      }
    });

    await Promise.all(promises);

    if (recordItemFailures.length === 0) {
      const firstRecord = recordBody[0];
      const sourceKey = `${firstRecord.vendor_id}/${firstRecord.originalInvoiceFile}`;
      const destinationKey = `${RAW_INVOICE_TEXTRACT_DATA_FOLDER_SUCCESS}/${sourceKey}`;
      const successfulRawInvoiceFolder = path.dirname(destinationKey);

      logger.info(
        `moving ${rawInvoiceBucket}/${sourceKey} to ${rawInvoiceBucket}/${successfulRawInvoiceFolder}/${firstRecord.originalInvoiceFile}`
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
  }
  return response;
};
