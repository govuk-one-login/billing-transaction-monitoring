import {SQSEvent, SQSRecord} from 'aws-lambda';
import AWS from 'aws-sdk';


let VALID_EVENT_NAMES = new Set<string>([
  'IPV_PASSPORT_CRI_REQUEST_SENT',
  'IPV_PASSPORT_CRI_RESPONSE_RECEIVED',
  'IPV_FRAUD_CRI_REQUEST_SENT',
  'IPV_FRAUD_CRI_THIRD_PARTY_REQUEST_ENDED',
  'IPV_ADDRESS_CRI_REQUEST_SENT',
  'IPV_ADDRESS_CRI_END',
  'IPV_KBV_CRI_REQUEST_SENT',
  'IPV_KBV_CRI_THIRD_PARTY_REQUEST_ENDED'
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

  const params = {
    MessageBody: JSON.stringify(record),
    QueueUrl: 'STRING_VALUE', // TODO how to wire this in?
  };

  return new Promise((resolve, reject) => {
    sqs.sendMessage(params, function (err: any, data: any) {
      if (err) {
        console.log(err, err.stack); // an error occurred
        reject();
      } else {
        console.log(data);           // successful response
        resolve('success');
      }
    });
  });
}

