import {SQSEvent, SQSRecord} from 'aws-lambda';
import AWS from 'aws-sdk';


let VALID_EVENT_NAMES = new Set<string>([
  'EVENT_1',
  'EVENT_2',
  'EVENT_3',
  'EVENT_4',
  'EVENT_5',
  'EVENT_6',
  'EVENT_7',
  'EVENT_8'
]);

const sqs = new AWS.SQS({apiVersion: '2012-11-05'});
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
      console.log('Got record');
      try {
        await sendRecord(record);
      } catch (e) {
        response.batchItemFailures.push({itemIdentifier: record.messageId});
      }
    });

  await Promise.all(promises);
  return response;
}

async function sendRecord(record: SQSRecord) {
  console.log('sending record ' + JSON.stringify(record));

  if (!process.env.OUTPUT_QUEUE_URL) {
    const message = "Output queue URL not set.";
    console.error(message);
    throw new Error(message);
  }

  const params = {
    MessageBody: JSON.stringify(record),
    QueueUrl: process.env.OUTPUT_QUEUE_URL
  };

  return new Promise((resolve, reject) => {
    sqs.sendMessage(params, function (err: any, data: any) {
      if (err) {
        console.error(err, err.stack); // an error occurred
        reject();
      } else {
        console.log(data);           // successful response
        resolve('success');
      }
    });
  });
}

