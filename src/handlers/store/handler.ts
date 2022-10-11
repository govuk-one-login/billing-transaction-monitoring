import {SQSEvent, SQSRecord} from 'aws-lambda';
import {put} from '../../shared/utils';

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

  if (!process.env.STORAGE_TABLE) {
    const message = "Storage table name not set.";
    console.error(message);
    throw new Error(message);
  }

  return put(process.env.STORAGE_TABLE, JSON.parse(record.body));
}

