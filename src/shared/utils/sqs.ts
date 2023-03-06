import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";

const _sqsDeprecated = new SQSClient({
  region: "eu-west-2",
  endpoint: process.env.LOCAL_ENDPOINT,
});

export async function sendRecord(
  queueUrl: string,
  messageBody: string
): Promise<void> {
  console.log("sending messageBody " + messageBody);

  const params = new SendMessageCommand({
    MessageBody: messageBody,
    QueueUrl: queueUrl,
  });

  return await _sqsDeprecated
    .send(params)
    .then((data) => {
      console.log("SQS data", data.$metadata);
    })
    .catch((err) => {
      console.log(err, err.stack);
      throw err;
    });
}
