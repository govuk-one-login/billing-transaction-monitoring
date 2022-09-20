

import { APIGatewayEvent, APIGatewayProxyResult, APIGatewayProxyCallback, Context } from 'aws-lambda'



export const handler = async (event: APIGatewayEvent, context: Context, callback: APIGatewayProxyCallback) /*: Promise<APIGatewayProxyResult> */ => {

  //const sns = new SNS({ apiVersion: '2010-03-31' });

  // //let promises = [];
  // let validTypes = new Set<string>(['type1']);

  // for (const record of event.Records) {
  //   // console.log(record);
  //   const body = json.parse(record.body);
  //   // console.log(body);
  //   if (body && body.type && validTypes.has(body.type)) {
  //     console.log('Keeping message of type ${body.type}');

  //   }
  // }
  // return {
  //   statusCode: 200,
  //   body: JSON.stringify({
  //     message: 'processed'
  //   })
  // }
}
