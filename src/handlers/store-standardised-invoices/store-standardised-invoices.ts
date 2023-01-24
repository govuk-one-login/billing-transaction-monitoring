import { SQSRecord } from "aws-lambda";
import { getS3EventRecords, putTextS3 } from "../../shared/utils";
import { fetchS3TextractData } from "./fetch-s3-textract-data";
import { getStandardisedInvoice } from "./get-standardised-invoice";

export async function storeStandardisedInvoices(
  queueRecord: SQSRecord,
  destinationBucket: string,
  destinationFolder: string
): Promise<void> {
  const storageRecords = getS3EventRecords(queueRecord);

  const promises = storageRecords.map(async (storageRecord) => {
    const sourceBucket = storageRecord.s3.bucket.name;
    const sourceFilePath = storageRecord.s3.object.key;

    // Source file must be in folder, which determines vendor. Throw error otherwise.
    const sourcePathParts = sourceFilePath.split("/");
    if (sourcePathParts.length < 2)
      throw Error(
        `File not in vendor folder: ${sourceBucket}/${sourceFilePath}`
      );

    const vendorFolder = sourcePathParts[0];
    const sourceFileName = sourcePathParts[sourcePathParts.length - 1];

    const textractData = await fetchS3TextractData(
      sourceBucket,
      sourceFilePath
    );

    const standardisedInvoice = getStandardisedInvoice(
      textractData,
      vendorFolder
    );

    // Convert line items to new-line-separated JSON object text, to work with Glue/Athena.
    const standardisedInvoiceText = standardisedInvoice
      .map((lineItem) => JSON.stringify(lineItem))
      .join("\n");

    // Since that text block is not valid JSON, use a file extension that is not `.json`.
    const destinationFileName = sourceFileName.replace(/\.json$/g, ".txt");

    await putTextS3(
      destinationBucket,
      `${destinationFolder}/${destinationFileName}`,
      standardisedInvoiceText
    );
  });

  await Promise.all(promises);
}
