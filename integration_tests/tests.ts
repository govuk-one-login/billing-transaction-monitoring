// eslint-disable-next-line @typescript-eslint/no-var-requires
const AWS =require('aws-sdk');

AWS.config.update({ region: 'eu-west-2',
                accessKeyId: process.env['AWS_ACCESS_KEY_ID'],
                secretAccessKey: process.env['AWS_SECRET_ACCESS_KEY']})
                const sns = new AWS.SNS();
                const snsTopicARN = process.env['SNSTOPICARN'];
                const TABLE_NAME = process.env['TABLENAME'];


describe('E2E tests',() => {
test('Publish sns message and expect message to reach dynamoDB ', async () => {
 
  const params = {
    Message: 'Hi',
    TopicArn: snsTopicARN
};
await sns.publish(params).promise();
  
const dynamoParams = {
  
  TableName: TABLE_NAME
};
  const dynamo = new AWS.DynamoDB();
  const data = await dynamo.scan(dynamoParams).promise();
  expect(data.Items[0].message.S).toBe(params.Message)
});
});