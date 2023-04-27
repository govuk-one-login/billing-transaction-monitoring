import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";
import { logger } from "./logger";

const sqs = new SQSClient({
  region: "eu-west-2",
  endpoint: process.env.LOCAL_ENDPOINT,
});

export const stringifyAndSendRecord = async <TMessage>(
  queueUrl: string,
  message: TMessage,
  options: {
    shouldLog?: boolean;
  } = {
    shouldLog: true,
  }
): Promise<void> => {
  return await sendRecord(queueUrl, JSON.stringify(message), options);
};

export async function sendRecord(
  queueUrl: string,
  messageBody: string,
  options: {
    shouldLog?: boolean;
  } = {
    shouldLog: true,
  }
): Promise<void> {
  const parsedBody = JSON.parse(messageBody);
  if (options.shouldLog && typeof parsedBody.event_id === "string") {
    logger.info(
      `Sending event ${parsedBody.event_id} to SQS queue at ${queueUrl}`
    );
  }

  const params = new SendMessageCommand({
    MessageBody: messageBody,
    QueueUrl: queueUrl,
  });

  return await sqs
    .send(params)
    .then((data) => {
      logger.info("Sent SQS command", { metadata: data.$metadata });
    })
    .catch((err) => {
      logger.error("SQS command send error", { error: err });
      throw err;
    });
}
