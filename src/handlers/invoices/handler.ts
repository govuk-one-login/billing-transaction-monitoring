import {SQSEvent, SQSRecord} from 'aws-lambda';
// import {putS3, putDDB} from '../../shared/utils';

type Response = { batchItemFailures: { itemIdentifier: string }[] };

export const handler = async (event: SQSEvent) => {
  const response: Response = {batchItemFailures: []};

  const promises = event.Records
    .map(async record => {
      try {
        await callTextract(record);
      } catch (e) {
        response.batchItemFailures.push({itemIdentifier: record.messageId});
      }
    });

  await Promise.all(promises);
  return response;
}

async function callTextract(record: SQSRecord) {
  console.log('calling Textract for file ' + JSON.stringify(record));
  const bodyObject = JSON.parse(record.body);

  console.log(bodyObject);

  // return Promise.all([
  //   putDDB(process.env.STORAGE_TABLE, bodyObject),
  //   putS3(process.env.STORAGE_BUCKET, key, bodyObject)
  // ]);
}

