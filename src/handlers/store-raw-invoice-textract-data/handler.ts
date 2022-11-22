import { SQSEvent } from "aws-lambda";
import { BatchItemResponse } from "../../shared/types";
import { storeExpenseDocuments } from "./store-expense-documents";

export const handler = async (event: SQSEvent): Promise<BatchItemResponse> => {
  const pdfBucket = process.env.PDF_BUCKET;
  const textractBucket = process.env.TEXTRACT_BUCKET;

  if (pdfBucket === undefined || pdfBucket.length === 0)
    throw new Error("PDF bucket not set.");

  if (textractBucket === undefined || textractBucket.length === 0)
    throw new Error("Textract bucket not set.");

  const response: BatchItemResponse = { batchItemFailures: [] };

  const promises = event.Records.map(async (record) => {
    try {
      await storeExpenseDocuments(record, pdfBucket, textractBucket);
    } catch (e) {
      response.batchItemFailures.push({ itemIdentifier: record.messageId });
    }
  });

  await Promise.all(promises);
  return response;
};
