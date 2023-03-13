import { SQSEvent } from "aws-lambda";
import { logger } from "../../shared/utils";

export const handler = async (event: SQSEvent): Promise<void> => {
  // Placeholder lambda function
  logger.info(event.Records[0].body);
};
