import {SQSEvent, SQSRecord} from 'aws-lambda';
import AWS from 'aws-sdk';

const ddb = new AWS.DynamoDB.DocumentClient({endpoint: process.env.STORAGE_ENDPOINT});
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

  const params = {
    TableName: process.env.STORAGE_TABLE,
    Item: JSON.parse(record.body),
  };

  return new Promise((resolve, reject) => {
    ddb.put(params, (err: any, data: any) => {
      if (err) {
        console.error(err, err.stack);
        reject();
      } else {
        console.log(data);
        resolve('success');
      }
    });
  });
}

