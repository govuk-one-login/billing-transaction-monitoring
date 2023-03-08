import { SQSRecord } from "aws-lambda";
import { getS3EventRecordsFromSqs, putTextS3 } from "../../shared/utils";
import { fetchS3CsvData } from "./fetch-s3-csv-data";
import { getStandardisedInvoice } from "./get-standardised-invoice/get-standardised-invoice";

export async function storeStandardisedInvoices(
  queueRecord: SQSRecord,
  destinationBucket: string,
  destinationFolder: string,
  configBucket: string
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

    console.log(
      `fetching Textract Data from  ${sourceBucket}/${sourceFilePath}`
    );
    const textractData = await fetchS3CsvData(
      sourceBucket,
      sourceFilePath
    );
    console.log("fetched Textract data successfully");

    console.log(`Standardising invoice`);
    const standardisedInvoice = await getStandardisedInvoice(
      textractData,
      vendorId,
      configBucket
    );
    console.log(`Standardised invoice successfully`);

    // Convert line items to new-line-separated JSON object text, to work with Glue/Athena.
    const standardisedInvoiceText = standardisedInvoice
      .map((lineItem) => JSON.stringify(lineItem))
      .join("\n");

    // Since that text block is not valid JSON, use a file extension that is not `.json`.
    const destinationFileName = sourceFileName.replace(/\.json$/g, ".txt");

    console.log(
      `putting standardised invoice to S3 at ${destinationFolder}/${destinationFileName}`
    );
    await putTextS3(
      destinationBucket,
      `${destinationFolder}/${destinationFileName}`,
      standardisedInvoiceText
    );
    console.log(`put ${destinationFolder}/${destinationFileName} successfully`);
  });

  await Promise.all(promises);
}
