import {SQSEvent} from 'aws-lambda';
import {VALID_EVENT_NAMES} from '../../shared/constants';
import {sendRecord} from '../../shared/utils';

type Response = { batchItemFailures: { itemIdentifier: string }[] };

export const handler = async (event: SQSEvent) => {

  const response: Response = {batchItemFailures: []};

  const promises = event.Records
    .filter(record => {
      const body = JSON.parse(record.body);
      console.log(body.event_name);
      return body && body.event_name && VALID_EVENT_NAMES.has(body.event_name);
    })
    .map(async record => {
      console.log('record ' + record);
      try {
        if (!process.env.OUTPUT_QUEUE_URL) {
          const message = "Output queue URL not set.";
          console.error(message);
          throw new Error(message);
        }

        await sendRecord(process.env.OUTPUT_QUEUE_URL, record);
      } catch (e) {
        response.batchItemFailures.push({itemIdentifier: record.messageId});
      }
    });

  await Promise.all(promises);
  return response;
}
