import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";

const sqs = new SQSClient({region: 'eu-west-2', endpoint: process.env.LOCAL_ENDPOINT});

export async function sendRecord(queueUrl: string, messageBody: string) {
  console.log("sending messageBody " + messageBody);
  console.log("queueurl " + queueUrl);

  const params = new SendMessageCommand({
    MessageBody: messageBody,
    QueueUrl: queueUrl,
  });

  return await sqs.send(params).then((data) => {
    console.log(data);
  }).catch(err => {
    console.log(err, err.stack);
    throw(err);
  });
}
