import { SQSRecord } from "aws-lambda";
import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";

const sqs = new SQSClient({region: 'eu-west-2', endpoint: process.env.SQS_ENDPOINT});

export async function sendRecord(queueUrl: string, record: SQSRecord) {
  console.log("sending record " + JSON.stringify(record));
  console.log("queueurl " + JSON.stringify(queueUrl));

  const params = new SendMessageCommand({
    MessageBody: JSON.stringify(record),
    QueueUrl: queueUrl,
  });

  return sqs.send(params).then((data) => {
    console.log(data);
  }).catch(err => {
    console.log(err, err.stack);
    throw(err);
  });
}
