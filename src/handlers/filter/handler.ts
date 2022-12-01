import { SQSEvent } from "aws-lambda";
import { VALID_EVENT_NAMES } from "../../shared/constants";
import { Response } from "../../shared/types";
import { sendRecord } from "../../shared/utils";

export const handler = async (event: SQSEvent): Promise<Response> => {
  const response: Response = { batchItemFailures: [] };

  const promises = event.Records.filter((record) => {
    const body = JSON.parse(record.body);
    console.log(body.event_name);
    return Boolean(body?.event_name) && VALID_EVENT_NAMES.has(body.event_name);
  }).map(async (record) => {
    console.log(`record ${JSON.stringify(record)}`);
    try {
      if (
        process.env.OUTPUT_QUEUE_URL === undefined ||
        process.env.OUTPUT_QUEUE_URL.length === 0
      ) {
        const message = "Output queue URL not set.";
        console.error(message);
        throw new Error(message);
      }

      await sendRecord(process.env.OUTPUT_QUEUE_URL, record.body);
    } catch (e) {
      response.batchItemFailures.push({ itemIdentifier: record.messageId });
    }
  });

  await Promise.all(promises);
  return response;
};
