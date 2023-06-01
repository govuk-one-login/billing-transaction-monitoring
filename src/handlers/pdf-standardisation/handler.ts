import { SQSEvent } from "aws-lambda";
import { Response } from "../../shared/types";
import { logger } from "../../shared/utils";
import { sendStandardisedLineItems } from "./send-standardised-line-items";

export const handler = async (event: SQSEvent): Promise<Response> => {
  const configBucket = process.env.CONFIG_BUCKET;

  if (configBucket === undefined || configBucket.length === 0)
    throw new Error("Config bucket not set.");

  const outputQueueUrl = process.env.OUTPUT_QUEUE_URL;

  if (outputQueueUrl === undefined || outputQueueUrl.length === 0)
    throw new Error("Output queue URL not set.");

  const parser0Version = process.env.PARSER_0_VERSION;

  if (parser0Version === undefined || parser0Version.length === 0)
    throw new Error("Parser 0 version not set.");

  const defaultParserVersion = process.env.PARSER_DEFAULT_VERSION;

  if (defaultParserVersion === undefined || defaultParserVersion.length === 0)
    throw new Error("Default parser version not set.");

  const response: Response = { batchItemFailures: [] };

  const promises = event.Records.map(async (record) => {
    try {
      await sendStandardisedLineItems(record, outputQueueUrl, configBucket, {
        0: `0_${parser0Version}`,
        default: `default_${defaultParserVersion}`,
      });
    } catch (error) {
      logger.error("Handler failure", { error });
      response.batchItemFailures.push({ itemIdentifier: record.messageId });
    }
  });

  await Promise.all(promises);
  return response;
};
