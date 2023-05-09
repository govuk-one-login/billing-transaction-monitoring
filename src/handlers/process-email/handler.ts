import { SQSEvent } from "aws-lambda";
import { logger } from "../../shared/utils";

export const handler = async (event: SQSEvent): Promise<void> => {
  // Placeholder lambda function
  const destinationBucket = process.env.DESTINATION_BUCKET;
  if (destinationBucket === undefined || destinationBucket.length === 0)
    throw new Error("Destination bucket not set.");

  logger.info(`Process Email: ${event.Records[0].body}`);
};
