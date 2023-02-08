import { SQSEvent } from "aws-lambda";
import { Response } from "../../shared/types";
import { sendRecord } from "../../shared/utils";
import { fetchEventNames } from "../../shared/utils/config-utils/fetch-event-names";

export const handler = async (event: SQSEvent): Promise<Response> => {
  const outputQueueUrl = process.env.OUTPUT_QUEUE_URL;
  if (outputQueueUrl === undefined || outputQueueUrl.length === 0)
    throw new Error("No OUTPUT_QUEUE_URL defined in this environment");

  const response: Response = { batchItemFailures: [] };

  const validEventNames = await fetchEventNames();

  const promises = event.Records.filter((record) => {
    const body = JSON.parse(record.body);
    console.log(body.event_name);
    return Boolean(body?.event_name) && validEventNames.has(body.event_name);
  }).map(async (record) => {
    console.log(`record ${JSON.stringify(record)}`);
    try {
      await sendRecord(outputQueueUrl, record.body);
    } catch (e) {
      response.batchItemFailures.push({ itemIdentifier: record.messageId });
    }
  });

  await Promise.all(promises);
  return response;
};
