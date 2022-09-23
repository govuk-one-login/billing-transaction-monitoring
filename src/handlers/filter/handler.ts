

import { APIGatewayEvent, APIGatewayProxyResult, APIGatewayProxyCallback, Context, SQSEvent, SQSRecord } from 'aws-lambda';
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

const sqs = new AWS.SQS({ apiVersion: '2012-11-05' });
type Response = { batchItemFailures: { itemIdentifier: string }[] };


export const handler = async (event: SQSEvent) /* Promise<APIGatewayProxyResult> */ => {

  const response: Response = { batchItemFailures: [] };

  const promises = event.Records
    .filter(record => {
            const body = JSON.parse(record.body);
            console.log(body.event_name);
            return body && body.event_name && VALID_EVENT_NAMES.has(body.event_name);
        })
    .map(async record => {
        console.log('Got record');
        try {
            await doWork(record);
        } catch (e) {
            response.batchItemFailures.push({ itemIdentifier: record.messageId });
        }
    });

    await Promise.all(promises);
    return response;
}

async function doWork(record: SQSRecord) {
    console.log('sending msg ' + JSON.stringify(record));

    var params = {
      MessageBody: JSON.stringify(record), /* required */
      QueueUrl: 'STRING_VALUE', /* required */
      DelaySeconds: 5,  // TODO had to convert this to a number that I just guessed at
      MessageAttributes: {
        '<String>': {
          DataType: 'STRING_VALUE', /* required */
          BinaryListValues: [
            Buffer.from('...') || 'STRING_VALUE' /* Strings will be Base-64 encoded on your behalf */,
            /* more items */
          ],
          BinaryValue: Buffer.from('...') || 'STRING_VALUE' /* Strings will be Base-64 encoded on your behalf */,
          StringListValues: [
            'STRING_VALUE',
            /* more items */
          ],
          StringValue: 'STRING_VALUE'
        },
        /* '<String>': ... */
      },
      MessageDeduplicationId: 'STRING_VALUE',
      MessageGroupId: 'STRING_VALUE',
      MessageSystemAttributes: {
        '<MessageSystemAttributeNameForSends>': {
          DataType: 'STRING_VALUE', /* required */
          BinaryListValues: [
            Buffer.from('...') || 'STRING_VALUE' /* Strings will be Base-64 encoded on your behalf */,
            /* more items */
          ],
          BinaryValue: Buffer.from('...') || 'STRING_VALUE' /* Strings will be Base-64 encoded on your behalf */,
          StringListValues: [
            'STRING_VALUE',
            /* more items */
          ],
          StringValue: 'STRING_VALUE'
        },
        /* '<MessageSystemAttributeNameForSends>': ... */
      }
    }

    sqs.sendMessage(params, function(err, data) {
          if (err) console.log(err, err.stack); // an error occurred
          else     console.log(data);           // successful response
        });
}

