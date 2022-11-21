import { SQSEvent, SQSRecord } from "aws-lambda";
import { Textract } from "aws-sdk";
import { VALID_TEXTRACT_STATUS_MESSAGES } from "../../shared/constants";
import {
  BatchItemResponse,
  ValidTextractStatusMessage,
} from "../../shared/types";
import { moveS3 } from "../../shared/utils";

export const handler = async (event: SQSEvent): Promise<BatchItemResponse> => {
  const storageBucket = process.env.STORAGE_BUCKET;

  if (storageBucket === undefined || storageBucket.length === 0)
    throw new Error("Storage bucket name not set.");

  const response: BatchItemResponse = { batchItemFailures: [] };

  const promises = event.Records.map(async (record) => {
    try {
      await storeData(record, storageBucket);
    } catch (e) {
      response.batchItemFailures.push({ itemIdentifier: record.messageId });
    }
  });

  await Promise.all(promises);
  return response;
};

const isValidStatusMessage = (
  message?: string
): message is ValidTextractStatusMessage =>
  VALID_TEXTRACT_STATUS_MESSAGES.has(message as ValidTextractStatusMessage);

async function storeData(record: SQSRecord, bucketName: string): Promise<void> {
  const bodyObject = JSON.parse(record.body);
  const { JobId: jobId } = bodyObject;
  if (typeof jobId !== "string") throw new Error("No valid job ID in record.");

  let paginationToken: string | undefined;
  let statusMessage: ValidTextractStatusMessage | undefined;
  do {
    const textract = new Textract();

    const params = {
      JobId: jobId,
      NextToken: paginationToken,
    };

    const response = await textract.getExpenseAnalysis(params).promise();

    paginationToken = response.NextToken;

    if (
      !isValidStatusMessage(response.StatusMessage) ||
      (typeof statusMessage === "string" &&
        response.StatusMessage !== statusMessage)
    )
      throw new Error("Invalid job status.");

    statusMessage = response.StatusMessage;

    if (response.Warnings !== undefined)
      for (const responseWarning of response.Warnings)
        if (responseWarning !== undefined) {
          const { ErrorCode: code, Pages: pageNumbers } = responseWarning;

          let warningMessage = "Warning";

          if (code !== undefined)
            warningMessage = `${warningMessage} code ${code}`;

          if (pageNumbers !== undefined) {
            const pagesText = pageNumbers.map(String).join(", ");
            warningMessage = `${warningMessage} for pages ${pagesText}`;
          }

          console.warn(warningMessage);
        }
    // TODO: get Textract data
  } while (paginationToken !== undefined);

  const fileName = "some-file-name.pdf"; // TODO: get real file name somehow
  const folderName = statusMessage === "SUCCEEDED" ? "successful" : "failed";
  await moveS3(bucketName, fileName, `${folderName}/${fileName}`);

  // TODO: store Textract data
}
