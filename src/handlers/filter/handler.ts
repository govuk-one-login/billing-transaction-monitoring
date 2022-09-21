

import { APIGatewayEvent, APIGatewayProxyResult, APIGatewayProxyCallback, Context, SQSEvent } from 'aws-lambda'



export const handler = async (event: SQSEvent) /*: Promise<APIGatewayProxyResult> */ => {

  //const sqs = new SQS({ apiVersion: '2010-03-31' });

  //let promises = [];
  let validTypes = new Set<string>(['type1']);

  for (const record of event.Records) {
    // console.log(record);
    const body = JSON.parse(record.body);
    // console.log(body);
    if (body && body.type && validTypes.has(body.type)) {
      console.log('Keeping message of type ${body.type}');
    }
  }
  return {
    statusCode: 200,
    body: JSON.stringify({
      message: 'processed'
    })
  }
}
