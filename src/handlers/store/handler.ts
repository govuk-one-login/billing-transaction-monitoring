import {SQSEvent, SQSRecord} from 'aws-lambda';
import {putS3} from '../../shared/utils';

type Response = { batchItemFailures: { itemIdentifier: string }[] };

export const handler = async (event: SQSEvent) => {
  const response: Response = {batchItemFailures: []};

  const promises = event.Records
      .map(async record => {
        try {
          await storeRecord(record);
        } catch (e) {
          response.batchItemFailures.push({itemIdentifier: record.messageId});
        }
      });

  await Promise.all(promises);
  return response;
}

async function storeRecord(record: SQSRecord) {
  console.log('storing record ' + JSON.stringify(record));
  const bodyObject = JSON.parse(record.body);

  if (!process.env.STORAGE_BUCKET) {
    const message = "Storage bucket name not set.";
    console.error(message);
    throw new Error(message);
  }

  const date = new Date(bodyObject.timestamp);
  const key = `event_name=${bodyObject.event_name}/year=${date.getUTCFullYear()}/month=${date.getUTCMonth() + 1}/day=${date.getUTCDate()}/event_id=${bodyObject.event_id}`;

  return putS3(process.env.STORAGE_BUCKET, key, JSON.parse(record.body));
}

