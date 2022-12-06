import { SQSEvent } from "aws-lambda";
import { Response } from "../../shared/types";
import { storeExpenseDocuments } from "./store-expense-documents";

export const handler = async (event: SQSEvent): Promise<Response> => {
  const destinationBucket = process.env.DESTINATION_BUCKET;

  if (destinationBucket === undefined || destinationBucket.length === 0)
    throw new Error("Destination bucket not set.");

  const response: Response = { batchItemFailures: [] };

  const promises = event.Records.map(async (record) => {
    try {
      await storeExpenseDocuments(record, destinationBucket);
    } catch (e) {
      console.error(e);
      response.batchItemFailures.push({ itemIdentifier: record.messageId });
    }
  });

  await Promise.all(promises);
  return response;
};
