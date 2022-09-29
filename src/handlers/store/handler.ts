import {SQSEvent, SQSRecord} from 'aws-lambda';
import AWS from 'aws-sdk';

const ddb = new AWS.DynamoDB.DocumentClient();
type Response = { batchItemFailures: { itemIdentifier: string }[] };

export const handler = async (event: SQSEvent) => {
  const response: Response = {batchItemFailures: []};

  const promises = event.Records
      .map(async record => {
        try {
          await storeRecord(record);
        } catch (e) {
          const body = JSON.parse(record.body);
          response.batchItemFailures.push({itemIdentifier: body.messageId});
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
    Item: record,
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

