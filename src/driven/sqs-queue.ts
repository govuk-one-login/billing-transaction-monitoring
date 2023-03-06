import { SendMessageCommand, SQSClient } from "@aws-sdk/client-sqs";

export class SqsQueue {
  client: SQSClient;

  constructor(client: SQSClient) {
    this.client = client;
  }

  sendRecord = async (queueUrl: string, messageBody: string): Promise<void> => {
    const parsedBody = JSON.parse(messageBody);
    if (typeof parsedBody.event_id === "string") {
      console.log(
        `Sending event ${parsedBody.event_id} to SQS queue at ${queueUrl}`
      );
    }

    const params = new SendMessageCommand({
      MessageBody: messageBody,
      QueueUrl: queueUrl,
    });

    return await this.client
      .send(params)
      .then((data) => {
        console.log("SQS data", data.$metadata);
      })
      .catch((err) => {
        console.log(err, err.stack);
        throw err;
      });
  };
}
