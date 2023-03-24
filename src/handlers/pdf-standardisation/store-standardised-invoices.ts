import { SQSRecord } from "aws-lambda";
import {
  getS3EventRecordsFromSqs,
  getStandardisedInvoiceFileName,
  putTextS3,
} from "../../shared/utils";
import { fetchS3TextractData } from "./fetch-s3-textract-data";
import { getStandardisedInvoice } from "./get-standardised-invoice";

export async function storeStandardisedInvoices(
  queueRecord: SQSRecord,
  destinationBucket: string,
  destinationFolder: string,
  configBucket: string,
  parserVersions: Record<string, string>
): Promise<void> {
  const storageRecords = getS3EventRecordsFromSqs(queueRecord);

  const promises = storageRecords.map(async (storageRecord) => {
    const sourceBucket = storageRecord.s3.bucket.name;
    const sourceFilePath = storageRecord.s3.object.key;

    // Source file must be in folder, which determines vendor ID. Throw error otherwise.
    const sourcePathParts = sourceFilePath.split("/");
    if (sourcePathParts.length < 2)
      throw Error(
        `File not in vendor ID folder: ${sourceBucket}/${sourceFilePath}`
      );

    const vendorId = sourcePathParts[0];
    const sourceFileName = sourcePathParts[sourcePathParts.length - 1];

    const originalInvoiceFileName = sourceFileName.replace(/\.json$/g, ".pdf");

    const textractData = await fetchS3TextractData(
      sourceBucket,
      sourceFilePath
    );
    const standardisedInvoice = await getStandardisedInvoice(
      textractData,
      vendorId,
      configBucket,
      parserVersions,
      originalInvoiceFileName
    );

    for (const item of standardisedInvoice) {
      const fileName = getStandardisedInvoiceFileName(item);
      const standardisedInvoiceText = JSON.stringify(item);
      // Storage will be moved to a new lambda as part of BTM-466
      await putTextS3(
        destinationBucket,
        `${destinationFolder}/${fileName}`,
        standardisedInvoiceText
      );
    }
  });

  await Promise.all(promises);
}
