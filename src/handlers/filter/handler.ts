import { SQSEvent } from "aws-lambda";
import { Response } from "../../shared/types";
import { sendRecord } from "../../shared/utils";
import { fetchEventNames } from "../../shared/utils/config-utils/fetch-event-names";
import { outputQueue } from "../int-test-support/helpers/envHelper";

export const handler = async (event: SQSEvent): Promise<Response> => {
  const response: Response = { batchItemFailures: [] };

  const validEventNames = await fetchEventNames();

  const promises = event.Records.filter((record) => {
    const body = JSON.parse(record.body);
    console.log(body.event_name);
    return Boolean(body?.event_name) && validEventNames.has(body.event_name);
  }).map(async (record) => {
    console.log(`record ${JSON.stringify(record)}`);
    try {
      await sendRecord(outputQueue(), record.body);
    } catch (e) {
      response.batchItemFailures.push({ itemIdentifier: record.messageId });
    }
  });

  await Promise.all(promises);
  return response;
};
