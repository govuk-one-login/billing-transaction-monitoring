const AWS = require("aws-sdk");

AWS.config.update({
  region: "eu-west-2",
});

const sns = new AWS.SNS();
const snsTopicARN = process.env["SNS_TOPIC_ARN"];
const TABLE_NAME = process.env["TABLENAME"];
const sqs = new AWS.SQS();
const cloudwatchlogs = new AWS.CloudWatchLogs();

const snsPayload = {
  Message: "SNS message auto tests" + new Date().getTime(), //added timestamp to generate unique message each time
  TopicArn: snsTopicARN,
};

//basic tests are added tests will be leveraged when testing individual build tickets
//below tests is commented as still dynamodb function not implemented
describe.skip("E2E tests", () => {
  test("Publish sns message and expect message to reach dynamoDB ", async () => {
    const response = await publishSNS(snsPayload);
    const dynamoParams = {
      TableName: TABLE_NAME,
    };
    const dynamo = new AWS.DynamoDB();
    const data = await dynamo.scan(dynamoParams).promise();
    expect(JSON.stringify(data.Items)).toContain(snsPayload.Message);
  });
});

describe("SNS to Lambda trigger test", () => {
  test("publish  message and check filter function lambda triggered successfully", async () => {
    const response = await publishSNS(snsPayload);
    expect(response).toHaveProperty("MessageId");
    const logs = await getFilteredEventFromLatestLogStream();
    expect(JSON.stringify(logs)).not.toContain("ERROR"); // currently this fails still filter lambda function need to be implemented */
  });
});

async function getCloudWatchLatestLogStreamName() {
  const params = {
    logGroupName: process.env["FILTER_FUNCTION_LOG_GROUP_NAME"],
    orderBy: "LastEventTime",
    descending: true,
  };
  const response = await cloudwatchlogs.describeLogStreams(params).promise();
  if (response.logStreams.length > 0) {
    const result = response.logStreams[0].logStreamName;
    return result;
  }
}

async function getFilteredEventFromLatestLogStream() {
  const params = {
    logGroupName: process.env["FILTER_FUNCTION_LOG_GROUP_NAME"],
    logStreamName: await getCloudWatchLatestLogStreamName(),
  };
  const response = await cloudwatchlogs.getLogEvents(params).promise();
  return response;
}

async function publishSNS(snsPayload) {
  const result = await sns.publish(snsPayload).promise();
  console.log("SNS event sent successfully");
  return result;
}
